import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
    return (
        <section className="w-full py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center space-y-6">
        <div className="flex justify-center">
         {/* gradient border with animated background */}
         <div className="relative p-[1px] overflow-hidden rounded-full bg-gradient-to-r
          from-rose-200 via-rose-500 to-rose-800 animate-gradient-x group">
        {/* the actual badge */}
        <Badge
          variant="secondary"
          className="relative flex items-center justify-center px-6 py-2 text-base font-medium 
          bg-white rounded-full transition-colors duration-300 ease-in-out 
          group-hover:bg-rose-200"
        >
        <Sparkles className="!h-6 !w-6 flex-shrink-0 mr-2 text-rose-600 animate-pulse" />
        <p className="text-base text-rose-600">Powered by AI</p>
        </Badge>
        </div>
        </div>

        <h1 className="py-6 font-bold text-center relative inline-block">
        Transform your PDFs into <br />
        <span className="relative inline-block">
        <span className="relative z-10">concise</span>
        <span
        className="absolute inset-0 bg-rose-300/50 -rotate-2 rounded-lg transform -skew-y-1"
        aria-hidden="true"
        ></span>
        </span>{' '}
        summaries with ease.
        </h1>
                <h2 className="text-lg sm:text-xl lg:text-2xl text-center px-4 lg:px-0 lg:max-4-xl text-gray-600">
                 Get a beautiful summary reel of the documents in seconds.
                </h2>
                
                <div>
                 <Button
                  variant="link"
                  className="!rounded-full border-none mt-6 text-white text-base sm:text-lg lg:text-xl 
                  px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 
                  lg:mt-16 bg-gradient-to-r from-slate-900 to-rose-600 
                 hover:from-rose-500 hover:to-slate-900 
                  hover:no-underline font-bold shadow-lg transition-all duration-300"
    >
      <Link href="/#pricing" className="flex gap-2 items-center text-white no-underline">
         <span className="text-sm sm:text-base lg:text-lg font-semibold text-white">
        Try Summarium
      </span>
        <ArrowRight className="animate-pulse text-white" />
      </Link>
    </Button>
    </div>

        </div>
        </section>
    );
}