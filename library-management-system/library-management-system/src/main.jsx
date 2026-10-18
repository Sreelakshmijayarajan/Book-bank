import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  Users,
  LayoutDashboard,
  BookMarked,
  RotateCcw,
  Plus,
  Search,
  LogOut,
  UserRound,
  Bookmark,
  CheckCircle2,
  Clock3,
  Trash2,
  RefreshCw,
  Database,
  Check,
  AlertCircle
} from 'lucide-react';
import './style.css';
import { api } from './api';

function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState('Dashboard');
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, availableBooks: 0, activeMembers: 0, activeLoans: 0 });
  const [dbStatus, setDbStatus] = useState('Connecting...');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshAll = async () => {
    try {
      const [st, b, m, l, r, s] = await Promise.all([
        api.getStatus().catch(() => ({ database: 'Offline' })),
        api.getBooks().catch(() => []),
        api.getMembers().catch(() => []),
        api.getLoans().catch(() => []),
        api.getReservations().catch(() => []),
        api.getStats().catch(() => ({ totalBooks: 0, availableBooks: 0, activeMembers: 0, activeLoans: 0 }))
      ]);
      setDbStatus(st.database || 'Active');
      setBooks(b);
      setMembers(m);
      setLoans(l);
      setReservations(r);
      setStats(s);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!role) {
    return <Login login={(r) => { setRole(r); setPage('Dashboard'); }} />;
  }

  const nav = role === 'admin'
    ? ['Dashboard', 'Books', 'Members', 'Issue Book', 'Loans / Returns']
    : ['Dashboard', 'Browse Books', 'My Books', 'Reservations', 'Profile'];

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <BookOpen size={28} />
          <span>Book Bank</span>
        </div>
        <small>{role === 'admin' ? 'LIBRARIAN CONTROL PANEL' : 'STUDENT MEMBER PANEL'}</small>

        {nav.map((n) => (
          <button
            key={n}
            className={`nav ${page === n ? 'active' : ''}`}
            onClick={() => setPage(n)}
          >
            <Icon n={n} />
            <span>{n}</span>
          </button>
        ))}

        <div className="nav-bottom">
          <div className="db-pill" title={dbStatus}>
            <span className="dot" />
            <Database size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dbStatus.includes('MongoDB') ? 'MongoDB Atlas / Local' : 'Backend Connected'}
            </span>
          </div>
          <button className="logout" onClick={() => setRole(null)}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <small>BOOK BANK SYSTEM</small>
            <h1>{page}</h1>
          </div>
          <div className="header-right">
            <button className="secondary" onClick={refreshAll} title="Refresh library data">
              <RefreshCw size={15} /> Sync
            </button>
            <div className="user">
              <div className="avatar">{role === 'admin' ? 'L' : 'S'}</div>
              <span>{role === 'admin' ? 'Head Librarian' : 'Student Member'}</span>
            </div>
          </div>
        </header>

        {role === 'admin' ? (
          <Admin
            page={page}
            books={books}
            members={members}
            loans={loans}
            stats={stats}
            setPage={setPage}
            refreshAll={refreshAll}
            showToast={showToast}
          />
        ) : (
          <User
            page={page}
            books={books}
            loans={loans}
            reservations={reservations}
            refreshAll={refreshAll}
            showToast={showToast}
            setPage={setPage}
          />
        )}
      </main>

      {toast && (
        <div className="toast">
          {toast.type === 'error' ? <AlertCircle size={18} color="#ef4444" /> : <Check size={18} color="#10b981" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function Icon({ n }) {
  let C = n === 'Dashboard'
    ? LayoutDashboard
    : n.includes('Books') || n === 'Books'
    ? BookOpen
    : n === 'Members'
    ? Users
    : n === 'Issue Book'
    ? BookMarked
    : n === 'Loans / Returns'
    ? RotateCcw
    : n === 'Reservations'
    ? Bookmark
    : UserRound;
  return <C size={18} />;
}

function Login({ login }) {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(role);
  };

  return (
    <div className="login">
      <div className="hero">
        <div className="hero-badge">Smart Library System</div>
        <h1>Book Bank</h1>
        <h2>Manage your entire library seamlessly.</h2>
        <p>
          Full-stack library administration system backed by MongoDB. Track books, members, issues, returns, and reservations in real time.
        </p>
      </div>

      <div className="loginbox">
        <div className="loginicon-wrap">
          <BookOpen size={30} />
        </div>
        <h2>Welcome Back</h2>
        <p>Choose your account type and continue.</p>

        <div className="roles">
          <button
            type="button"
            className={role === 'admin' ? 'sel' : ''}
            onClick={() => setRole('admin')}
          >
            Librarian (Admin)
          </button>
          <button
            type="button"
            className={role === 'user' ? 'sel' : ''}
            onClick={() => setRole('user')}
          >
            Student Member
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. librarian@bookbank.edu"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="primary full">
            Sign In as {role === 'admin' ? 'Librarian' : 'Student Member'} →
          </button>
        </form>
        <small style={{ display: 'block', textAlign: 'center', marginTop: '14px', color: '#64748b' }}>
          ✨ Quick demo mode: Any credentials proceed directly.
        </small>
      </div>
    </div>
  );
}

function Intro({ title, text, button, click, icon: IconComponent }) {
  return (
    <div className="intro">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {button && (
        <div className="intro-actions">
          <button className="primary" onClick={click}>
            {IconComponent ? <IconComponent size={16} /> : <Plus size={16} />} {button}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, Icon: StatIcon, note }) {
  return (
    <div className="stat">
      <div className="stat-icon-wrap">
        <StatIcon size={26} />
      </div>
      <div>
        <small>{title}</small>
        <b>{value}</b>
        <span>{note}</span>
      </div>
    </div>
  );
}

function Admin({ page, books, members, loans, stats, setPage, refreshAll, showToast }) {
  if (page === 'Dashboard') {
    return (
      <>
        <Intro
          title="Welcome, Librarian 👋"
          text="Live overview of collection, circulation and active member requests."
          button="Issue a Book"
          click={() => setPage('Issue Book')}
          icon={BookMarked}
        />
        <div className="stats">
          <Stat title="Total Books" value={stats.totalBooks} Icon={BookOpen} note="Total copies cataloged" />
          <Stat title="Available Books" value={stats.availableBooks} Icon={CheckCircle2} note="Ready for checkout" />
          <Stat title="Active Members" value={stats.activeMembers || members.length} Icon={Users} note="Registered users" />
          <Stat title="Active Loans" value={stats.activeLoans || loans.filter((l) => l.status !== 'Returned').length} Icon={BookMarked} note="Currently checked out" />
        </div>
        <div className="grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Recent Book Loans</h3>
              <button className="outline" onClick={() => setPage('Loans / Returns')}>
                View All Loans →
              </button>
            </div>
            <LoanTable loans={loans.slice(0, 5)} refreshAll={refreshAll} showToast={showToast} />
          </div>
          <div className="panel">
            <h3>Quick Actions</h3>
            <button className="quick" onClick={() => setPage('Books')}>
              📚 Catalog & Add New Books →
            </button>
            <button className="quick" onClick={() => setPage('Members')}>
              👥 Register & View Members →
            </button>
            <button className="quick" onClick={() => setPage('Issue Book')}>
              📖 Issue Book to Student →
            </button>
            <button className="quick" onClick={() => setPage('Loans / Returns')}>
              🔄 Process Returns & Fines →
            </button>
          </div>
        </div>
      </>
    );
  }

  if (page === 'Books') return <BooksAdmin books={books} refreshAll={refreshAll} showToast={showToast} />;
  if (page === 'Members') return <MembersAdmin members={members} refreshAll={refreshAll} showToast={showToast} />;
  if (page === 'Issue Book') return <IssueAdmin books={books} members={members} refreshAll={refreshAll} showToast={showToast} setPage={setPage} />;
  return (
    <>
      <Intro
        title="Loans & Returns Management"
        text="Track issued loans, return books to shelf, and monitor overdue deadlines."
      />
      <div className="panel">
        <div className="panel-header">
          <h3>All Circulation Records ({loans.length})</h3>
        </div>
        <LoanTable loans={loans} refreshAll={refreshAll} showToast={showToast} />
      </div>
    </>
  );
}

function LoanTable({ loans, refreshAll, showToast }) {
  const handleReturn = async (loanId) => {
    try {
      await api.returnLoan(loanId);
      showToast('Book returned to library inventory!');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!loans || loans.length === 0) {
    return <p style={{ color: '#64748b', padding: '10px 0' }}>No loan records found.</p>;
  }

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Member</th>
            <th>Book Title</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((l) => (
            <tr key={l._id || l.loanId}>
              <td><b>{l.loanId}</b></td>
              <td>{l.memberName || l.memberId}</td>
              <td>{l.bookTitle}</td>
              <td>{l.dueDate}</td>
              <td>
                <span className={`badge ${l.status === 'Overdue' ? 'badge-danger' : l.status === 'Returned' ? 'badge-returned' : 'badge-ok'}`}>
                  {l.status}
                </span>
              </td>
              <td>
                {l.status !== 'Returned' ? (
                  <button className="btn-table" onClick={() => handleReturn(l._id || l.loanId)}>
                    Return Book
                  </button>
                ) : (
                  <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ Returned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BooksAdmin({ books, refreshAll, showToast }) {
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', category: '', copies: 1 });
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) {
      showToast('Title and author are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.addBook(form);
      showToast(`Added "${form.title}" to catalog`);
      setForm({ title: '', author: '', category: '', copies: 1 });
      setShowAdd(false);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}" from catalog?`)) {
      try {
        await api.deleteBook(id);
        showToast(`Book deleted`);
        refreshAll();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const filtered = books.filter((b) =>
    (b.title + b.author + b.category).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <Intro
        title="Book Inventory"
        text="Manage your full book repository connected to MongoDB."
        button={showAdd ? 'Cancel' : 'Add New Book'}
        click={() => setShowAdd(!showAdd)}
        icon={Plus}
      />

      {showAdd && (
        <div className="panel">
          <h3>Add New Book to Collection</h3>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  placeholder="e.g. Clean Architecture"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  placeholder="e.g. Robert C. Martin"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  placeholder="e.g. Software Design"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={form.copies}
                  onChange={(e) => setForm({ ...form, copies: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Book to Database'}
            </button>
          </form>
        </div>
      )}

      <div className="search">
        <Search size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, author, or category..."
        />
      </div>

      <div className="bookgrid">
        {filtered.map((b) => (
          <div className="book" key={b._id}>
            <div className="book-top">
              <div className="cover">
                <BookOpen size={28} />
              </div>
              <span className={`badge ${b.available > 0 ? 'badge-ok' : 'badge-danger'}`}>
                {b.available > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <h3>{b.title}</h3>
            <p className="author">by {b.author}</p>
            <span className="category-tag">{b.category || 'General'}</span>
            <div className="meta">
              <span>Available / Total</span>
              <b>{b.available} / {b.copies} copies</b>
            </div>
            <div className="book-actions">
              <button
                className="delete full"
                onClick={() => handleDelete(b._id, b.title)}
                title="Remove book"
              >
                <Trash2 size={15} /> Delete Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MembersAdmin({ members, refreshAll, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      showToast('Name and email are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.addMember(form);
      showToast(`Member ${form.name} registered!`);
      setForm({ name: '', email: '', phone: '' });
      setShowAdd(false);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Intro
        title="Library Members"
        text="View and register library card holders."
        button={showAdd ? 'Close' : 'Add New Member'}
        click={() => setShowAdd(!showAdd)}
        icon={Plus}
      />

      {showAdd && (
        <div className="panel">
          <h3>Register New Member</h3>
          <form onSubmit={handleAddMember}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  placeholder="e.g. Sarah Jenkins"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="e.g. sarah@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Member'}
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Books Borrowed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id || m.memberId}>
                  <td><b>{m.memberId}</b></td>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.phone || 'N/A'}</td>
                  <td>{m.borrowedCount || 0}</td>
                  <td>
                    <span className="badge badge-ok">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function IssueAdmin({ books, members, refreshAll, showToast, setPage }) {
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0].memberId);
    }
    const avail = books.find((b) => b.available > 0);
    if (avail && !selectedBook) {
      setSelectedBook(avail.title);
    }
  }, [members, books]);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedBook) {
      showToast('Please select both a member and an available book', 'error');
      return;
    }
    const mem = members.find((m) => m.memberId === selectedMember);
    setSubmitting(true);
    try {
      await api.issueLoan({
        memberId: selectedMember,
        memberName: mem ? mem.name : selectedMember,
        bookTitle: selectedBook,
        issueDate,
        dueDate,
      });
      showToast(`Successfully issued "${selectedBook}"!`);
      refreshAll();
      setPage('Loans / Returns');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Intro title="Issue Book" text="Create a new lending record for a registered student." />
      <div className="issue">
        <div className="panel">
          <h3>Issue Details</h3>
          <form onSubmit={handleIssue}>
            <div className="form-group">
              <label>Select Member</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m._id || m.memberId} value={m.memberId}>
                    {m.memberId} — {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Book (Available only)</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
              >
                {books
                  .filter((b) => b.available > 0)
                  .map((b) => (
                    <option key={b._id} value={b.title}>
                      {b.title} — ({b.available} in stock)
                    </option>
                  ))}
              </select>
            </div>

            <div className="two">
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="primary full" disabled={submitting}>
              {submitting ? 'Issuing...' : 'Issue Book to Student'}
            </button>
          </form>
        </div>

        <div className="policy">
          <Clock3 size={44} />
          <h3>Borrowing Policy</h3>
          <p>
            Standard borrow period is 14 days. Ensure the book condition is verified before handing over. Overdue items will be flagged automatically.
          </p>
        </div>
      </div>
    </>
  );
}

function User({ page, books, loans, reservations, refreshAll, showToast, setPage }) {
  const currentMemberId = 'STU001';

  const handleReserve = async (bookTitle) => {
    try {
      await api.addReservation({
        bookTitle,
        memberId: currentMemberId,
        memberName: 'Arun Kumar',
      });
      showToast(`Reserved "${bookTitle}" successfully!`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      await api.cancelReservation(id);
      showToast('Reservation cancelled');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (page === 'Browse Books') {
    return (
      <>
        <Intro title="Browse Books" text="Explore the catalog and reserve copies." />
        <div className="bookgrid">
          {books.map((b) => (
            <div className="book" key={b._id}>
              <div className="book-top">
                <div className="cover">
                  <BookOpen size={28} />
                </div>
                <span className={`badge ${b.available > 0 ? 'badge-ok' : 'badge-danger'}`}>
                  {b.available > 0 ? `${b.available} Available` : 'Unavailable'}
                </span>
              </div>
              <h3>{b.title}</h3>
              <p className="author">by {b.author}</p>
              <span className="category-tag">{b.category || 'General'}</span>
              <div className="meta">
                <span>Status</span>
                <b>{b.available > 0 ? 'Available for Checkout' : 'All copies checked out'}</b>
              </div>
              <div className="book-actions">
                <button
                  className={b.available > 0 ? 'primary full' : 'outline full'}
                  disabled={b.available <= 0}
                  onClick={() => handleReserve(b.title)}
                >
                  {b.available > 0 ? 'Reserve / Borrow Copy' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (page === 'My Books') {
    const myLoans = loans.filter((l) => l.memberId === currentMemberId);
    return (
      <>
        <Intro title="My Books" text="All titles you have currently checked out or previously returned." />
        <div className="panel">
          <h3>Your Circulation History</h3>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLoans.map((l) => (
                  <tr key={l._id || l.loanId}>
                    <td><b>{l.loanId}</b></td>
                    <td>{l.bookTitle}</td>
                    <td>{l.issueDate}</td>
                    <td>{l.dueDate}</td>
                    <td>
                      <span className={`badge ${l.status === 'Overdue' ? 'badge-danger' : l.status === 'Returned' ? 'badge-returned' : 'badge-ok'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  if (page === 'Reservations') {
    return (
      <>
        <Intro
          title="Active Reservations"
          text="Manage books you have requested."
          button="Browse More"
          click={() => setPage('Browse Books')}
        />
        <div className="panel">
          <h3>Reserved Books</h3>
          {reservations.length === 0 ? (
            <p style={{ color: '#64748b' }}>No active reservations.</p>
          ) : (
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r._id}>
                      <td><b>{r.bookTitle}</b></td>
                      <td>{r.requestDate || 'Recent'}</td>
                      <td><span className="badge badge-warn">Active Reservation</span></td>
                      <td>
                        <button className="delete" onClick={() => handleCancelReservation(r._id)}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  if (page === 'Profile') {
    return (
      <>
        <Intro title="Member Profile" text="Your verified library membership credentials." />
        <div className="panel" style={{ maxWidth: '600px' }}>
          <h3>Student Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <p><b>Member ID:</b> STU001</p>
            <p><b>Full Name:</b> Arun Kumar</p>
            <p><b>Email:</b> arun@gmail.com</p>
            <p><b>Contact:</b> +91 98765 43210</p>
            <p><b>Account Standing:</b> <span className="badge badge-ok">Good Standing</span></p>
          </div>
        </div>
      </>
    );
  }

  // Dashboard
  const myActiveLoans = loans.filter((l) => l.memberId === currentMemberId && l.status !== 'Returned');

  return (
    <>
      <Intro
        title="Welcome, Arun Kumar 👋"
        text="Find books, keep track of due dates, and explore reservations."
        button="Browse Catalog"
        click={() => setPage('Browse Books')}
      />
      <div className="stats">
        <Stat title="Books Borrowed" value={myActiveLoans.length} Icon={BookMarked} note="Currently with you" />
        <Stat title="Active Reservations" value={reservations.length} Icon={Bookmark} note="Waiting for pickup" />
        <Stat title="Total Returned" value={loans.filter((l) => l.memberId === currentMemberId && l.status === 'Returned').length} Icon={CheckCircle2} note="Completed" />
        <Stat title="Member Status" value="Active" Icon={Clock3} note="Card valid" />
      </div>
      <div className="panel">
        <div className="panel-header">
          <h3>Your Current Books</h3>
          <button className="outline" onClick={() => setPage('My Books')}>View All →</button>
        </div>
        {myActiveLoans.length === 0 ? (
          <p style={{ color: '#64748b' }}>You currently have no checked-out books.</p>
        ) : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myActiveLoans.map((l) => (
                  <tr key={l._id || l.loanId}>
                    <td><b>{l.bookTitle}</b></td>
                    <td>{l.issueDate}</td>
                    <td>{l.dueDate}</td>
                    <td>
                      <span className={`badge ${l.status === 'Overdue' ? 'badge-danger' : 'badge-ok'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
