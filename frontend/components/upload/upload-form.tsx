'use client';

import { generatePdfSummary, storePdfSummaryAction } from '@/actions/upload-actions';
import UploadFormInput from '@/components/upload/upload-form-input';
import { useUploadThing } from '@/utils/uploadthing';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  file: z
    .instanceof(File, { message: 'Invalid file' })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      'File must be less than 20MB'
    )
    .refine(
      (file) => file.type.startsWith('application/pdf'),
      'File must be a PDF'
    ),
});

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {
      toast.success('Upload completed ✅');
    },
    onUploadError: (err) => {
      console.log('Upload error:', err);
      toast.error('Error occurred while uploading');
    },
    onUploadBegin: ({ file }) => {
      toast('📄 Uploading file...');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get('file') as File;

      // Validate input
      const validatedFields = schema.safeParse({ file });
      if (!validatedFields.success) {
        toast.error(
          validatedFields.error.flatten().fieldErrors.file?.[0] || 'Invalid file'
        );
        return;
      }

      toast('Please wait while we process your PDF ✨');

      // Upload file
      const resp = await startUpload([file]);
      if (!resp) {
        toast.error('❌ Upload failed');
        return;
      }

      // Generate summary
      const result = await generatePdfSummary(resp);
      const { data = null } = result || {};

      if (data) {
        let storeResult: any;
        toast.custom(() => (
          <div className="flex flex-col">
            <span className="font-semibold">📄 Saving PDF</span>
            <span className="text-sm opacity-80">
              Hang tight! We are saving your summary ✨
            </span>
          </div>
        ));

        formRef.current?.reset();
        if (data.summary) {
          storeResult = await storePdfSummaryAction({
            fileUrl: resp[0].serverData.file.ufsUrl,
            summary: data.summary,
            title: data.title,
            fileName: file.name,
          });

          toast('📄 Summary generated,Your PDF has been successfully summarized and saved ✨');

          formRef.current?.reset();

          //to do: redirect to [id] summary page 
          router.push(`/summaries/${storeResult.data.id}`);

        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Unexpected error:', error);
      toast.error('Something went wrong');
      formRef.current?.reset();
    } finally {
      // always stop loading
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput
        isLoading={isLoading}
        ref={formRef}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
