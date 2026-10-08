import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/libraryContext';


export default function Login() {
  const { users, setCurrentUser } = useLibrary();
  const [membershipId, setMembershipId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!membershipId.trim()) {
      setError('Please enter your Membership ID.');
      return;
    }
    const user = users.find(
      (u) => u.membershipId.toLowerCase() === membershipId.trim().toLowerCase()
    );
    if (!user) {
      setError('Invalid Membership ID. Please check and try again.');
      return;
    }
    setCurrentUser(user);
    navigate('/');
  };

  return (
    <div className="login-page" id="login-page">
      <div className="login-container">

        <div className="login-logo">
          <span className="login-tag">LMS PORTAL</span>
          <h1>Bacha Community Library</h1>
          <p>Library Management System</p>
        </div>

        
        <div className="login-card">
          <h2>Sign In to Portal</h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="membership-id">
                Membership ID
              </label>
              <input
                className={`form-input${error ? ' error' : ''}`}
                id="membership-id"
                value={membershipId}
                onChange={(e) => {
                  setMembershipId(e.target.value);
                  setError('');
                }}
                placeholder="e.g MEM001 and ADMIN001"
                autoFocus
              />
              {error && (
                <span className="form-error">
                  {error}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" id="login-submit-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}