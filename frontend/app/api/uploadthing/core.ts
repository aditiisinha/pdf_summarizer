import { currentUser } from "@clerk/nextjs/server";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing , type FileRouter } from "uploadthing/next";


const f = createUploadthing();

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: '32MB'} })
    .middleware(async ({ req }) => {
        const user = await currentUser();
        if(!user) throw new UploadThingError("Unauthorized");
        return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
    try {
        console.log('Upload completed:', {
            userId: metadata?.userId,
            url: file.url
        });

        return {
            userId: metadata?.userId ?? null,
            fileUrl: file.url
        };
    } catch (err) {
        console.error("Upload callback failed:", err);
        throw err;
    }
}),

}satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;