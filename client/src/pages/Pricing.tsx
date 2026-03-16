import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { pricingData } from "../data/pricing";
import type { IPricing } from "../types";
import SectionTitle from "../components/SectionTitle";

type Plan = "basic" | "pro" | "enterprise";

const planKey: Record<string, Plan> = {
    Basic: "basic",
    Pro: "pro",
    Enterprise: "enterprise",
};

export default function Pricing() {
    const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

    const handleGetStarted = async (planName: string) => {
        const plan = planKey[planName];
        if (!plan) return;

        setLoadingPlan(plan);
        try {
            const { data } = await api.post("/api/billing/checkout", { plan });
            window.location.href = data.data.url;
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen px-4 md:px-16 lg:px-24 xl:px-32 py-24">
            <SectionTitle
                text1="Pricing"
                text2="Simple Pricing"
                text3="Choose the plan that fits your creation schedule. Cancel anytime."
            />

            <div className="flex flex-wrap items-center justify-center gap-8 mt-20">
                {pricingData.map((plan: IPricing, index: number) => (
                    <motion.div
                        key={index}
                        className={`w-72 text-center border border-red-950 p-6 pb-10 rounded-xl ${plan.mostPopular ? "bg-red-950 relative" : "bg-red-950/30"}`}
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {plan.mostPopular && (
                            <p className="absolute px-3 text-sm -top-3.5 left-3.5 py-1 bg-red-400 rounded-full">
                                Most Popular
                            </p>
                        )}
                        <p className="font-semibold">{plan.name}</p>
                        <h1 className="text-3xl font-semibold">
                            ${plan.price}
                            <span className="text-gray-500 font-normal text-sm">/{plan.period}</span>
                        </h1>
                        <ul className="list-none text-slate-300 mt-6 space-y-2 text-left">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <CheckIcon className="size-3.5 text-red-600 shrink-0" />
                                    <p className="text-xs">{feature}</p>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            disabled={loadingPlan !== null}
                            onClick={() => handleGetStarted(plan.name)}
                            className={`w-full py-2.5 rounded-md font-medium mt-7 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${plan.mostPopular ? "bg-white text-red-600 hover:bg-slate-200" : "bg-red-500 hover:bg-red-600"}`}
                        >
                            {loadingPlan === planKey[plan.name] ? "Redirecting..." : "Get Started"}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
