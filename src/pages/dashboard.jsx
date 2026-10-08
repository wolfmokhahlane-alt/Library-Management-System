import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/libraryContext';


export default function Dashboard() {
  const {
    books,
    transactions,
    users,
    currentUser,
    borrowBook,
    returnBook,
  } = useLibrary();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'librarian';

  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [memberMessage, setMemberMessage] = useState({ text: '', type: '' });

  
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
    const lowStockBooks = books.filter((b) => Number(b.quantity) < 2);
    const totalTransactions = transactions.length;
    const totalUsers = users.length;
    return {
      totalBooks,
      totalCopies,
      lowStockBooks,
      lowStockCount: lowStockBooks.length,
      totalTransactions,
      totalUsers,
    };
  }, [books, transactions, users]);

  
  const memberTransactions = useMemo(() => {
    if (!currentUser) return [];
    return transactions.filter(
      (t) =>
        t.membershipId?.toLowerCase() === currentUser.membershipId?.toLowerCase() ||
        t.userName?.toLowerCase() === currentUser.name?.toLowerCase()
    );
  }, [transactions, currentUser]);

  
  const memberBorrowedCounts = useMemo(() => {
    const counts = {};
    memberTransactions.forEach((t) => {
      const bId = t.bookId;
      if (!counts[bId]) counts[bId] = 0;
      if (t.type === 'borrow') counts[bId] += Number(t.amount) || 1;
      else if (t.type === 'return') counts[bId] -= Number(t.amount) || 1;
    });
    return counts;
  }, [memberTransactions]);

  const totalCurrentlyBorrowed = useMemo(() => {
    return Object.values(memberBorrowedCounts).reduce(
      (sum, count) => sum + Math.max(0, count),
      0
    );
  }, [memberBorrowedCounts]);

  
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'all' ||
        book.genre.toLowerCase() === selectedGenre.toLowerCase();

      return matchesSearch && matchesGenre;
    });
  }, [books, searchQuery, selectedGenre]);

  const availableGenres = useMemo(() => {
    const genres = new Set(books.map((b) => b.genre).filter(Boolean));
    return ['all', ...Array.from(genres)];
  }, [books]);

  // Member borrow 
  const handleBorrow = (book) => {
    const result = borrowBook(book.id, currentUser);
    if (result.success) {
      setMemberMessage({ text: result.message, type: 'success' });
    } else {
      setMemberMessage({ text: result.message, type: 'error' });
    }
  };

  // Member return 
  const handleReturn = (book) => {
    const result = returnBook(book.id, currentUser);
    if (result.success) {
      setMemberMessage({ text: result.message, type: 'success' });
    } else {
      setMemberMessage({ text: result.message, type: 'error' });
    }
  };

  //Admin dashboard 
  if (isAdmin) {
    return (
      <div className="page" id="admin-dashboard-page">
      
        <div className="page-header">
          <div className="role-tag admin">ADMINISTRATOR PORTAL</div>
          <h1>Welcome Admin</h1>
        </div>

      
        <div className="stats-grid" id="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Titles</div>
              <div className="stat-value">{stats.totalBooks}</div>
              <div className="stat-desc">Catalogued in system</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Copies</div>
              <div className="stat-value">{stats.totalCopies}</div>
              <div className="stat-desc">Physical stock count</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-content">
              <div className="stat-label">Low Stock Alert</div>
              <div className="stat-value">{stats.lowStockCount}</div>
              <div className="stat-desc">Fewer than 2 copies remaining</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{stats.totalTransactions}</div>
              <div className="stat-desc">Total loans and arrivals</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Registered Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-desc">Admins and members</div>
            </div>
          </div>
        </div>

      
        {stats.lowStockCount > 0 && (
          <div className="alert-banner warning" id="admin-low-stock-alert">
            <div className="alert-text">
              <strong>Low Stock Notice:</strong> {stats.lowStockCount} book title(s) have fewer than 2 copies in stock and require restocking.
              <ul className="low-stock-list">
                {stats.lowStockBooks.map((b) => (
                  <li key={b.id}>
                    &bull; <strong>{b.title}</strong> by {b.author} ({b.quantity} {b.quantity === 1 ? 'copy' : 'copies'} remaining)
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/transactions" className="btn btn-sm btn-primary">
              Restock in Transactions
            </Link>
          </div>
        )}

      
        <div className="admin-actions-bar" id="admin-actions-bar">
          <div className="action-card">
            <h3>Book Management</h3>
            <p>Add new titles, update existing book metadata, or remove discontinued books.</p>
            <Link to="/books" className="btn btn-primary" id="goto-books-btn">
              Manage Books
            </Link>
          </div>

          <div className="action-card">
            <h3>Stock & Transactions</h3>
            <p>Record stock arrival, deduct borrowed books, and view full transaction logs.</p>
            <Link to="/transactions" className="btn btn-primary" id="goto-transactions-btn">
              Record Stock & Loans
            </Link>
          </div>

          <div className="action-card">
            <h3>User Management</h3>
            <p>Register new community members, update credentials, or manage staff privileges.</p>
            <Link to="/users" className="btn btn-primary" id="goto-users-btn">
              Manage Accounts
            </Link>
          </div>
        </div>

    
        <div className="section-card" id="admin-inventory-section">
          <div className="section-header-row">
            <h2>Current Book Availability & Stock</h2>
            <Link to="/books" className="btn btn-sm btn-purple-subtle">
              Full Catalogue
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="empty-state">
              <h3>No books currently in system</h3>
              <p>Add books using the Book Management page.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table" id="admin-availability-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>ISBN</th>
                    <th>Stock Quantity</th>
                    <th>Availability Status</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => {
                    const isLow = Number(b.quantity) < 2;
                    const isOut = Number(b.quantity) === 0;
                    return (
                      <tr key={b.id} className={isLow ? 'low-stock-row' : ''}>
                        <td style={{ fontWeight: 600 }}>{b.title}</td>
                        <td>{b.author}</td>
                        <td>{b.genre}</td>
                        <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>
                          {b.isbn}
                        </td>
                        <td>
                          <div className="stock-indicator">
                            <span className={`stock-dot${isOut ? ' low' : isLow ? ' low' : ' ok'}`} />
                            <strong>{b.quantity}</strong> copies
                          </div>
                        </td>
                        <td>
                          {isOut ? (
                            <span className="stock-tag out">Out of Stock</span>
                          ) : isLow ? (
                            <span className="stock-tag low">Low Stock (&lt; 2)</span>
                          ) : (
                            <span className="stock-tag available">Available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      
        <div className="section-card" id="admin-recent-tx-section">
          <div className="section-header-row">
            <h2>Recent Activity Log</h2>
            <Link to="/transactions" className="btn btn-sm btn-purple-subtle">
              View All History
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table" id="admin-recent-tx-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Book Title</th>
                    <th>Action Type</th>
                    <th>Quantity</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(t.date).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>
                        <span className={`type-badge ${t.type}`}>
                          {t.type === 'add'
                            ? 'Stock Arrival'
                            : t.type === 'borrow'
                            ? 'Book Borrowed'
                            : 'Book Returned'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{t.amount}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {t.userName || t.membershipId || 'System'}
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

//Member dashboard 
  return (
    <div className="page" id="member-dashboard-page">
      <div className="member-profile-banner" id="member-banner">
        <div className="member-banner-details">
          <div className="role-tag member">MEMBER PORTAL</div>
          <h1>Welcome {currentUser?.name}</h1>
          
        </div>
        <div className="member-credentials-badge">
          <div className="cred-item">
            <span className="cred-label">Membership ID</span>
            <span className="cred-val">{currentUser?.membershipId}</span>
          </div>
          <div className="cred-item">
            <span className="cred-label">Account Status</span>
            <span className="cred-val status-active">Active</span>
          </div>
        </div>
      </div>

      
      <div className="stats-grid" id="member-stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Available Titles</div>
            <div className="stat-value">{books.length}</div>
            <div className="stat-desc">Books currently in catalogue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">My Borrowed Books</div>
            <div className="stat-value">{totalCurrentlyBorrowed}</div>
            <div className="stat-desc">Active books checked out</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">My Total Transactions</div>
            <div className="stat-value">{memberTransactions.length}</div>
            <div className="stat-desc">Personal loan & return history</div>
          </div>
        </div>
      </div>

      
      {memberMessage.text && (
        <div className={`message-bar ${memberMessage.type}`} id="member-status-message">
          <span>{memberMessage.text}</span>
          <button
            type="button"
            className="message-close-btn"
            onClick={() => setMemberMessage({ text: '', type: '' })}
          >
            Dismiss
          </button>
        </div>
      )}

      
      <div className="section-card" id="browse-section">
        <div className="section-header-row">
          <div>
            <h2>Browse & Borrow Books</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Check availability and borrow or return titles directly to your account
            </p>
          </div>
        </div>

    
        <div className="filter-controls-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, author, genre, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="member-book-search"
            />
          </div>

          <div className="genre-filter-wrapper">
            <label className="form-label" style={{ margin: 0, marginRight: '8px' }}>
              Genre:
            </label>
            <select
              className="form-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              id="genre-filter-select"
              style={{ width: 'auto', minWidth: '160px' }}
            >
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g === 'all' ? 'All Genres' : g}
                </option>
              ))}
            </select>
          </div>
        </div>

        
        {filteredBooks.length === 0 ? (
          <div className="empty-state">
            <h3>No books matched your search</h3>
            <p>Try clearing your search terms or selecting a different genre.</p>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
              }}
              style={{ marginTop: '12px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="member-books-grid" id="member-books-grid">
            {filteredBooks.map((book) => {
              const copies = Number(book.quantity) || 0;
              const isOut = copies === 0;
              const isLow = copies === 1;
              const borrowedByMe = memberBorrowedCounts[book.id] || 0;

              return (
                <div
                  key={book.id}
                  className={`member-book-card${isLow ? ' low-stock' : ''}`}
                  id={`member-book-${book.id}`}
                >
                  <div className="book-card-header">
                    <span className="book-card-title">{book.title}</span>
                    {isOut ? (
                      <span className="stock-tag out">Out of Stock</span>
                    ) : isLow ? (
                      <span className="stock-tag low">1 Copy Left</span>
                    ) : (
                      <span className="stock-tag available">In Stock</span>
                    )}
                  </div>

                  <div className="book-card-meta">
                    <div className="book-card-meta-row">
                      <span className="book-card-meta-label">Author:</span>
                      <span className="book-card-meta-value">{book.author}</span>
                    </div>
                    <div className="book-card-meta-row">
                      <span className="book-card-meta-label">Genre:</span>
                      <span className="book-card-meta-value">{book.genre}</span>
                    </div>
                    <div className="book-card-meta-row">
                      <span className="book-card-meta-label">ISBN:</span>
                      <span className="book-card-meta-value">{book.isbn}</span>
                    </div>
                    <div className="book-card-meta-row">
                      <span className="book-card-meta-label">Available:</span>
                      <span className="book-card-meta-value" style={{ fontWeight: 700 }}>
                        {copies} {copies === 1 ? 'copy' : 'copies'}
                      </span>
                    </div>
                  </div>

                  {borrowedByMe > 0 && (
                    <div className="member-loan-status">
                      You currently have {borrowedByMe} {borrowedByMe === 1 ? 'copy' : 'copies'} checked out
                    </div>
                  )}

                  <div className="member-book-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => handleBorrow(book)}
                      disabled={isOut}
                      id={`borrow-btn-${book.id}`}
                    >
                      {isOut ? 'Unavailable' : 'Borrow Book'}
                    </button>

                    {borrowedByMe > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-purple-subtle"
                        onClick={() => handleReturn(book)}
                        id={`return-btn-${book.id}`}
                      >
                        Return Copy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      
      <div className="section-card" id="my-history-section">
        <div className="section-header-row">
          <div>
            <h2>My Activity & Borrowing History</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Personal log of all books borrowed and returned under Membership ID {currentUser?.membershipId}
            </p>
          </div>
        </div>

        {memberTransactions.length === 0 ? (
          <div className="empty-state">
            <p>You have not borrowed or returned any books yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table" id="member-history-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Book Title</th>
                  <th>Action</th>
                  <th>Copies</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {memberTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {new Date(t.date).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>
                      <span className={`type-badge ${t.type}`}>
                        {t.type === 'borrow' ? 'Borrowed' : 'Returned'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.amount}</td>
                    <td>
                      <span className="status-pill completed">Completed</span>
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