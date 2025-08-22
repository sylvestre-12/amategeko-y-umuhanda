'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type HistoryItem = {
  score: number;
  duration?: number; // optional, if you track test time
  createdAt: string; // match API response (ISO string from server)
};

type User = {
  id: number;
  fullName: string;
  phone: string;
  isAdmin: boolean;
};

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);

    // Check attempts first
    fetch(`/api/test/attempts?userId=${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (!parsedUser.isAdmin && data.count >= 2) {
          setBlocked(true);
        } else {
          // If not blocked, fetch history
          fetch(`/api/test/history?userId=${parsedUser.id}`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data.history)) {
                setHistory(data.history);
              }
            })
            .catch(err => console.error('Failed to fetch history:', err));
        }
      })
      .catch(err => console.error('Failed to fetch attempts:', err));
  }, [router]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString();
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'Georgia, serif' }}>
      <h2 style={{ textAlign: 'center' }}>Your Test History</h2>

      {/* Greeting */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p>
          👋 Hello <strong>{user.fullName}</strong>, <br />
          Your phone number is: <strong>{user.phone}</strong>
        </p>
        <p>Your historical exam information is below:</p>
      </div>

      {/* Help toggle */}
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

      {/* History */}
      {blocked ? (
        <p style={{ color: 'red', textAlign: 'center' }}>
          ⚠️ You are allowed only 2 attempts. Please pay 5000 RWF to 0786278953 to continue.
        </p>
      ) : history.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No history found.</p>
      ) : (
        <div>
          {history.map((h, i) => (
            <div key={i} style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
              <strong>Date:</strong> {formatDate(h.createdAt)} <br />
              <strong>Score:</strong> {typeof h.score === 'number' ? h.score : 'N/A'}/20 <br />
              {h.duration !== undefined && (
                <>
                  <strong>Duration:</strong>{' '}
                  {typeof h.duration === 'number' ? h.duration.toFixed(1) : 'N/A'} min
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Back button */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={() => router.push('/auth/login')}
          style={{
            padding: '8px 14px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
