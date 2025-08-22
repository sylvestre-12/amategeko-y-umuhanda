'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Message = {
  id: number;
  content: string;
  from: string;
  createdAt: string;
};

type User = {
  id: number;
  fullName: string;
  phone: string;
  isAdmin: boolean;
};

export default function TestLandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchAttempts = async () => {
      try {
        const res = await fetch(`/api/test/attempts?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setAttempts(data.count);
          setAttemptsExceeded(data.count >= 2 && !user.isAdmin);
        }
      } catch (error) {
        console.error('Failed to fetch attempts:', error);
      }
    };

    fetchAttempts();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/admin/messaging/inbox?userId=${user.id}`);
        if (!res.ok) throw new Error('Failed to load messages');
        const data = await res.json();
        setMessages(data.inbox);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;
    setSending(true);
    try {
      const adminUserId = 1;
      await fetch('/api/admin/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: user.id,
          toId: adminUserId,
          content: messageText.trim(),
        }),
      });
      setMessageText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleLearnRoadLawClick = () => {
    if (attemptsExceeded) {
      alert('⚠️ You are allowed only 2 attempts for reading. Please pay 5000 RWF to 0786278953 to continue , then use it for one month.');
      return;
    }
    router.push('/test/questions');
  };

  const handleTakeExamClick = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/test/start?userId=${user.id}`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || '⚠️ You are allowed only 2 attempts for exam. Please pay 5000 RWF to 0786278953 to continue , then use it for one month.');
        return;
      }
      router.push('/test/start');
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: 20, textAlign: 'center', position: 'relative' }}>
      {/* Login Button at Top Right */}
      <button
        onClick={() => router.push('/auth/login')}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '8px 14px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
         For Login
      </button>

      <h1>Welcome, {user.fullName}!</h1>
      <p>Your registered phone: <strong>{user.phone}</strong></p>

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
          Contact via WhatsApp: <a href="https://wa.me/250786278953" target="_blank" rel="noopener noreferrer">0786278953</a>,<br />
          Email: <a href="mailto:124tegeri@gmail.com">124tegeri@gmail.com</a>
        </div>
      )}

      <div style={{ border: '2px solid red', padding: 10, marginBottom: 10 }}>
        <h3 style={{ color: 'blue', fontSize: 16 }}>
          Test your knowledge, reading is free but after two attempts you will pay.
        </h3>
      </div>

      <div style={{ marginTop: 30 }}>
        <button
          onClick={handleLearnRoadLawClick}
          style={{
            padding: '12px 20px',
            margin: 10,
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          📖 Learn Road Law
        </button>

        <button
          onClick={handleTakeExamClick}
          style={{
            padding: '12px 20px',
            margin: 10,
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          📝 Take the Exam
        </button>
        <button
    onClick={() => {
      if (!user) return;

      if (user.isAdmin) {
        router.push('/test/history');
        return;
      }

      if (attempts > 2) {
        alert(
          '⚠️ You are allowed only 2 attempts for viewing history. Please pay 5000 RWF to 0786278953 to continue, then use it for one month.'
        );
        return;
      }

      router.push('/test/history');
    }}
    style={{
      padding: '12px 20px',
      margin: 10,
      backgroundColor: '#ffc107',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
    }}
  >
    📊 View Test History
  </button>
        


      </div>

      {/* Messaging Section */}
      <div style={{ marginTop: 40, textAlign: 'left', maxWidth: 500, marginInline: 'auto' }}>
        <h3>📩 Chat with Admin Or 124tegeri@gmail.com</h3>
        <div
          style={{
            border: '1px solid #ccc',
            padding: 10,
            height: 200,
            overflowY: 'auto',
            background: '#f9f9f9',
          }}
        >
          {loadingMessages ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  textAlign: msg.from === user.phone ? 'right' : 'left',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: msg.from === user.phone ? '#d1ffd1' : '#fff',
                    border: '1px solid #ccc',
                  }}
                >
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.7em', color: '#666' }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
