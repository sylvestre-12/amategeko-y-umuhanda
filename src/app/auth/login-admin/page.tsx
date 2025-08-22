'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get('phone') || '';
  
  const [form, setForm] = useState({ phone: '', otp: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (phoneFromQuery) {
      setForm(prev => ({ ...prev, phone: phoneFromQuery }));
    }
  }, [phoneFromQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setForm({ phone: '', otp: '', newPassword: '' });
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '50px auto',
      padding: 20,
      border: '1px solid #ccc',
      borderRadius: 8,
    }}>
      <h2 style={{ textAlign: 'center' }}>Reset Password</h2>

      {phoneFromQuery && (
        <div style={{
          marginBottom: 20,
          padding: 10,
          backgroundColor: '#f0f8ff',
          border: '1px solid #b0c4de',
          borderRadius: 5,
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Resetting password for: <span style={{ color: '#0074D9' }}>{phoneFromQuery}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: 5 }}>Phone</label>
          <input
            id="phone"
            type="text"
            placeholder="07xxxxxxxx"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="otp" style={{ display: 'block', marginBottom: 5 }}>OTP</label>
          <input
            id="otp"
            type="text"
            placeholder="6-digit code"
            value={form.otp}
            onChange={e => setForm({ ...form, otp: e.target.value })}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label htmlFor="newPassword" style={{ display: 'block', marginBottom: 5 }}>New Password</label>
          <input
            id="newPassword"
            type="password"
            placeholder="At least 8 characters"
            value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          Reset Password
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: 15, textAlign: 'center' }}>{error}</p>}
      {message && <p style={{ color: 'green', marginTop: 15, textAlign: 'center' }}>{message}</p>}
    </div>
  );
}
