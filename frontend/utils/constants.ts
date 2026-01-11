import { isDev } from "./helpers";

export const plans = [
    {
        name: "Basic",
        price: 1,
        description: "Perfect for occasional use",
        items: [
            "5 PDF summaries per month",
            "Standard PDF processing",
            "Email support",
        ],
        id: "basic",
        paymentLink: isDev
            ? 'https://buy.stripe.com/test_6oUdR9gvH4GF94JcaRdEs00'
            : '',
        priceId: isDev
            ? 'price_1SmhnXFLYKZxhiO1Qkv5quGU'
            : '',
    },
    {
        name: "Pro",
        price: 11,
        description: "For professionals and teams",
        items: [
            "Unlimited PDF summaries per month",
            "Priority processing",
            "24/7 support",
        ],
        id: "pro",
        paymentLink: isDev
            ? 'https://buy.stripe.com/test_cNicN5gvH4GF6WBgr7dEs01'
            : '',
        priceId: isDev
            ? 'price_1SmhpXFLYKZxhiO1y3eRtwJm'
            : '',
    },
];