import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  studentId: string;
  optionIndex: number;
  createdAt: Date;
}

const VoteSchema = new Schema(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    studentId: { type: String, required: true },
    optionIndex: { type: Number, required: true },
  },
  { timestamps: true }
);

// Ensure one vote per student per poll
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);

