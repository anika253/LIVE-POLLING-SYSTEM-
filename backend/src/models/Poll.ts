import mongoose, { Schema, Document } from 'mongoose';

export interface IPollOption {
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  question: string;
  options: IPollOption[];
  duration: number; // in seconds
  startTime: Date;
  endTime: Date;
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const PollSchema = new Schema(
  {
    question: { type: String, required: true },
    options: [PollOptionSchema],
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<IPoll>('Poll', PollSchema);

