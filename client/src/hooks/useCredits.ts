import { useEffect, useState } from "react";
import api from "../configs/api";

interface UseCreditsResult {
    credits: number;
    plan: string;
    loading: boolean;
    error: string | null;
}

export default function useCredits(): UseCreditsResult {
    const [credits, setCredits] = useState<number>(0);
    const [plan, setPlan] = useState<string>("free");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get("/api/billing/credits")
            .then(({ data }) => {
                setCredits(data.data.credits);
                setPlan(data.data.plan);
            })
            .catch((err) => {
                setError(err.response?.data?.message ?? "Failed to load credits.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { credits, plan, loading, error };
}
