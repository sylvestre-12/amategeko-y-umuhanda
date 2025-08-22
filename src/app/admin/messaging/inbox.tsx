'use client';

import { useEffect, useState } from 'react';

type Message = {
  id: number;
  content: string;
  from: {
    fullName: string;
    phone: string;
  };
  createdAt: string;
};

export default function InboxList({ userId }: { userId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await fetch(`/api/admin/messaging/inbox?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch inbox');
        const data = await res.json();
        setMessages(data.inbox);
      } catch (err) {
        console.error(err);
        setError('Failed to load messages.');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [userId]);

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

return (
  <div>
    <h2>📥 Inbox</h2>
    <h1 style={{ color: 'red', fontSize: '24px', backgroundColor: 'yellow' }}>
  LEARN IS FREE BUT TWO ATTEMPT FOR EXAM ,NB:NOT FREE
</h1>


    {/* Static message header */}
    <p style={{ 
      backgroundColor: '#e0f7fa', 
      padding: '10px', 
      borderRadius: '6px', 
      marginBottom: '1rem', 
      fontStyle: 'italic' 
    }}>
      Test your knowledge, reading is free but two attempts for exam you will pay.
    </p>

    {messages.length === 0 ? (
      <p>No messages received.</p>
    ) : (
      <ul>
        {messages.map((msg) => (
          <li key={msg.id} style={{ marginBottom: '1rem' }}>
            <strong>From:</strong> {msg.from.fullName} ({msg.from.phone})<br />
            <strong>Message:</strong> {msg.content}<br />
            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    )}
  </div>
);

}
