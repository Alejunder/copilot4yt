import { Request, Response } from "express";
import Stripe from "stripe";
import User from "../models/User";
import Credits from "../models/Credits";
import {
    createCheckoutSession as stripeCreateCheckoutSession,
    constructWebhookEvent,
    retrieveCheckoutSession,
} from "../services/stripeService";
import type { Plan } from "../configs/planBenefits.js";

const VALID_PLANS: Plan[] = ["basic", "pro", "enterprise"];

const PLAN_CREDITS: Record<Exclude<Plan, 'free'>, number> = {
    basic: 500,
    pro: 1100,
    enterprise: 2800,
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Checks whether the user's paid plan has expired.
 * If it has, downgrades plan to "free" in both User and Credits documents.
 */
async function checkAndExpirePlan(userId: string): Promise<void> {
    const user = await User.findById(userId).select("plan planExpiresAt");
    if (!user || user.plan === "free") return;
    if (user.planExpiresAt && user.planExpiresAt < new Date()) {
        await User.findByIdAndUpdate(userId, { $set: { plan: "free", planExpiresAt: null } });
        await Credits.findOneAndUpdate({ userId }, { $set: { plan: "free" } });
    }
}

export const createCheckoutSession = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { plan } = req.body as { plan: Plan };

        if (!plan || !VALID_PLANS.includes(plan)) {
            res.status(400).json({ message: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}.` });
            return;
        }

        const userId = (req as any).userId;
        const user = await User.findById(userId).select("email");

        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const url = await stripeCreateCheckoutSession(plan, user.email);

        res.status(200).json({ message: "Checkout session created.", data: { url } });
    } catch (error) {
        console.error("createCheckoutSession error:", error);
        res.status(500).json({ message: "Failed to create checkout session." });
    }
};

export const getCredits = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).userId;

        // Expire plan if 30-day window has passed
        await checkAndExpirePlan(userId);

        let creditsDoc = await Credits.findOne({ userId });

        // Initialize free users with 20 credits on first access
        if (!creditsDoc) {
            creditsDoc = await Credits.create({
                userId,
                credits: 20,
                plan: "free",
                lastDailyCreditReset: new Date(),
            });
        } else if (creditsDoc.plan === "free") {
            // Apply daily reset if 24h have passed
            const now = Date.now();
            const lastReset = creditsDoc.lastDailyCreditReset ? creditsDoc.lastDailyCreditReset.getTime() : 0;
            if (now - lastReset > 24 * 60 * 60 * 1000) {
                creditsDoc.credits = 20;
                creditsDoc.lastDailyCreditReset = new Date();
                await creditsDoc.save();
            }
        }

        const user = await User.findById(userId).select("planExpiresAt");

        let planExpiresAt: Date | null = user?.planExpiresAt ?? null;

        // One-time migration: backfill planExpiresAt for paid users who pre-date this feature
        if (!planExpiresAt && creditsDoc.plan !== "free") {
            const paymentDate: Date = (creditsDoc as any).updatedAt ?? new Date();
            planExpiresAt = new Date(paymentDate.getTime() + THIRTY_DAYS_MS);
            await User.findByIdAndUpdate(userId, { $set: { planExpiresAt } });
        }

        res.status(200).json({
            message: "Credits retrieved.",
            data: {
                credits: creditsDoc.credits,
                plan: creditsDoc.plan,
                planExpiresAt,
            },
        });
    } catch (error) {
        console.error("getCredits error:", error);
        res.status(500).json({ message: "Failed to retrieve credits." });
    }
};

export const handleStripeWebhook = async (
    req: Request,
    res: Response
): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;
    try {
        event = constructWebhookEvent(req.body as Buffer, sig, webhookSecret);
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error);
        res.status(400).json({ message: "Webhook signature verification failed." });
        return;
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            // Only credit users for confirmed payments
            if (session.payment_status !== "paid") {
                res.status(200).json({ message: "Webhook received." });
                return;
            }

            const email = session.customer_email ?? session.customer_details?.email;
            const plan = session.metadata?.plan as Exclude<Plan, 'free'> | undefined;
            const paymentId = typeof session.payment_intent === "string"
                ? session.payment_intent
                : undefined;

            if (!email || !plan || !PLAN_CREDITS[plan]) {
                console.error("Webhook: missing email or plan in session", session.id);
                res.status(200).json({ message: "Webhook received." });
                return;
            }

            const user = await User.findOne({ email }).select("_id");
            if (!user) {
                console.error(`Webhook: no user found for email ${email}`);
                res.status(200).json({ message: "Webhook received." });
                return;
            }

            const stripeCustomerId = typeof session.customer === "string" ? session.customer : undefined;

            // Idempotency: skip if this exact payment was already applied
            if (paymentId) {
                const alreadyApplied = await Credits.findOne({ userId: user._id, stripePaymentId: paymentId });
                if (alreadyApplied) {
                    res.status(200).json({ message: "Webhook received." });
                    return;
                }
            }

            // Sync plan to User document (single source of truth for plan)
            await User.findByIdAndUpdate(user._id, {
                $set: {
                    plan,
                    planExpiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
                    ...(stripeCustomerId && { stripeCustomerId }),
                },
            });

            await Credits.findOneAndUpdate(
                { userId: user._id },
                {
                    $inc: { credits: PLAN_CREDITS[plan] },
                    $set: { plan, ...(paymentId && { stripePaymentId: paymentId }) },
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({ message: "Webhook processed." });
    } catch (error) {
        console.error("Stripe webhook processing error:", error);
        res.status(500).json({ message: "Webhook processing failed." });
    }
};

/**
 * Called immediately when the user lands on /dashboard?session_id=...
 * Verifies the Stripe session directly (no webhook timing dependency) and
 * applies the plan + credits if not already applied.
 */
export const verifySession = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { session_id } = req.query as { session_id?: string };
        if (!session_id) {
            res.status(400).json({ message: "session_id is required." });
            return;
        }

        const userId = (req as any).userId;
        const session = await retrieveCheckoutSession(session_id);

        if (session.payment_status !== "paid") {
            res.status(200).json({ message: "Payment not yet confirmed.", data: { upgraded: false } });
            return;
        }

        const plan = session.metadata?.plan as Exclude<Plan, "free"> | undefined;
        if (!plan || !PLAN_CREDITS[plan]) {
            res.status(400).json({ message: "Invalid plan in session." });
            return;
        }

        const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;

        // Idempotency: skip if this exact payment was already applied
        if (paymentId) {
            const alreadyApplied = await Credits.findOne({ userId, stripePaymentId: paymentId });
            if (alreadyApplied) {
                res.status(200).json({ message: "Already applied.", data: { upgraded: true, plan } });
                return;
            }
        }

        const stripeCustomerId = typeof session.customer === "string" ? session.customer : undefined;

        await User.findByIdAndUpdate(userId, {
            $set: { plan, planExpiresAt: new Date(Date.now() + THIRTY_DAYS_MS), ...(stripeCustomerId && { stripeCustomerId }) },
        });

        await Credits.findOneAndUpdate(
            { userId },
            {
                $inc: { credits: PLAN_CREDITS[plan] },
                $set: { plan, ...(paymentId && { stripePaymentId: paymentId }) },
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Plan upgraded successfully.", data: { upgraded: true, plan } });
    } catch (error) {
        console.error("verifySession error:", error);
        res.status(500).json({ message: "Failed to verify session." });
    }
};
