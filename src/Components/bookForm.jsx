import { useState, useEffect } from 'react';

export default function BookForm({ onSubmit, initialData, onCancel }) {
  const emptyForm = { title: '', author: '', genre: '', isbn: '', quantity: 1 };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(emptyForm);
    setErrors({});
    // react-hooks
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.genre.trim()) e.genre = 'Genre is required';
    if (!/^\d{10,13}$/.test(form.isbn)) e.isbn = 'ISBN must be 10–13 digits';
    if (Number(form.quantity) < 0) e.quantity = 'Quantity cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, quantity: Number(form.quantity) });
    setForm(emptyForm);
  };

  return (
    <div className="form-card" id="book-form-card">
      <h3>
        {initialData ? 'Update Book' : 'Add New Book'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="book-title">Title</label>
            <input
              className={`form-input${errors.title ? ' error' : ''}`}
              id="book-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter book title"
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="book-author">Author</label>
            <input
              className={`form-input${errors.author ? ' error' : ''}`}
              id="book-author"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Enter author name"
            />
            {errors.author && <span className="form-error">{errors.author}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="book-genre">Genre</label>
            <input
              className={`form-input${errors.genre ? ' error' : ''}`}
              id="book-genre"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="e.g. Fiction, Science"
            />
            {errors.genre && <span className="form-error">{errors.genre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="book-isbn">ISBN</label>
            <input
              className={`form-input${errors.isbn ? ' error' : ''}`}
              id="book-isbn"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="10–13 digits"
            />
            {errors.isbn && <span className="form-error">{errors.isbn}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="book-quantity">Initial Quantity</label>
          <input
            className={`form-input${errors.quantity ? ' error' : ''}`}
            id="book-quantity"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Number of copies"
            style={{ maxWidth: '160px' }}
          />
          {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" id="book-submit-btn">
            {initialData ? 'Update Book' : 'Add Book'}
          </button>
          {initialData && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} id="book-cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}