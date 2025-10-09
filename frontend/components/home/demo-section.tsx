import { Fan } from 'lucide-react';
import BgGradient from "@/components/common/bg-gradient";
export default function DemoSection()
{
    return (
        <BgGradient>
            <section className="w-full py-12 md:py-16 lg:py-24">
                <div className="container mx-auto px-4 text-center space-y-6 lg:pt-12">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="inline-flex items-center text-center justify-center
                        p-2 rounded-2xl bg-gray-100/80 backdrop-blur-xs
                        border border-gray-500/20 mb-4"><Fan className="w-6 h-6 text-rose-500" />
                        </div>
                        <h3 className="font-bold text-3xl max-w-2xl mx-auto">
                            Watch how Summarium transfers{' '} 
                            <span className="bg-linear-to-r from-rose-500
                            to-rose-700 bg-clip-text text-transparent">
                            this Next.js course PDF into
                            </span>{' '}
                            an easy-to-read summary!
                        </h3>
                        <div className='flex justify-center items-center px-2 sm:px-4
                        lg:px-6'>
                            {/*Summary Viewer*/}
                        </div>
                    </div>
                </div>
            </section>
        </BgGradient>
    )
}