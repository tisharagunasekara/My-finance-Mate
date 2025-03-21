import mongoose, { Document, Schema } from 'mongoose';

interface IGoal extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  status: 'in progress' | 'achieved';
  notes?: string;
}

const goalSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goalName: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['in progress', 'achieved'],
      default: 'in progress',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGoal>('Goal', goalSchema);