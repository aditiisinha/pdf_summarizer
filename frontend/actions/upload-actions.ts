'use server';

import { fetchAndExtractPdfText } from 'lib/langchain';
import { generateSummaryFromOpenAi } from 'lib/openai';
import { auth, currentUser } from '@clerk/nextjs/server';
import { formatFileNameAsTitle } from 'utils/format-utils';
import { getDbConnection } from 'lib/db';
import { revalidatePath } from 'next/cache';
import { syncUser } from '@/lib/users';

interface StorePdfSummaryArgs {
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfSummary(
  uploadResponse: [
    {
      serverData: {
        userId: string;
        fileUrl: string;
        fileName: string;
      };
    }
  ]
) {
  if (!uploadResponse || !uploadResponse[0]) {
    console.error("No upload response or empty array received");
    return {
      success: false,
      message: 'File upload failed: No response from server',
      data: null,
    };
  }

  const { serverData } = uploadResponse[0];

  if (!serverData) {
    console.error("Missing serverData in upload response:", JSON.stringify(uploadResponse[0], null, 2));
    return {
      success: false,
      message: 'File upload failed: Server processing data missing',
      data: null,
    };
  }

  const {
    userId,
    fileUrl: pdfUrl,
    fileName,
  } = serverData;

  if (!pdfUrl) {
    console.error("Missing fileUrl in serverData:", JSON.stringify(serverData, null, 2));
    return {
      success: false,
      message: 'File upload failed: File URL not found',
      data: null,
    };
  }

  try {
    console.log("Starting PDF extraction for:", pdfUrl);
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    console.log("PDF extraction complete, length:", pdfText?.length);

    console.log("Starting OpenAI summary generation...");
    const summary = await generateSummaryFromOpenAi(pdfText);
    console.log("OpenAI summary generated, length:", summary?.length);

    if (!summary) {
      console.error("Summary is null or empty");
      return {
        success: false,
        message: 'Failed to generate summary',
        data: null,
      };
    }

    const formattedfileName = formatFileNameAsTitle(fileName)

    return {
      success: true,
      message: 'Summary generated successfully',
      data: {
        title: formattedfileName,
        summary,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: 'File upload failed',
      data: null,
    };
  }
}

async function savePdfSummary(
  {
    userId,
    fileUrl,
    summary,
    title,
    fileName,
  }: {
    userId: string;
    fileUrl: string;
    summary: string;
    title: string;
    fileName: string;
  }) {

  try {
    const sql = await getDbConnection();
    const [savedSummary] = await sql`INSERT INTO pdf_summaries (
    user_id,
    original_file_url, 
    summary_text, 
    title, 
    file_name
    ) 
  VALUES (${userId}, ${fileUrl}, ${summary}, ${title}, ${fileName})
  RETURNING id, summary_text;
`;
    return savedSummary;
  } catch (error) {
    console.error('Error saving PDF summary', error);
    throw error;
  }
}

export async function storePdfSummaryAction(
  {
    fileUrl,
    summary,
    title,
    fileName,
  }: StorePdfSummaryArgs
) {
  let savedSummary: any;

  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("User not authenticated");
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Ensure user exists in DB
    await syncUser();

    console.log("Saving PDF summary...");
    savedSummary = await savePdfSummary(
      {
        userId,
        fileUrl,
        summary,
        title,
        fileName,
      }
    );
    console.log("Saved summary result:", savedSummary);

    if (!savedSummary) {
      return {
        success: false,
        message: 'Failed to save summary, please try again',
      };
    }


  } catch (error) {
    console.error("Error in storePdfSummaryAction:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error saving pdf summary',
    };
  }

  //Revalidate our cache
  revalidatePath(`/summaries/${savedSummary.id}`);
  return {
    success: true,
    message: 'PDF Summary saved successfully',
    data: {
      id: savedSummary.id,
    }
  };
}