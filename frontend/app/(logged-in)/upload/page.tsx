import BgGradient from "@/components/common/bg-gradient";
import UploadHeader from "@/components/upload/upload-header";
import UploadForm from "@/components/upload/upload-form";

export default function UploadPage() {
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