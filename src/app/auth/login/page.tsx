'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  isAdmin: boolean;
}

interface LoginResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

const LoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: LoginResponse = await response.json();

      if (response.ok) {
        if (result.message === 'OTP sent to admin email') {
          setAwaitingOtp(true);
          setStatus('✅ OTP sent. Please check your email.');
        } else if (result.token && result.user) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          router.push('/test');
        }
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Network or server error.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Verifying OTP...');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });

      const result: LoginResponse = await response.json();

      if (response.ok && result.token && result.user) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        router.push('/admin/dashboard');
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to verify OTP.');
    }
  };

  return (
    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
      {!awaitingOtp ? (
        <form
          onSubmit={handleSubmit}
          style={{
            border: '1px solid #ccc',
            padding: '30px',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
            width: '400px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#d9534f',
              textAlign: 'center',
              lineHeight: '1.6',
              backgroundColor: '#fff3cd',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #f0ad4e',
              marginBottom: '20px',
            }}
          >
            UGIYE KWIGA AMATEGEKO Y&apos;UMUHANDA<br />
            CYANGWA UREBE AMANOTA WAGIRA
          </h3>

          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>

          <h3
            style={{ textAlign: 'center', cursor: 'pointer', color: '#007bff' }}
            onClick={() => setShowHelp(!showHelp)}
          >
            For Help click here
          </h3>

          {showHelp && (
            <div
              style={{
                backgroundColor: '#e9ecef',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#333',
              }}
            >
              Contact via WhatsApp:{' '}
              <a href="https://wa.me/250786278953" target="_blank" rel="noopener noreferrer">
                0786278953
              </a>
              ,<br />
              Email: <a href="mailto:124tegeri@gmail.com">124tegeri@gmail.com</a>
            </div>
          )}

          <table cellPadding="10" style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="phone">Phone:</label>
                </td>
                <td>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="password">Password:</label>
                </td>
                <td>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </td>
              </tr>

              <tr>
                <td colSpan={2} style={{ textAlign: 'center', paddingBottom: '15px' }}>
                  <p style={{ margin: '5px 0' }}>
                    <Link
                      href="/auth/signup"
                      style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                      Don&apos;t have an account? Sign up
                    </Link>
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    {formData.phone === '0786278953' ? (
                      <Link
                        href="/auth/forgot-password"
                        style={{ color: '#007bff', textDecoration: 'underline' }}
                      >
                        Forgot your password?
                      </Link>
                    ) : (
                      <span
                        style={{
                          color: 'gray',
                          cursor: 'not-allowed',
                          userSelect: 'none',
                        }}
                      >
                        Forgot your password?
                      </span>
                    )}
                  </p>
                </td>
              </tr>

              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    Login
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {status && (
            <p
              style={{
                marginTop: '20px',
                textAlign: 'center',
                color: status.includes('Error') ? 'red' : 'green',
              }}
            >
              {status}
            </p>
          )}
        </form>
      ) : (
        <form
          onSubmit={handleOtpSubmit}
          style={{
            border: '1px solid #ccc',
            padding: '30px',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
            width: '400px',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Enter OTP</h2>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter OTP"
            style={{ padding: '10px', marginBottom: '20px', width: '100%' }}
          />

          <button
            type="submit"
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Verify OTP
          </button>

          {status && <p style={{ marginTop: '15px', textAlign: 'center' }}>{status}</p>}
        </form>
      )}
    </div>
  );
};

export default LoginPage;
