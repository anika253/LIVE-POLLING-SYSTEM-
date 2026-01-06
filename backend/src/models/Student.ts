import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  studentId: string;
  name: string;
  joinedAt: Date;
  isActive: boolean;
}

const StudentSchema = new Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);

