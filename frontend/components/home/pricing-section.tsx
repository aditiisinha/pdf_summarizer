'use client';

import Link from "next/link";
import BgGradient from "../common/bg-gradient";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type PriceType = {
    name: string;
    price: number;
    description?: string;
    items: string[];
    id: string;
    paymentLink?: string;
    priceId?: string;
};

const plans: PriceType[] = [
    {
        name: "Basic",
        price: 11,
        description: "Perfect for occasional use",
        items: [
            "5 PDF summaries per month",
            "Standard PDF processing",
            "Email support",
        ],
        id: "Basic",
        paymentLink: "",
        priceId: "",
    },
    {
        name: "Pro",
        price: 51,
        description: "For professionals and teams",
        items: [
            "Unlimited PDF summaries per month",
            "Priority processing",
            "24/7 support",
        ],
        id: "Pro",
        paymentLink: "",
        priceId: "",
    },
];

const PricingCard = ({
    name,
    price,
    description,
    items,
    id,
    paymentLink,
    priceId,
}: PriceType) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!paymentLink) {
            e.preventDefault();
            console.log('Payment link not available');
        }
    };

    return (
        <div className="relative w-full max-w-lg hover:scale-105 hover:transition-all hover:duration-300">
            <div
                className={cn(
                    "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] border-gray-500/20 rounded-2xl",
                    id === "Pro" && "hover:border-rose-500/80 border-2 transition-colors"
                )}
            >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
                    <p className="text-base-content/80">{description}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-end gap-2">
                        <p className="text-5xl tracking-tight font-extrabold">{price}</p>
                        <div className="flex flex-col leading-tight">
                            <p className="text-xs uppercase font-semibold">INR</p>
                            <p className="text-xs">/month</p>
                        </div>
                    </div>
                </div>

                <ul className="list-disc list-inside space-y-1 text-sm">
                    {items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

                <div className="space-y-2 flex justify-center w-full">
                    <Link
                        href={paymentLink || '#'}
                        aria-label={`Get started with ${name} plan`}
                        className="inline-flex items-center justify-center gap-2 w-full text-center py-3 px-6 
                        rounded-full font-semibold bg-rose-600 text-white"
                        onClick={handleClick}
                    >
                        Buy Now <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function PricingSection() {
    return (
        <BgGradient>
            <section className="relative overflow-hidden">
                <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-bold text-2xl uppercase mb-8 text-rose-500">
                            Pricing
                        </h2>
                    </div>

                    <div
                        className="relative flex justify-center flex-col lg:flex-row items-center 
                        lg:items-stretch gap-8"
                    >
                        {plans.map((plan) => (
                            <div key={plan.id} className="w-full">
                                <PricingCard {...plan} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </BgGradient>
    );
}
