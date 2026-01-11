import BgGradient from "@/components/common/bg-gradient";
import UploadHeader from "@/components/upload/upload-header";
import UploadForm from "@/components/upload/upload-form";
import { syncUser } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function UploadPage(props: {
    searchParams: Promise<{ session_id?: string }>;
}) {
    const searchParams = await props.searchParams;
    const { session_id } = searchParams;

    if (session_id) {
        await syncUser(session_id);
        redirect('/upload');
    }

    return (
        <BgGradient>
            <section className="min-h-screen">
                <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 lg:px-8">

                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                        <UploadHeader />
                        <UploadForm />
                    </div>
                </div>
            </section>
        </BgGradient>
    );
}