import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/libraryContext';


export default function Navbar() {
  const { currentUser, setCurrentUser } = useLibrary();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'librarian';

  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="nav-brand">
        <span className="nav-brand-badge">LMS</span>
        <h2>Bacha Community Library</h2>
      </div>

      {currentUser && (
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          id="nav-hamburger-btn"
        >
          Menu
        </button>
      )}

      {currentUser && (
        <div className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
          {isAdmin ? (
            <>
              <NavLink to="/" end onClick={() => setMenuOpen(false)}>
                Admin Dashboard
              </NavLink>
              <NavLink to="/books" onClick={() => setMenuOpen(false)}>
                Book Management
              </NavLink>
              <NavLink to="/transactions" onClick={() => setMenuOpen(false)}>
                Stock & Transactions
              </NavLink>
              <NavLink to="/users" onClick={() => setMenuOpen(false)}>
                User Management
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end onClick={() => setMenuOpen(false)}>
                Member Dashboard
              </NavLink>
              <NavLink to="/#browse" onClick={() => {
                setMenuOpen(false);
                const el = document.getElementById('browse-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Browse & Borrow
              </NavLink>
              <NavLink to="/#my-history" onClick={() => {
                setMenuOpen(false);
                const el = document.getElementById('my-history-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                My History
              </NavLink>
            </>
          )}

          <div className="nav-user-section">
            <div className="nav-user-avatar">{initials}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{currentUser.name}</span>
              <span className={`role-badge ${currentUser.role}`}>{currentUser.role}</span>
            </div>
            <button
              className="nav-logout-btn"
              onClick={handleLogout}
              id="logout-btn"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}