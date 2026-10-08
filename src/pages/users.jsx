import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/libraryContext';


export default function Users() {
  const { users, setUsers, currentUser } = useLibrary();
  const emptyForm = { name: '', membershipId: '', role: 'member' };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        membershipId: editing.membershipId,
        role: editing.role,
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
    
  }, [editing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.membershipId.trim()) {
      setError('Name and Membership ID are required fields.');
      return;
    }

    const duplicate = users.find(
      (u) =>
        u.membershipId.toLowerCase() === form.membershipId.trim().toLowerCase() &&
        u.id !== editing?.id
    );
    if (duplicate) {
      setError('A user with this Membership ID already exists.');
      return;
    }

    if (editing) {
      setUsers(
        users.map((u) =>
          u.id === editing.id
            ? { ...u, name: form.name.trim(), membershipId: form.membershipId.trim(), role: form.role }
            : u
        )
      );
      setEditing(null);
    } else {
      setUsers([
        ...users,
        {
          id: Date.now(),
          name: form.name.trim(),
          membershipId: form.membershipId.trim(),
          role: form.role,
        },
      ]);
    }

    setForm(emptyForm);
    setError('');
  };

  const deleteUser = (id) => {
    const target = users.find((u) => u.id === id);
    if (target?.id === currentUser?.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${target?.name}"?`)) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  
  if (!isAdmin) {
    return (
      <div className="page" id="users-page">
        <div className="page-header">
          <h1>User Management</h1>
        </div>
        <div className="section-card">
          <div className="access-denied" id="access-denied">
            <span className="role-tag member">MEMBER ACCOUNT</span>
            <h2>Administrator Access Restricted</h2>
            <p>
              Only administrators have permission to create, update, or remove user accounts.
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
    <div className="page" id="users-page">
      <div className="page-header">
        <div className="role-tag admin">ACCESS CONTROL</div>
        <h1>User Account Management</h1>
        <p>Register new community library members, assign staff roles, or update credentials</p>
      </div>

      <div className="page-grid">
        <div className="form-card" id="user-form-card">
          <h3>{editing ? 'Update User Details' : 'Register New User'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Full Name
              </label>
              <input
                className={`form-input${error && !form.name.trim() ? ' error' : ''}`}
                id="user-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alice Smith"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-membership-id">
                Membership ID
              </label>
              <input
                className={`form-input${error && !form.membershipId.trim() ? ' error' : ''}`}
                id="user-membership-id"
                name="membershipId"
                value={form.membershipId}
                onChange={handleChange}
                placeholder="e.g. MEM002 or ADMIN002"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-role">
                Assigned Role
              </label>
              <select
                className="form-select"
                id="user-role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="member">Member (Browse & Borrow)</option>
                <option value="librarian">Librarian (Staff Management)</option>
                <option value="admin">Admin (Full System Privileges)</option>
              </select>
            </div>

            {error && (
              <div className="message-bar error" id="user-form-error">
                <span>{error}</span>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" id="user-submit-btn">
                {editing ? 'Update User' : 'Register User'}
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                  id="user-cancel-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        
        <div>
          {users.length === 0 ? (
            <div className="section-card">
              <div className="empty-state" id="users-empty">
                <h3>No registered users found</h3>
                <p>Register members using the form on the left.</p>
              </div>
            </div>
          ) : (
            <div className="table-container" id="users-table-container">
              <div className="table-header">
                <h2>User Directory ({users.length})</h2>
              </div>
              <table className="data-table" id="users-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Membership ID</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem' }}>
                        {u.membershipId}
                      </td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="btn btn-sm btn-purple-subtle"
                            onClick={() => setEditing(u)}
                            id={`edit-user-${u.id}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteUser(u.id)}
                            id={`delete-user-${u.id}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}