import mongoose from "mongoose";

export interface ICredits {
    userId: mongoose.Types.ObjectId;
    credits: number;
    plan: "free" | "basic" | "pro" | "enterprise";
    lastDailyCreditReset?: Date;
    stripeCustomerId?: string;
    stripePaymentId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CreditsSchema = new mongoose.Schema<ICredits>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    credits: { type: Number, required: true, default: 0 },
    plan: {
        type: String,
        enum: ["free", "basic", "pro", "enterprise"],
        required: true,
    },
    lastDailyCreditReset: { type: Date },
    stripeCustomerId: { type: String },
    stripePaymentId: { type: String },
}, { timestamps: true })

const Credits = mongoose.models.Credits || mongoose.model<ICredits>("Credits", CreditsSchema);

export default Credits;
