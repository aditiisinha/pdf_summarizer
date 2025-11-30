'use server';

import { fetchAndExtractPdfText } from '../frontend/lib/langchain';
import { generateSummaryFromOpenAi } from '../frontend/lib/openai';

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

    return {
      success: true,
      message: 'Summary generated successfully',
      data: {
        userId,
        fileName,
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
