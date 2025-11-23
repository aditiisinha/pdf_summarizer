'use client';

import UploadFormInput from '@/components/upload/upload-form-input';
import { useUploadThing } from '@/utils/uploadthing';
import { z } from 'zod';

const schema = z.object({
    file: z.instanceof(File, { message: 'Invalid file' })
    .refine(
        (file) => file.size <= 20 * 1024 * 1024,
        'File must be less than 20MB' 
    )
    .refine(
        (file) => file.type.startsWith('application/pdf'),
        'File must be a PDF'
    ),
});

export default function UploadForm()
{
    const { startUpload, routeConfig } = useUploadThing
    ('pdfUploader', {
        onClientUploadComplete: () => {
            console.log('uploaded successfully');
        },
        onUploadError: (err) => {
            console.log('error occurred while uplaoding',err);
        },
        onUploadBegin: ({ file }) => {
            console.log('upload has started for file', file);
        },
});


    const handleSubmit = async (e:React.
        FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        console.log('submitted');
        const formData = new FormData(e.currentTarget);
        const file = formData.get('file') as File;

        //validating the fields
        const validatedFields = schema.safeParse({ file });
        console.log(validatedFields);

        if(!validatedFields.success) {
            console.log(
                validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file'
            );
            return;
        }
        const resp = await startUpload([file]);
        if (!resp) {
            return;
        }
    };


    return (
        <div className='flex flex-col gap-8 w-full max-w-2xl mx-auto'>
            <UploadFormInput onSubmit={handleSubmit} />
        </div>
    );
}
