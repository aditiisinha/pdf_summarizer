'use server';

import { fetchAndExtractPdfText } from '../frontend/lib/langchain';
import { generateSummaryFromOpenAi } from '../frontend/lib/openai';
import { auth, currentUser } from '@clerk/nextjs/server';
import { formatFileNameAsTitle } from '../frontend/utils/format-utils';
import { getDbConnection } from '../frontend/lib/db';

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
        file: {
          ufsUrl: string;
          name: string;
        };
      };
    }
  ]
) {
  if (!uploadResponse) {
    return {
      success: false,
      message: 'File upload failed',
      data: null,
    };
  }

  const {
    serverData: {
      userId,
      file: { ufsUrl: pdfUrl, name: fileName },
    },
  } = uploadResponse[0];

  if (!pdfUrl) {
    return {
      success: false,
      message: 'File upload failed',
      data: null,
    };
  }

  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    console.log({ pdfText });

    const summary = await generateSummaryFromOpenAi(pdfText);
    console.log({ summary });

    if (!summary) {
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
    const result = await sql`INSERT INTO pdf_summaries (
  user_id,
  original_file_url, 
  summary_text, 
  title, 
  file_name
  ) 
  VALUES (${userId}, ${fileUrl}, ${summary}, ${title}, ${fileName})
  RETURNING *;
`;
    return result;
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
    try {
      console.log("Checking if user exists in DB:", userId);
      const sql = await getDbConnection();
      const existingUser = await sql`SELECT id FROM users WHERE id = ${userId}`;

      if (existingUser.length === 0) {
        console.log("User not found in DB, creating...");
        const email = user.emailAddresses[0]?.emailAddress;
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        if (email) {
          await sql`
            INSERT INTO users (id, email, full_name, status) 
            VALUES (${userId}, ${email}, ${fullName}, 'active')
            ON CONFLICT (id) DO NOTHING
          `;
          console.log("User inserted into DB");
        } else {
          console.error("No email found for user, cannot create in DB");
        }
      } else {
        console.log("User exists in DB");
      }
    } catch (dbError) {
      console.error('Error ensuring user exists in DB:', dbError);
    }

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

    return {
      success: true,
      message: 'PDF Summary saved successfully',
    };
  } catch (error) {
    console.error("Error in storePdfSummaryAction:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Error saving pdf summary',
    };
  }
}