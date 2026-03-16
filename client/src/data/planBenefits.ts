export type Plan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface PlanBenefits {
    label: string;
    description: string;
    referenceImageAllowed: boolean;
    dailyCredits: number | null;
    features: string[];
}

export const PLAN_BENEFITS: Record<Plan, PlanBenefits> = {
    free: {
        label: 'Free',
        description: '20 credits reset every 24 hours',
        referenceImageAllowed: false,
        dailyCredits: 20,
        features: [
            '20 daily credits (reset every 24 h)',
            'Standard Gemini 2.5 Flash model',
            'Community support',
        ],
    },
    basic: {
        label: 'Basic',
        description: '500 credits + 1-month model access',
        referenceImageAllowed: true,
        dailyCredits: null,
        features: [
            '500 one-time credits (never expire)',
            '1-month access to Gemini 3.1 Flash model',
            'Reference image uploads',
            'Email support',
        ],
    },
    pro: {
        label: 'Pro',
        description: '1,100 credits + 1-month full model access',
        referenceImageAllowed: true,
        dailyCredits: null,
        features: [
            '1,100 one-time credits (never expire)',
            '1-month access to all models incl. Gemini 3 Pro',
            'Reference image uploads',
            'Priority support',
        ],
    },
    enterprise: {
        label: 'Enterprise',
        description: '2,800 credits + 1-month full model access',
        referenceImageAllowed: true,
        dailyCredits: null,
        features: [
            '2,800 one-time credits (never expire)',
            '1-month access to all models incl. Gemini 3 Pro',
            'Reference image uploads',
            'Dedicated support',
        ],
    },
};
