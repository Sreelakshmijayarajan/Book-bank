import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    bookTitle: { type: String, required: true },
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Fulfilled', 'Cancelled'], default: 'Active' },
    requestDate: { type: String, required: true },
  },
  { timestamps: true }
);

export const Reservation = mongoose.model('Reservation', reservationSchema);
