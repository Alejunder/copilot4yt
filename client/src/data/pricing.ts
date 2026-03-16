import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 9,
        period: "500 credits",
        features: [
            "500 one-time credits (never expire)",
            "Best for starters",
            "1-month access to Gemini 3.1 Flash model",
            "Reference image uploads",
            "No watermark on downloads",
            "High-quality generation",
            "Commercial usage allowed",
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 19,
        period: "1100 credits",
        features: [
            "1,100 one-time credits (never expire)",
            "Best for intermediate creators",
            "1-month access to all AI models incl. Gemini 3 Pro",
            "Reference image uploads",
            "No watermark on downloads",
            "High-quality generation",
            "Commercial usage allowed",
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 49,
        period: "2800 credits",
        features: [
            "2,800 one-time credits (never expire)",
            "Best for professionals",
            "1-month access to all AI models incl. Gemini 3 Pro",
            "Reference image uploads",
            "No watermark on downloads",
            "High-quality generation",
            "Commercial usage allowed",
        ],
        mostPopular: false
    }
];