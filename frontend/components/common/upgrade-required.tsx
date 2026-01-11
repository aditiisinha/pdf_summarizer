import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";

export default function UpgradeRequired() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Upgrade Required</CardTitle>
                    <CardDescription className="text-gray-500 mt-2">
                        You've discovered a premium feature! To continue using Summarium and explore all its capabilities, you'll need an active plan.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                    <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Unlimited PDF summaries</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Priority processing for large files</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Advanced analysis & key insights</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2 pb-8 px-6">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 transition-all duration-300 transform hover:scale-[1.02]">
                        <Link href="/pricing">View Plans & Upgrade</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}