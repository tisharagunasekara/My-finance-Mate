import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
    userId: mongoose.Types.ObjectId;
    category: string;
    amount: number;
    createdAt: Date;
    title: string;
    spent: number;
    percentageUsed: number;
}

const BudgetSchema = new Schema<IBudget>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ensure ObjectId type
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    spent: { type: Number, default: 0 }, // New field for spent amount
    percentageUsed: { type: Number, default: 0 }, // New field for percentage used
    createdAt: { type: Date, default: Date.now },
    title: { type: String, required: true }
});

export default mongoose.model<IBudget>('Budget', BudgetSchema);