import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
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
          group-hover:bg-rose-300"
        >
          <Sparkles className="!h-6 !w-6 flex-shrink-0 mr-2 text-rose-600 animate-pulse" />


          <p className="text-base text-rose-600">Powered by AI</p>
        </Badge>
      </div>
    </div>

                <h1>
                 Transform your PDFs into concise summaries with ease.
                </h1>
                <h2>
                 Get a beautiful summary reel of the documents in seconds.
                 
                </h2>
                <div className="pt-2">
                    <Button size="lg">Try Summarium</Button>
                </div>
            </div>
        </section>
    );
}