import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    borrowedCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  },
  { timestamps: true }
);

export const Member = mongoose.model('Member', memberSchema);
