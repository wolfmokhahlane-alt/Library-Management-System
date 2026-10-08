/**
 * BookCard — White card with purple accent borders,
 * stock status indicator, and low-stock badge.
 * Zero icons, zero emojis.
 */
export default function BookCard({ book, low }) {
  const isOutOfStock = Number(book.quantity) === 0;

  return (
    <div className={`book-card${low ? ' low-stock' : ''}`} id={`book-card-${book.id}`}>
      <div className="book-card-header">
        <span className="book-card-title">{book.title}</span>
        {isOutOfStock ? (
          <span className="stock-tag out">Out of Stock</span>
        ) : low ? (
          <span className="stock-tag low">Low Stock</span>
        ) : (
          <span className="stock-tag available">In Stock</span>
        )}
      </div>

      <div className="book-card-meta">
        <div className="book-card-meta-row">
          <span className="book-card-meta-label">Author</span>
          <span className="book-card-meta-value">{book.author}</span>
        </div>
        <div className="book-card-meta-row">
          <span className="book-card-meta-label">Genre</span>
          <span className="book-card-meta-value">{book.genre}</span>
        </div>
        <div className="book-card-meta-row">
          <span className="book-card-meta-label">ISBN</span>
          <span className="book-card-meta-value">{book.isbn}</span>
        </div>
      </div>

      <div className="book-card-stock">
        <span className="book-card-stock-label">Copies Available</span>
        <div className="stock-indicator">
          <span className={`stock-dot${low ? ' low' : ' ok'}`} />
          <span className={`book-card-stock-value${low ? ' low' : ''}`}>
            {book.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}