'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SendMessageForm() {
  const router = useRouter();
  const [fromId, setFromId] = useState(1); // example admin ID; replace with real data
  const [toId, setToId] = useState(2);     // example user ID; replace with real data
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return; // prevent multiple submissions

    setSending(true);
    try {
      const res = await fetch('/api/admin/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId, content }),
      });

      if (res.ok) {
        setContent('');
        setStatus('✅ Message sent successfully');
      } else {
        const error = await res.json();
        setStatus(`❌ Error: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus('❌ Unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* ✅ Back button */}
      <button
        onClick={() => router.push('/admin/dashboard/')}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
      >
        ⬅ Back to Dashboard
      </button>

      <form onSubmit={handleSubmit}>
        <h2>Send Message</h2>

        <div>
          <label>From (Admin ID):</label>
          <input
            type="number"
            value={fromId}
            onChange={(e) => setFromId(Number(e.target.value))}
            required
            disabled={sending}
          />
        </div>

        <div>
          <label>To (User ID):</label>
          <input
            type="number"
            value={toId}
            onChange={(e) => setToId(Number(e.target.value))}
            required
            disabled={sending}
          />
        </div>

        <div>
          <label>Message:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={sending}
          />
        </div>

        <button type="submit" disabled={sending || content.trim() === ''}>
          {sending ? 'Sending...' : 'Send'}
        </button>

        {status && <p>{status}</p>}
      </form>
    </div>
  );
}
