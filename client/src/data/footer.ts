import type { IFooter } from "../types";

export const footerData: IFooter[] = [
    {
        title: "Product",
        links: [
            { name: "Contact", href: "/contact" },
            { name: "Pricing", href: "#pricing" },

        ]
    },
    {
        title: "Resources",
        links: [
            { name: "Portfolio", href: "https://alecam.dev" },
            { name: "MoodBeats Hub", href: "https://mood-beats-hub.vercel.app" },
            { name: "About", href: "/about" },
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy", href: "#privacy" },
            { name: "Terms", href: "#terms" },
        ]
    }
];