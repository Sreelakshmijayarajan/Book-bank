import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
  {
    loanId: { type: String, required: true, unique: true, trim: true },
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    bookTitle: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnDate: { type: String },
    status: { type: String, enum: ['Issued', 'Returned', 'Overdue'], default: 'Issued' },
  },
  { timestamps: true }
);

export const Loan = mongoose.model('Loan', loanSchema);
