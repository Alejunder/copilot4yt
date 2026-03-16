import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type Plan = "basic" | "pro" | "enterprise";

const PLAN_PRICE_IDS: Record<Plan, string> = {
    basic: process.env.STRIPE_BASIC_PRICE as string,
    pro: process.env.STRIPE_PRO_PRICE as string,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE as string,
};

export const createCheckoutSession = async (
    plan: Plan,
    email: string
): Promise<string> => {
    const priceId = PLAN_PRICE_IDS[plan];

    const clientUrl = (process.env.CLIENT_URL ?? "").replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${clientUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/pricing`,
        metadata: { plan },
    });

    return session.url as string;
};

export const retrieveCheckoutSession = async (sessionId: string): Promise<Stripe.Checkout.Session> => {
    return stripe.checkout.sessions.retrieve(sessionId);
};

export const constructWebhookEvent = (
    payload: Buffer,
    signature: string,
    secret: string
): Stripe.Event => {
    return stripe.webhooks.constructEvent(payload, signature, secret);
};
