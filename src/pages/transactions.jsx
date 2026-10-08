import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/libraryContext';


export default function Transactions() {
  const { books, setBooks, transactions, setTransactions, currentUser } = useLibrary();
  const [selectedBook, setSelectedBook] = useState('');
  const [amount, setAmount] = useState(1);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterType, setFilterType] = useState('all');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'librarian';

  const record = (type) => {
    const book = books.find((b) => b.id === Number(selectedBook));
    if (!book) {
      setMessage({ text: 'Please select a book first.', type: 'error' });
      return;
    }
    const amt = Number(amount);
    if (amt <= 0) {
      setMessage({ text: 'Amount must be greater than 0.', type: 'error' });
      return;
    }
    if (type === 'borrow' && book.quantity < amt) {
      setMessage({
        text: `Cannot deduct ${amt} copies. Only ${book.quantity} copies in stock.`,
        type: 'error',
      });
      return;
    }

    const newQty = type === 'add' ? book.quantity + amt : book.quantity - amt;
    setBooks(books.map((b) => (b.id === book.id ? { ...b, quantity: newQty } : b)));

    const newTx = {
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      type,
      amount: amt,
      membershipId: memberIdInput.trim() || (type === 'add' ? currentUser?.membershipId : 'MEM001'),
      userName: type === 'add' ? currentUser?.name : (memberIdInput.trim() || 'Borrower'),
      date: new Date().toISOString(),
    };

    setTransactions([newTx, ...transactions]);

    setMessage({
      text: `Successfully recorded ${amt} copy/copies of "${book.title}" as ${
        type === 'add' ? 'Stock Added' : 'Stock Deducted (Borrowed)'
      }. New stock: ${newQty}.`,
      type: 'success',
    });
    setAmount(1);
    setSelectedBook('');
    setMemberIdInput('');
  };

  
  if (!isAdmin) {
    return (
      <div className="page" id="transactions-restricted-page">
        <div className="page-header">
          <h1>Stock & Availability Transactions</h1>
        </div>
        <div className="section-card">
          <div className="access-denied">
            <span className="role-tag member">MEMBER ACCOUNT</span>
            <h2>Administrator Privileges Required</h2>
            <p>
              Stock management is restricted to library administrators. You can borrow or return
              books directly from your Member Dashboard.
            </p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Return to Member Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="page" id="transactions-page">
      <div className="page-header">
        <div className="role-tag admin">AVAILABILITY & STOCK CONTROL</div>
        <h1>Availability Management & Transactions</h1>
        <p>Record stock increases when new books arrive or stock deductions when books are borrowed</p>
      </div>

    
      <div className="section-card" id="transaction-form-section">
        <h2>Record Stock Transaction</h2>

        <div className="transaction-controls">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label" htmlFor="transaction-book">
              Select Book Title
            </label>
            <select
              className="form-select"
              id="transaction-book"
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                setMessage({ text: '', type: '' });
              }}
            >
              <option value="">-- Choose a book from catalogue --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (Current stock: {b.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ width: '130px', flex: 'none' }}>
            <label className="form-label" htmlFor="transaction-amount">
              Quantity
            </label>
            <input
              className="form-input"
              id="transaction-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: 1.5 }}>
            <label className="form-label" htmlFor="transaction-member-id">
              Member ID (Optional for loan)
            </label>
            <input
              className="form-input"
              id="transaction-member-id"
              placeholder="e.g. MEM001"
              value={memberIdInput}
              onChange={(e) => setMemberIdInput(e.target.value)}
            />
          </div>

          <div className="transaction-actions" style={{ alignSelf: 'flex-end', marginBottom: '18px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => record('add')}
              id="add-stock-btn"
            >
              Add Stock (Arrival)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => record('borrow')}
              id="deduct-stock-btn"
            >
              Deduct Stock (Loan)
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`message-bar ${message.type}`} id="transaction-message">
            <span>{message.text}</span>
          </div>
        )}
      </div>

    
      <div className="section-card" id="transactions-log-section">
        <div className="section-header-row">
          <div>
            <h2>Transaction History Log ({transactions.length})</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Full audit trail of all additions and stock deductions
            </p>
          </div>

          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-btn${filterType === 'all' ? ' active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({transactions.length})
            </button>
            <button
              type="button"
              className={`filter-btn${filterType === 'add' ? ' active' : ''}`}
              onClick={() => setFilterType('add')}
            >
              Stock In
            </button>
            <button
              type="button"
              className={`filter-btn${filterType === 'borrow' ? ' active' : ''}`}
              onClick={() => setFilterType('borrow')}
            >
              Deductions / Loans
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions match the selected filter.</p>
          </div>
        ) : (
          <div className="table-container" id="transactions-table-container">
            <table className="data-table" id="transactions-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Book Title</th>
                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Member / Staff</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {new Date(t.date).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>
                      <span className={`type-badge ${t.type}`}>
                        {t.type === 'add'
                          ? 'Stock Added'
                          : t.type === 'borrow'
                          ? 'Stock Deducted (Loan)'
                          : 'Book Returned'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.amount}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {t.userName || t.membershipId || 'System Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}