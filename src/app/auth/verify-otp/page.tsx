'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');  // "login" or "forgot-password"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Verifying...');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('✅ OTP Verified. Redirecting...');

        // Save token and user info
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        if (mode === 'forgot-password') {
          router.push('/reset-password?phone=' + encodeURIComponent(phone));
        } else if (mode === 'login') {
          if (result.user.isAdmin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/test/page');
          }
        } else {
          // default fallback
          router.push('/auth/reset-password');
        }
      } else {
        setStatus(`❌ ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Something went wrong.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', marginTop: 80, padding: 30, border: '1px solid #ccc', borderRadius: 10 }}>
      <h2 style={{ textAlign: 'center' }}>Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <label>Phone:</label>
        <input
          type="text"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="07XXXXXXXX"
          required
          style={{ width: '100%', padding: 8, marginBottom: 15 }}
        />

        <label>OTP:</label>
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          required
          style={{ width: '100%', padding: 8, marginBottom: 20 }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          Verify
        </button>
        {status && <p style={{ marginTop: 20, color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>}
      </form>
    </div>
  );
};

export default VerifyOtpPage;
