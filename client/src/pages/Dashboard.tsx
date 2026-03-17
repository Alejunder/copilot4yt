import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useCredits from "../hooks/useCredits";
import SoftBackdrop from "../components/SoftBackdrop";
import { CreditCardIcon, SparklesIcon, CheckIcon } from "lucide-react";
import { PLAN_BENEFITS, type Plan } from "../data/planBenefits";
import api from "../configs/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Dashboard() {
    const { credits: hookCredits, plan: hookPlan, loading: hookLoading, error } = useCredits();
    const { fetchCredits } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const [verifiedCredits, setVerifiedCredits] = useState<number | null>(null);
    const [verifiedPlan, setVerifiedPlan] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) return;

        setVerifying(true);
        api.get(`/api/billing/verify-session?session_id=${sessionId}`)
            .then(async ({ data }) => {
                if (data.data?.upgraded) {
                    const [fresh] = await Promise.all([
                        api.get("/api/billing/credits"),
                        fetchCredits(),
                    ]);
                    setVerifiedCredits(fresh.data.data.credits);
                    setVerifiedPlan(fresh.data.data.plan);
                    toast.success(t('dashboard.upgradeSuccess'));
                }
            })
            .catch(() => {
                toast.error(t('dashboard.verifyFailed'));
            })
            .finally(() => {
                setVerifying(false);
                navigate("/dashboard", { replace: true });
            });
    }, []);

    const loading = hookLoading || verifying;
    const credits = verifiedCredits ?? hookCredits;
    const plan = verifiedPlan ?? hookPlan;
    const benefits = PLAN_BENEFITS[(plan as Plan) ?? "free"];

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 md:px-16 lg:px-24 xl:px-32">
            <SoftBackdrop />
            <h1 className="text-3xl font-semibold mb-2">{t('dashboard.title')}</h1>
            <p className="text-slate-400 mb-10">{t('dashboard.subtitle')}</p>

            <div className="max-w-sm bg-red-950/30 border border-red-950 rounded-xl p-8 flex flex-col gap-6">
                {loading ? (
                    <p className="text-slate-400 text-sm animate-pulse">
                        {verifying ? t('dashboard.verifyingPayment') : t('dashboard.loadingCredits')}
                    </p>
                ) : error ? (
                    <p className="text-red-400 text-sm">{error}</p>
                ) : (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="bg-red-950 p-3 rounded-lg">
                                <SparklesIcon className="size-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-0.5">{t('dashboard.creditsLabel')}</p>
                                <p className="text-2xl font-semibold">{credits.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-red-950 p-3 rounded-lg">
                                <CreditCardIcon className="size-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-0.5">{t('dashboard.currentPlanLabel')}</p>
                                <p className="text-lg font-semibold capitalize">{benefits.label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{benefits.description}</p>
                            </div>
                        </div>

                        <div className="border-t border-red-950 pt-4">
                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">{t('dashboard.planIncludes')}</p>
                            <ul className="space-y-2">
                                {benefits.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckIcon className="size-4 text-red-400 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}

                <button
                    onClick={() => navigate("/pricing")}
                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 transition-all rounded-md font-medium mt-2"
                >
                    {plan === "free" ? t('dashboard.upgradeButton') : t('dashboard.buyMoreCredits')}
                </button>
            </div>
        </div>
    );
}
