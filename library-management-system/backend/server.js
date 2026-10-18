import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Book } from './models/Book.js';
import { Member } from './models/Member.js';
import { Loan } from './models/Loan.js';
import { Reservation } from './models/Reservation.js';
import { seedInitialData } from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback stores if MongoDB is not currently reachable
let fallbackBooks = [
  { _id: '1', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Programming', copies: 5, available: 3 },
  { _id: '2', title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', copies: 4, available: 2 },
  { _id: '3', title: 'Atomic Habits', author: 'James Clear', category: 'Self Development', copies: 6, available: 5 },
  { _id: '4', title: 'Database System Concepts', author: 'Silberschatz', category: 'Database', copies: 3, available: 1 },
  { _id: '5', title: 'Python Crash Course', author: 'Eric Matthes', category: 'Programming', copies: 5, available: 4 },
  { _id: '6', title: 'Introduction to Algorithms', author: 'Cormen', category: 'Algorithms', copies: 2, available: 0 },
];

let fallbackMembers = [
  { _id: '1', memberId: 'STU001', name: 'Arun Kumar', email: 'arun@gmail.com', phone: '9876543210', borrowedCount: 2, status: 'Active' },
  { _id: '2', memberId: 'STU002', name: 'Priya S', email: 'priya@gmail.com', phone: '9876543211', borrowedCount: 1, status: 'Active' },
  { _id: '3', memberId: 'STU003', name: 'Vijay R', email: 'vijay@gmail.com', phone: '9876543212', borrowedCount: 0, status: 'Active' },
  { _id: '4', memberId: 'STU004', name: 'Divya M', email: 'divya@gmail.com', phone: '9876543213', borrowedCount: 3, status: 'Active' },
];

let fallbackLoans = [
  { _id: '1', loanId: 'LN001', memberId: 'STU001', memberName: 'Arun Kumar', bookTitle: 'Clean Code', issueDate: '2026-10-02', dueDate: '2026-10-16', status: 'Issued' },
  { _id: '2', loanId: 'LN002', memberId: 'STU002', memberName: 'Priya S', bookTitle: 'Atomic Habits', issueDate: '2026-10-04', dueDate: '2026-10-18', status: 'Issued' },
  { _id: '3', loanId: 'LN003', memberId: 'STU004', memberName: 'Divya M', bookTitle: 'Python Crash Course', issueDate: '2026-09-20', dueDate: '2026-10-04', status: 'Overdue' },
];

let fallbackReservations = [
  { _id: '1', bookTitle: 'Introduction to Algorithms', memberId: 'STU001', memberName: 'Arun Kumar', status: 'Active', requestDate: '2026-10-09' },
];

const isDBConnected = () => mongoose.connection.readyState === 1;

// Health / Status Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: isDBConnected() ? 'connected (MongoDB)' : 'in-memory fallback (Start MongoDB or configure Atlas URI in .env)',
    timestamp: new Date().toISOString(),
  });
});

