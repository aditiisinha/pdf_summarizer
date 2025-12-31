import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryCard from '@/components/summaries/summary-card';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getSummaries } from '@/lib/summaries';

export default async function DashboardPage() {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
        return redirect('/sign-in');
    }

    const uploadLimit = 5;
    const summaries = await getSummaries(userId);
    
    return (
        <main className="min-h-screen">
            <div className="container mx-auto flex-col gap-4">
                <div className="px-2 py-12 sm:py-24">
                    <div className="flex gap-4 mb-8 justify-between">
                        <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-bold 
                        tracking-tight bg-linear-to-r from-gray-800 to-gray-900 
                        bg-clip-text text-transparent">Your Summaries</h1>
                        <p className="text-lg text-gray-600">Transform your PDFs into concise summaries</p>
                    </div>
                    <Button 
                    variant={'link'}
                    className="bg-linear-to-r from-rose-500 to-rose-700 hover:from-rose-600
                    hover:to-rose-800 hover:scale-105 transition-all duration-300 
                    group hover:no-underline">
                        <Link href="/upload" className="flex items-center text-white">
                        <Plus className="w-5 h-5 mr-2" />
                        New Summary 
                        </Link>
                    </Button>
                </div>
                <div className="mb-6">
                    <div className="bg-rose-50 border border-rose-200 
                    rounded-lg p-4 text-rose-800">
                        <p className="text-sm">
                           You have reached the limit of {uploadLimit} uploads on the Basic plan.{' '}
                          <Link href="/#pricing"
                            className="text-rose-600 underline font-medium underline-offset-4
                            inline-flex items-center">
                            Upgrade to Pro{' '}
                            <ArrowRight className="w-4 h-4 inline-block" /> 
                          </Link>{' '}
                          for unlimited uploads.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6
                md:grid-cols-2 lg:grid-cols-3 sm:px-0">
                    {summaries.map((summary, index) => (
                        <SummaryCard key={index} summary={summary} />
                    ))}
                    </div>
            </div>
            </div>
            
        </main>
    );
}