import { useState } from 'react';
import { Link } from 'react-router-dom';
import BookForm from '../components/bookForm';
import { useLibrary } from '../context/libraryContext';

export default function Books() {
  const { books, setBooks, currentUser } = useLibrary();
  const [editing, setEditing] = useState(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'librarian';

  const addBook = (book) => {
    setBooks([...books, { ...book, id: Date.now() }]);
  };

  const updateBook = (id, updated) => {
    setBooks(books.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBook = (id) => {
    if (window.confirm('Are you sure you want to delete this book from the catalogue?')) {
      setBooks(books.filter((b) => b.id !== id));
    }
  };

  const handleSubmit = (data) => {
    if (editing) {
      updateBook(editing.id, data);
      setEditing(null);
    } else {
      addBook(data);
    }
  };

  // Restrict access 
  if (!isAdmin) {
    return (
      <div className="page" id="books-restricted-page">
        <div className="page-header">
          <h1>Book Management</h1>
        </div>
        <div className="section-card">
          <div className="access-denied" id="books-access-denied">
            <span className="role-tag member">MEMBER ACCOUNT</span>
            <h2>Administrator Privileges Required</h2>
            <p>
              Only library administrators and staff can add, edit, or delete books from the catalogue.
              As a member, you can browse and borrow books directly from your member dashboard.
            </p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Return to Member Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="books-page">
      <div className="page-header">
        <div className="role-tag admin">CATALOGUE CONTROL</div>
        <h1>Book Management</h1>
        <p>Add new titles, edit existing book details, or remove books from the library catalogue</p>
      </div>

      <div className="page-grid">
        
        <BookForm
          onSubmit={handleSubmit}
          initialData={editing}
          onCancel={() => setEditing(null)}
        />

        
        <div>
          {books.length === 0 ? (
            <div className="section-card">
              <div className="empty-state">
                <h3>No books catalogued yet</h3>
                <p>Use the form on the left to add your first book.</p>
              </div>
            </div>
          ) : (
            <div className="table-container" id="books-table-container">
              <div className="table-header">
                <h2>All Catalogued Books ({books.length})</h2>
              </div>
              <table className="data-table" id="books-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>ISBN</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => {
                    const isLow = Number(b.quantity) < 2;
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
                            <span className={`stock-dot${isLow ? ' low' : ' ok'}`} />
                            {b.quantity}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              type="button"
                              className="btn btn-sm btn-purple-subtle"
                              onClick={() => setEditing(b)}
                              id={`edit-book-${b.id}`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteBook(b.id)}
                              id={`delete-book-${b.id}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}