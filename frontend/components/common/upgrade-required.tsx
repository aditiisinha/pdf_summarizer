import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";

export default function UpgradeRequired() {
    return (
        <div className="flex items-center justify-center py-12 p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600" />

                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-rose-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Upgrade Required</CardTitle>
                    <CardDescription className="text-gray-500 mt-2">
                        You've discovered a premium feature! To continue using Summarium and for unlimited pdf summaries, you will need a pro plan.
                    </CardDescription>
                </CardHeader>



                <CardFooter className="flex flex-col gap-3 pt-2 pb-8 px-6">
                    <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-6 shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all duration-300 transform hover:scale-[1.02]">
                        <Link href="/pricing">View Plans & Upgrade</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}