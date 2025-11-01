import BgGradient from "../common/bg-gradient";
import { ReactNode } from "react";
import { FileText, MoveRight, FileOutput, BrainCircuit } from "lucide-react";

type Step = {
    icon: ReactNode;
    title: string;
    description: string;
};

const steps: Step[] = [
    {
        icon: <FileText size={64} strokeWidth={1.5} />,
        title: "Upload Your PDF",
        description: "Drag and drop your PDF document here or click to upload.",
    },
    {
        icon: <BrainCircuit size={64} strokeWidth={1.5} />,
        title: "AI Analysis",
        description: "Our AI analyzes the PDF and extracts key information.",
    },
    {
        icon: <FileOutput size={64} strokeWidth={1.5} />,
        title: "Get Your Summary",
        description: "Receive a clear and concise summary of your PDF document.",
    },
];

export default function HowItWorksSection() {
    return (
        <BgGradient>
            <section className="relative py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-bold text-2xl uppercase mb-4 text-rose-600">
                            How it works
                        </h2>
                        <h3 className="font-bold text-3xl max-w-2xl mx-auto">
                            Get your PDF summarized in just three simple steps.
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto relative">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex items-stretch">
                                <StepItem {...step} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </BgGradient>
    );
}

function StepItem({ icon, title, description }: Step) {
    return (
        <div
            className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10
        hover:border-rose-500/50 transition-colors group w-full"
        >
            <div className="flex flex-col gap-4 h-full">
                <div
                    className="flex items-center justify-center h-24 w-24 mx-auto rounded-2xl 
                bg-linear-to-br from-rose-500/10 to-transparent group-hover:from-rose-500/20
                transition-colors"
                >
                    <div className="text-rose-500">{icon}</div>
                </div>

                <div className="flex flex-col flex-1 gap-1 justify-between">
                    <h4 className="text-center font-bold text-xl mb-2">{title}</h4>
                    <p className="text-center text-gray-600">{description}</p>
                </div>
            </div>
        </div>
    );
}
