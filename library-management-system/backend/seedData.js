import { Book } from './models/Book.js';
import { Member } from './models/Member.js';
import { Loan } from './models/Loan.js';
import { Reservation } from './models/Reservation.js';

export const seedInitialData = async () => {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany([
        { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Programming', copies: 5, available: 3 },
        { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', copies: 4, available: 2 },
        { title: 'Atomic Habits', author: 'James Clear', category: 'Self Development', copies: 6, available: 5 },
        { title: 'Database System Concepts', author: 'Silberschatz', category: 'Database', copies: 3, available: 1 },
        { title: 'Python Crash Course', author: 'Eric Matthes', category: 'Programming', copies: 5, available: 4 },
        { title: 'Introduction to Algorithms', author: 'Cormen', category: 'Algorithms', copies: 2, available: 0 },
      ]);
      console.log('📚 Seeded initial books');
    }

    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      await Member.insertMany([
        { memberId: 'STU001', name: 'Arun Kumar', email: 'arun@gmail.com', phone: '9876543210', borrowedCount: 2, status: 'Active' },
        { memberId: 'STU002', name: 'Priya S', email: 'priya@gmail.com', phone: '9876543211', borrowedCount: 1, status: 'Active' },
        { memberId: 'STU003', name: 'Vijay R', email: 'vijay@gmail.com', phone: '9876543212', borrowedCount: 0, status: 'Active' },
        { memberId: 'STU004', name: 'Divya M', email: 'divya@gmail.com', phone: '9876543213', borrowedCount: 3, status: 'Active' },
      ]);
      console.log('👥 Seeded initial members');
    }

    const loanCount = await Loan.countDocuments();
    if (loanCount === 0) {
      await Loan.insertMany([
        { loanId: 'LN001', memberId: 'STU001', memberName: 'Arun Kumar', bookTitle: 'Clean Code', issueDate: '2026-10-02', dueDate: '2026-10-16', status: 'Issued' },
        { loanId: 'LN002', memberId: 'STU002', memberName: 'Priya S', bookTitle: 'Atomic Habits', issueDate: '2026-10-04', dueDate: '2026-10-18', status: 'Issued' },
        { loanId: 'LN003', memberId: 'STU004', memberName: 'Divya M', bookTitle: 'Python Crash Course', issueDate: '2026-09-20', dueDate: '2026-10-04', status: 'Overdue' },
      ]);
      console.log('📖 Seeded initial loans');
    }

    const reservationCount = await Reservation.countDocuments();
    if (reservationCount === 0) {
      await Reservation.insertMany([
        { bookTitle: 'Introduction to Algorithms', memberId: 'STU001', memberName: 'Arun Kumar', status: 'Active', requestDate: '2026-10-09' }
      ]);
      console.log('🔖 Seeded initial reservations');
    }
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};
