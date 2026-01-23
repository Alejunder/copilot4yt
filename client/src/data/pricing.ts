import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 9,
        period: "500 credits",
        features: [
            "50 Premium AI Thumbnails",
            "Best for starters",
            "Access to all AI models",
            "No watermark on downloads",
            "High-quality",
            "Commercial usage allowed",
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 19,
        period: "1100 credits",
        features: [
            "110 Premium AI Thumbnails",
            "Best for intermediate",
            "Access to all AI models",
            "No watermark on downloads",
            "High-quality",
            "Commercial usage allowed",
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 49,
        period: "2800 credits",
        features: [
            "280 Premium AI Thumbnails",
            "Best for professionals",
            "Access to all AI models",
            "No watermark on downloads",
            "High-quality",
            "Commercial usage allowed",
        ],
        mostPopular: false
    }
];