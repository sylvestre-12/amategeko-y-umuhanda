'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignupResponse {
  token?: string;
  user?: {
    id: number;
    fullName: string;
    phone: string;
    email?: string;
  };
  error?: string;
}

const SignupPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
  });

  const [status, setStatus] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: '124tegeri@gmail.com', // default email fallback
        }),
      });

      const result: SignupResponse = await response.json();

      if (response.ok) {
        setStatus('✅ Signup successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Something went wrong.');
    }
  };

  return (
    <div style={{ marginTop: 50, display: 'flex', justifyContent: 'center' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          border: '1px solid #ccc',
          padding: 30,
          borderRadius: 10,
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#d9534f',
            textAlign: 'center',
            lineHeight: 1.6,
            backgroundColor: '#fff3cd',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #f0ad4e',
            marginBottom: 20,
          }}
        >
          USHAKA KWIGA NO KWISUZUMA AMANOTA <br />
          WAGIRA UKOZE IKIZAMI MUBIRYANYE N&apos;AMATEGEKO Y&apos;UMUHANDA
        </h3>

        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Sign Up</h2>

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

        <table cellPadding={10} style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td><label htmlFor="fullName">Full Name:</label></td>
              <td>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{ padding: 8, width: '100%' }}
                  placeholder="Your full name"
                />
              </td>
            </tr>

            <tr>
              <td><label htmlFor="phone">Phone:</label></td>
              <td>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ padding: 8, width: '100%' }}
                  placeholder="07XXXXXXXX"
                />
              </td>
            </tr>

            <tr>
              <td><label htmlFor="password">Password:</label></td>
              <td>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{ padding: 8, width: '100%' }}
                  placeholder="Password"
                />
              </td>
            </tr>

            <tr>
              <td colSpan={2} style={{ textAlign: 'center', paddingBottom: 15 }}>
                <p style={{ margin: '5px 0' }}>
                  <Link href="/auth/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
                    Already have an account?
                  </Link>
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
                    borderRadius: 5,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Sign Up
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {status && (
          <p style={{ marginTop: 20, textAlign: 'center', color: status.includes('Error') ? 'red' : 'green' }}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default SignupPage;
