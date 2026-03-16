export type Plan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface PlanBenefits {
    /** Whether the user may upload a reference image for generation. */
    referenceImageAllowed: boolean;
    /** Credits refilled every 24 h — only applies to the free plan. */
    dailyCredits: number | null;
    /** Human-readable short description shown in the UI. */
    description: string;
}

export const PLAN_BENEFITS: Record<Plan, PlanBenefits> = {
    free: {
        referenceImageAllowed: false,
        dailyCredits: 20,
        description: '20 credits reset every 24 hours',
    },
    basic: {
        referenceImageAllowed: true,
        dailyCredits: null,
        description: '500 one-time credits (never expire) + 1-month Gemini 3.1 Flash model access + reference image uploads',
    },
    pro: {
        referenceImageAllowed: true,
        dailyCredits: null,
        description: '1,100 one-time credits (never expire) + 1-month full model access + reference image uploads + priority support',
    },
    enterprise: {
        referenceImageAllowed: true,
        dailyCredits: null,
        description: '2,800 one-time credits (never expire) + 1-month full model access + reference image uploads + dedicated support',
    },
};
