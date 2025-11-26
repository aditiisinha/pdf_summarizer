'use client';

import UploadFormInput from '@/components/upload/upload-form-input';
import { useUploadThing } from '@/utils/uploadthing';
import { toast } from 'sonner';
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
  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {
      console.log('Uploaded successfully');
      toast.success('Upload completed ✅');
    },
    onUploadError: (err) => {
      console.log('Error occurred while uploading', err);
      toast.error('Error occurred while uploading');
    },
    onUploadBegin: ({ file }) => {
      console.log('Upload has started for file', file);
      toast('Uploading file...');
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    // Validate file
    const validatedFields = schema.safeParse({ file });

    if (!validatedFields.success) {
      toast.error(
        validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file'
      );
      return;
    }

    toast('Please wait while we process your PDF');

    const resp = await startUpload([file]);

    if (!resp) {
      toast.error('Upload failed');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}
