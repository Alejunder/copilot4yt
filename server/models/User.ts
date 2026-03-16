import mongoose from 'mongoose';
import type { Plan } from '../configs/planBenefits';


export interface IUser {
    name: string;
    email: string;
    password?: string;
    plan: Plan;
    /** Date when the paid plan expires. Null/undefined means free (no expiry). */
    planExpiresAt?: Date | null;
    stripeCustomerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free',
        required: true,
    },
    planExpiresAt: { type: Date, default: null },
    stripeCustomerId: { type: String },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;