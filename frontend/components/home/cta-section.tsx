import Link from "next/link";;
import { Button } from "../ui/button";
import BgGradient from "../common/bg-gradient";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="bg-gray-50 py-12">
            <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center 
                space-y-4 text-center">

                    <div className="space-y-2">
                        <h2 className="font-bold text-2xl uppercase mb-4 text-rose-600">
                            Ready to Get Started?
                        </h2>
                        <h3 className="font-bold text-3xl max-w-2xl mx-auto">
                            Save Hours of Reading Time with AI
                        </h3>
                        <p
                        className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed
                        lg:text-base/relaxed xl:text-xl/relaxed
                        dark:text-gray-400">
                        Get started with our PDF Summarizer today and save valuable time reading through long documents.</p>
                    </div>


                    <div className="flex flex-col gap-2 min-[400px]:flex-row 
                    justify-center">
                        <div className="">
                        <Link 
                            href="/#pricing"
                            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 to-rose-500 hover:from-rose-500 hover:to-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-rose-500/30"
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