// ------------------- BOOKS ENDPOINTS -------------------
app.get('/api/books', async (req, res) => {
  try {
    if (isDBConnected()) {
      const books = await Book.find().sort({ createdAt: -1 });
      return res.json(books);
    }
    res.json(fallbackBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, author, category, copies } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }
    const copiesNum = parseInt(copies, 10) || 1;

    if (isDBConnected()) {
      const newBook = new Book({
        title,
        author,
        category: category || 'General',
        copies: copiesNum,
        available: copiesNum,
      });
      const saved = await newBook.save();
      return res.status(201).json(saved);
    }

    const newBook = {
      _id: Date.now().toString(),
      title,
      author,
      category: category || 'General',
      copies: copiesNum,
      available: copiesNum,
    };
    fallbackBooks.unshift(newBook);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      await Book.findByIdAndDelete(id);
      return res.json({ message: 'Book deleted successfully' });
    }
    fallbackBooks = fallbackBooks.filter((b) => b._id !== id);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- MEMBERS ENDPOINTS -------------------
app.get('/api/members', async (req, res) => {
  try {
    if (isDBConnected()) {
      const members = await Member.find().sort({ createdAt: -1 });
      return res.json(members);
    }
    res.json(fallbackMembers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { memberId, name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const mId = memberId || `STU00${fallbackMembers.length + 5}`;
    if (isDBConnected()) {
      const newMember = new Member({
        memberId: mId,
        name,
        email,
        phone: phone || '',
        borrowedCount: 0,
        status: 'Active',
      });
      const saved = await newMember.save();
      return res.status(201).json(saved);
    }

    const newMember = {
      _id: Date.now().toString(),
      memberId: mId,
      name,
      email,
      phone: phone || '',
      borrowedCount: 0,
      status: 'Active',
    };
    fallbackMembers.unshift(newMember);
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- LOANS ENDPOINTS -------------------
app.get('/api/loans', async (req, res) => {
  try {
    if (isDBConnected()) {
      const loans = await Loan.find().sort({ createdAt: -1 });
      return res.json(loans);
    }
    res.json(fallbackLoans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const { memberId, memberName, bookTitle, issueDate, dueDate } = req.body;
    if (!memberId || !bookTitle) {
      return res.status(400).json({ error: 'Member and Book are required' });
    }

    const genLoanId = `LN00${Date.now().toString().slice(-4)}`;

    if (isDBConnected()) {
      // Find book and decrement available copy
      const book = await Book.findOne({ title: bookTitle });
      if (book) {
        if (book.available <= 0) {
          return res.status(400).json({ error: 'No copies available to issue' });
        }
        book.available -= 1;
        await book.save();
      }

      // Increment member borrowed count
      await Member.findOneAndUpdate({ memberId }, { $inc: { borrowedCount: 1 } });

      const newLoan = new Loan({
        loanId: genLoanId,
        memberId,
        memberName: memberName || 'Member',
        bookTitle,
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'Issued',
      });
      const saved = await newLoan.save();
      return res.status(201).json(saved);
    }

    // Fallback logic
    const fBook = fallbackBooks.find((b) => b.title === bookTitle);
    if (fBook) {
      if (fBook.available <= 0) return res.status(400).json({ error: 'No copies available' });
      fBook.available -= 1;
    }
    const fMember = fallbackMembers.find((m) => m.memberId === memberId);
    if (fMember) fMember.borrowedCount = (fMember.borrowedCount || 0) + 1;

    const newLoan = {
      _id: Date.now().toString(),
      loanId: genLoanId,
      memberId,
      memberName: memberName || (fMember ? fMember.name : 'Member'),
      bookTitle,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Issued',
    };
    fallbackLoans.unshift(newLoan);
    res.status(201).json(newLoan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loans/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const loan = await Loan.findOne({ $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { loanId: id }] });
      if (!loan) return res.status(404).json({ error: 'Loan not found' });
      if (loan.status === 'Returned') return res.status(400).json({ error: 'Book already returned' });

      loan.status = 'Returned';
      loan.returnDate = new Date().toISOString().split('T')[0];
      await loan.save();

      // Return copy to available
      await Book.findOneAndUpdate({ title: loan.bookTitle }, { $inc: { available: 1 } });
      await Member.findOneAndUpdate({ memberId: loan.memberId }, { $inc: { borrowedCount: -1 } });

      return res.json(loan);
    }

    const fLoan = fallbackLoans.find((l) => l._id === id || l.loanId === id);
    if (!fLoan) return res.status(404).json({ error: 'Loan not found' });
    if (fLoan.status === 'Returned') return res.status(400).json({ error: 'Book already returned' });

    fLoan.status = 'Returned';
    fLoan.returnDate = new Date().toISOString().split('T')[0];

    const fBook = fallbackBooks.find((b) => b.title === fLoan.bookTitle);
    if (fBook) fBook.available += 1;
    const fMember = fallbackMembers.find((m) => m.memberId === fLoan.memberId);
    if (fMember && fMember.borrowedCount > 0) fMember.borrowedCount -= 1;

    res.json(fLoan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- RESERVATIONS ENDPOINTS -------------------
app.get('/api/reservations', async (req, res) => {
  try {
    if (isDBConnected()) {
      const reservations = await Reservation.find().sort({ createdAt: -1 });
      return res.json(reservations);
    }
    res.json(fallbackReservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { bookTitle, memberId, memberName } = req.body;
    if (!bookTitle) return res.status(400).json({ error: 'Book title is required' });

    if (isDBConnected()) {
      const newReservation = new Reservation({
        bookTitle,
        memberId: memberId || 'STU001',
        memberName: memberName || 'Student Member',
        status: 'Active',
        requestDate: new Date().toISOString().split('T')[0],
      });
      const saved = await newReservation.save();
      return res.status(201).json(saved);
    }

    const newRes = {
      _id: Date.now().toString(),
      bookTitle,
      memberId: memberId || 'STU001',
      memberName: memberName || 'Student Member',
      status: 'Active',
      requestDate: new Date().toISOString().split('T')[0],
    };
    fallbackReservations.unshift(newRes);
    res.status(201).json(newRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      await Reservation.findByIdAndDelete(id);
      return res.json({ message: 'Reservation cancelled' });
    }
    fallbackReservations = fallbackReservations.filter((r) => r._id !== id);
    res.json({ message: 'Reservation cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- STATS OVERVIEW -------------------
app.get('/api/stats', async (req, res) => {
  try {
    if (isDBConnected()) {
      const allBooks = await Book.find();
      const totalCopies = allBooks.reduce((sum, b) => sum + (b.copies || 0), 0);
      const availableCopies = allBooks.reduce((sum, b) => sum + (b.available || 0), 0);
      const activeMembersCount = await Member.countDocuments({ status: 'Active' });
      const activeLoansCount = await Loan.countDocuments({ status: { $in: ['Issued', 'Overdue'] } });

      return res.json({
        totalBooks: totalCopies,
        availableBooks: availableCopies,
        activeMembers: activeMembersCount,
        activeLoans: activeLoansCount,
      });
    }

    const totalCopies = fallbackBooks.reduce((sum, b) => sum + (b.copies || 0), 0);
    const availableCopies = fallbackBooks.reduce((sum, b) => sum + (b.available || 0), 0);
    const activeLoans = fallbackLoans.filter((l) => l.status === 'Issued' || l.status === 'Overdue').length;

    res.json({
      totalBooks: totalCopies,
      availableBooks: availableCopies,
      activeMembers: fallbackMembers.length,
      activeLoans,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Connect MongoDB
app.listen(PORT, async () => {
  console.log(`🚀 Library Backend API running at http://localhost:${PORT}`);
  const connected = await connectDB();
  if (connected) {
    await seedInitialData();
  }
});
