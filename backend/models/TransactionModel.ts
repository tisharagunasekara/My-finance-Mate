import mongoose, { Document, Schema } from 'mongoose';

interface ITransaction extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  notes?: string;
}

const transactionSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Convert ObjectId to string for userId and _id fields when sending to the client
transactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();  // Convert _id to string
    ret.userId = ret.userId.toString();  // Convert userId to string
    return ret;
  },
});

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
