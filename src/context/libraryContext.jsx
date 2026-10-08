import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const LibraryContext = createContext();

// Default accounts seeded for easy lecturer access
export const DEFAULT_ADMIN = {
  id: 1,
  name: 'Admin',
  membershipId: 'ADMIN001',
  role: 'admin',
};

export const DEFAULT_MEMBER = {
  id: 2,
  name: 'Tebello Member',
  membershipId: 'MEM001',
  role: 'member',
};

export const DEFAULT_LIBRARIAN = {
  id: 3,
  name: 'Sarah Librarian',
  membershipId: 'LIB001',
  role: 'librarian',
};

// Default seed books (includes books with < 2 copies to demonstrate low-stock alert)
export const DEFAULT_BOOKS = [
  {
    id: 101,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    isbn: '9780743273565',
    quantity: 4,
  },
  {
    id: 102,
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    genre: 'Technology',
    isbn: '9780132350884',
    quantity: 1, // Low stock (< 2 copies)
  },
  {
    id: 103,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Classics',
    isbn: '9780061120084',
    quantity: 5,
  },
  {
    id: 104,
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    genre: 'Technology',
    isbn: '9780596517748',
    quantity: 1, // Low stock (< 2 copies)
  },
  {
    id: 105,
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    genre: 'Literature',
    isbn: '9780385474542',
    quantity: 6,
  },
  {
    id: 106,
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma et al.',
    genre: 'Technology',
    isbn: '9780201633610',
    quantity: 3,
  },
];

// Default sample transactions
export const DEFAULT_TRANSACTIONS = [
  {
    id: 1,
    bookId: 101,
    title: 'The Great Gatsby',
    type: 'add',
    amount: 5,
    membershipId: 'ADMIN001',
    userName: 'Admin',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    bookId: 101,
    title: 'The Great Gatsby',
    type: 'borrow',
    amount: 1,
    membershipId: 'MEM001',
    userName: 'Tebello Member',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    bookId: 102,
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    type: 'add',
    amount: 2,
    membershipId: 'ADMIN001',
    userName: 'Admin',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 4,
    bookId: 102,
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    type: 'borrow',
    amount: 1,
    membershipId: 'MEM001',
    userName: 'Tebello Member',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 5,
    bookId: 105,
    title: 'Things Fall Apart',
    type: 'add',
    amount: 6,
    membershipId: 'ADMIN001',
    userName: 'Admin',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function LibraryProvider({ children }) {
  const [books, setBooks] = useLocalStorage('books', []);
  const [users, setUsers] = useLocalStorage('users', []);
  const [transactions, setTransactions] = useLocalStorage('transactions', []);
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

  // Seed default data and update any existing 'John Member' or 'Admin User' in localStorage
  useEffect(() => {
    if (!users || users.length === 0) {
      setUsers([DEFAULT_ADMIN, DEFAULT_MEMBER, DEFAULT_LIBRARIAN]);
    } else {
      // Migrate existing local storage users
      setUsers(
        users.map((u) => {
          if (u.name === 'John Member' || u.membershipId === 'MEM001') {
            return { ...u, name: 'Tebello Member' };
          }
          if (u.name === 'Admin User' || (u.membershipId === 'ADMIN001' && u.name !== 'Admin')) {
            return { ...u, name: 'Admin' };
          }
          return u;
        })
      );
    }

    if (currentUser) {
      if (currentUser.name === 'John Member' || currentUser.membershipId === 'MEM001') {
        setCurrentUser({ ...currentUser, name: 'Tebello Member' });
      } else if (currentUser.name === 'Admin User' || (currentUser.membershipId === 'ADMIN001' && currentUser.name !== 'Admin')) {
        setCurrentUser({ ...currentUser, name: 'Admin' });
      }
    }

    if (!transactions || transactions.length === 0) {
      setTransactions(DEFAULT_TRANSACTIONS);
    } else {
      setTransactions(
        transactions.map((t) => {
          let updated = { ...t };
          if (updated.userName === 'John Member' || updated.membershipId === 'MEM001') {
            updated.userName = 'Tebello Member';
          }
          if (updated.userName === 'Admin User' || updated.membershipId === 'ADMIN001') {
            updated.userName = 'Admin';
          }
          return updated;
        })
      );
    }

    if (!books || books.length === 0) {
      setBooks(DEFAULT_BOOKS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: Member borrows a book
  const borrowBook = (bookId, user) => {
    const book = books.find((b) => b.id === Number(bookId));
    if (!book) return { success: false, message: 'Book not found.' };
    if (book.quantity < 1) return { success: false, message: 'This book is currently out of stock.' };

    const newBooks = books.map((b) =>
      b.id === book.id ? { ...b, quantity: b.quantity - 1 } : b
    );
    setBooks(newBooks);

    const newTx = {
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      type: 'borrow',
      amount: 1,
      membershipId: user?.membershipId || 'GUEST',
      userName: user?.name || 'Library User',
      date: new Date().toISOString(),
    };
    setTransactions([newTx, ...transactions]);

    return { success: true, message: `Successfully borrowed "${book.title}".` };
  };

  // Helper: Member returns a book
  const returnBook = (bookId, user) => {
    const book = books.find((b) => b.id === Number(bookId));
    if (!book) return { success: false, message: 'Book not found.' };

    const newBooks = books.map((b) =>
      b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b
    );
    setBooks(newBooks);

    const newTx = {
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      type: 'return',
      amount: 1,
      membershipId: user?.membershipId || 'GUEST',
      userName: user?.name || 'Library User',
      date: new Date().toISOString(),
    };
    setTransactions([newTx, ...transactions]);

    return { success: true, message: `Successfully returned "${book.title}".` };
  };

  // Helper: Reset demo data anytime
  const resetDemoData = () => {
    setBooks(DEFAULT_BOOKS);
    setUsers([DEFAULT_ADMIN, DEFAULT_MEMBER, DEFAULT_LIBRARIAN]);
    setTransactions(DEFAULT_TRANSACTIONS);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        setBooks,
        users,
        setUsers,
        transactions,
        setTransactions,
        currentUser,
        setCurrentUser,
        borrowBook,
        returnBook,
        resetDemoData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within LibraryProvider');
  return context;
}