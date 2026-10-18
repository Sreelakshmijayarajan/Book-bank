import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    copies: { type: Number, required: true, default: 1, min: 0 },
    available: { type: Number, required: true, default: 1, min: 0 },
  },
  { timestamps: true }
);

export const Book = mongoose.model('Book', bookSchema);
