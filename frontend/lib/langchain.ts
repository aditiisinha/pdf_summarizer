import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText(fileUrl: string) {
    try {
        console.log("Fetching PDF from URL:", fileUrl);
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        console.log("PDF fetched, blob size:", blob.size);

        const arrayBuffer = await blob.arrayBuffer();
        console.log("ArrayBuffer created, size:", arrayBuffer.byteLength);

        const loader = new PDFLoader(new Blob([arrayBuffer]));
        console.log("PDFLoader initialized");

        const docs = await loader.load();
        console.log("PDF loaded, pages:", docs.length);

        //combine all pages
        return docs.map((doc) => doc.pageContent).join('\n');
    } catch (error) {
        console.error("Error in fetchAndExtractPdfText:", error);
        throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}