const API_BASE = 'http://localhost:5000/api';

export const api = {
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    return res.json();
  },
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },
  async getBooks() {
    const res = await fetch(`${API_BASE}/books`);
    return res.json();
  },
  async addBook(bookData) {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    return res.json();
  },
  async deleteBook(id) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  async getMembers() {
    const res = await fetch(`${API_BASE}/members`);
    return res.json();
  },
  async addMember(memberData) {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    return res.json();
  },
  async getLoans() {
    const res = await fetch(`${API_BASE}/loans`);
    return res.json();
  },
  async issueLoan(loanData) {
    const res = await fetch(`${API_BASE}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loanData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to issue book');
    }
    return res.json();
  },
  async returnLoan(id) {
    const res = await fetch(`${API_BASE}/loans/${id}/return`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to return book');
    }
    return res.json();
  },
  async getReservations() {
    const res = await fetch(`${API_BASE}/reservations`);
    return res.json();
  },
  async addReservation(reservationData) {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData),
    });
    return res.json();
  },
  async cancelReservation(id) {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
