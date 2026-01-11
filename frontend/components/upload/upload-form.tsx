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

export default function UploadForm({ isLimitReached = false, planName = "Basic" }: { isLimitReached?: boolean, planName?: string }) {
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
    onUploadBegin: (fileName) => {
      toast(`📄 Uploading ${fileName}...`);
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
      const result = await generatePdfSummary(resp as any);
      const { data = null } = result || {};

      if (data) {
        let storeResult: any;
        toast('📄 Hang tight! We are saving your summary ✨');

        formRef.current?.reset();
        if (data.summary) {
          const serverData = resp[0].serverData as any;
          const pdfUrl = serverData.file?.ufsUrl || serverData.file?.url || serverData.fileUrl;

          storeResult = await storePdfSummaryAction({
            fileUrl: pdfUrl,
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

  if (isLimitReached) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 border-2 border-dashed rounded-xl border-rose-200 bg-rose-50/50">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-xl font-bold text-gray-900">Usage Limit Reached</h3>
          <p className="text-gray-600 max-w-md">
            You have reached the maximum number of uploads for your {planName} plan.
            Please upgrade to continue using Summarium.
          </p>
        </div>

        <button
          onClick={() => router.push('/pricing')}
          className="px-6 py-3 font-semibold text-white transition-all transform rounded-lg bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 hover:scale-105 shadow-lg shadow-rose-200"
        >
          Upgrade to Pro 🚀
        </button>
      </div>
    );
  }

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
