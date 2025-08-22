'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  isAdmin: boolean;
  createdAt: string;
};

export default function ListUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Logged-in admin
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);

  // Add form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch current admin from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }
    const parsed: User = JSON.parse(storedUser);
    if (!parsed.isAdmin) {
      router.push('/client/dashboard');
      return;
    }
    setCurrentAdmin(parsed);
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/list');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !password) {
      alert('Full name, phone, and password are required');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/admin/users/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          password,
          isAdmin,
          email: '124tegeri@gmail.com',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to add user');
      } else {
        alert('User added successfully!');
        setFullName('');
        setPhone('');
        setPassword('');
        setIsAdmin(false);
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  // Start editing user
  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditFullName(user.fullName);
    setEditPhone(user.phone);
    setEditPassword('');
    setEditIsAdmin(user.isAdmin);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUserId(null);
  };

  // Submit edit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;

    if (!editFullName || !editPhone) {
      alert('Full name and phone are required');
      return;
    }
    setEditLoading(true);

    try {
      const res = await fetch('/api/admin/users/list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUserId,
          fullName: editFullName,
          phone: editPhone,
          password: editPassword || undefined,
          isAdmin: editIsAdmin,
          email: '124tegeri@gmail.com',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update user');
      } else {
        alert('User updated successfully!');
        cancelEditing();
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch('/api/admin/users/list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete user');
      } else {
        alert('User deleted successfully!');
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete user');
    }
  };

  if (!currentAdmin) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={() => router.push('/admin/dashboard')}
        style={{
          marginBottom: '20px',
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ⬅ Back to Dashboard
      </button>

      {/* Welcome message */}
      <h2>
        Welcome, <strong>{currentAdmin.fullName}</strong> 👋
      </h2>
      <p>Your phone number is: <strong>{currentAdmin.phone}</strong></p>

      

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Add new user form */}
      <form onSubmit={handleAddUser} style={{ marginBottom: 20 }}>
        <h3>Add New User</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Phone (e.g., 07XXXXXXXX)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <label style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />{' '}
          Admin
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add User'}
        </button>
      </form>
      <h2>User List</h2>

      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7}>No users found.</td>
            </tr>
          ) : (
            users.map((user) =>
              editingUserId === user.id ? (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                  </td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={editIsAdmin}
                        onChange={(e) => setEditIsAdmin(e.target.checked)}
                      />{' '}
                      Admin
                    </label>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <input
                      type="password"
                      placeholder="New Password (optional)"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      style={{ marginBottom: 4 }}
                    />
                    <br />
                    <button onClick={handleEditUser} disabled={editLoading} style={{ marginRight: 8 }}>
                      {editLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={cancelEditing} disabled={editLoading}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.phone}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.isAdmin ? 'admin' : 'user'}</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => startEditing(user)} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
