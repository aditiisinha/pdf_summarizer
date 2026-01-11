'use client';

import Link from "next/link";
import BgGradient from "../common/bg-gradient";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { plans } from "@/utils/constants";

type PriceType = {
    name: string;
    price: number;
    description?: string;
    items: string[];
    id: string;
    paymentLink?: string;
    priceId?: string;
};



const PricingCard = ({
    name,
    price,
    description,
    items,
    id,
    paymentLink,
    priceId,
}: PriceType) => {
    const handleClick = async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        e.preventDefault();
        if (!priceId) return;

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (response.status === 401) {
                // Redirect to sign-in if the user is not logged in
                window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
                return;
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Failed to create checkout session:", data.error);
            }
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    };

    return (
        <div className="relative w-full max-w-lg hover:scale-105 hover:transition-all hover:duration-300">
            <div
                className={cn(
                    "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] border-gray-500/20 rounded-2xl bg-white/50 backdrop-blur-sm",
                    id === "Pro" && "border-rose-500/80 border-2 shadow-xl shadow-rose-100"
                )}
            >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-xl lg:text-2xl font-black capitalize text-gray-900">{name}</p>
                    <p className="text-gray-500 font-medium">{description}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-end gap-2">
                        <p className="text-6xl tracking-tighter font-black text-gray-900">${price}</p>
                        <div className="flex flex-col leading-tight pb-2">
                            <p className="text-xs uppercase font-bold text-gray-500">USD</p>
                            <p className="text-xs font-semibold text-gray-400">/month</p>
                        </div>
                    </div>
                </div>

                <ul className="space-y-4 text-sm font-medium text-gray-600 my-4">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                <ArrowRight size={12} className="text-rose-600" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>

                <div className="mt-auto pt-4">
                    <button
                        onClick={handleClick}
                        className={cn(
                            "inline-flex items-center justify-center gap-2 w-full text-center py-4 px-8 rounded-xl font-bold transition-all duration-300 transform active:scale-95",
                            id === "Pro"
                                ? "bg-rose-600 text-white shadow-lg shadow-rose-200 hover:bg-rose-700 hover:shadow-rose-300"
                                : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                    >
                        Get Started <ArrowRight size={18} />
                    </button>
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
