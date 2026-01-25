import type { IFeature } from "../types";
import { Zap, Image, Layers } from "lucide-react";

export const featuresData: IFeature[] = [
    {
        icon: <Zap className="size-8 text-red-500" />,
        title: "Lightning-fast setup",
        description: "Our AI analyzes video content to suggest the most clickable concepts.",
    },
    {
        icon: <Image className="size-8 text-red-500" />,
        title: "Eye-Catching Designs",
        description: "Generate vibrant, high-contrast thumbnails that stand out in the feed",
    },
    {
        icon: <Layers className="size-8 text-red-500" />,
        title: "Fully Editable",
        description: "Get fully layered designs you can tweak to perfection if needed",
    },
];