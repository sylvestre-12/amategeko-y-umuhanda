'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  fullName: string;
  phone: string;
  isAdmin: boolean;
};

type Message = {
  id: number;
  content: string;
  from: {
    id: number;
    fullName: string;
    phone: string;
  };
  toId: number;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'send'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For sending message by user ID
  const [toId, setToId] = useState<number | ''>('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string>('');

  // Load user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/auth/login';
      return;
    }
    const parsed: User = JSON.parse(storedUser);
    if (!parsed.isAdmin) {
      window.location.href = '/client/dashboard';
      return;
    }
    setUser(parsed);
  }, []);

  // Fetch inbox messages when activeTab = inbox or on mount
  useEffect(() => {
    if (activeTab !== 'inbox' || !user) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/messaging/inbox?userId=${user.id}`);
        if (!res.ok) throw new Error('Failed to load inbox');
        const data = await res.json();
        setMessages(data.inbox);
      } catch (err) {
        setError((err as Error).message);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeTab, user]);

  // Handle send message form submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !toId || !content.trim()) return;

    setSending(true);
    setSendStatus('');
    try {
      const res = await fetch('/api/admin/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: user.id,
          toId,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send message');
      }

      setSendStatus('✅ Message sent successfully');
      setContent('');
      setToId('');
    } catch (err) {
      setSendStatus(`❌ ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Dashboard</h1>
      <p className="mb-6">
        Welcome, <strong>{user.fullName}</strong> 👋
      </p>
{/* Updated grid with 3 links */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
  <a
    href="/admin/users/list"
    className="p-4 border rounded shadow hover:bg-gray-50 text-center"
  >
    👥 Manage Users
  </a>
  <a
    href="/admin/questions"
    className="p-4 border rounded shadow hover:bg-gray-50 text-center"
  >
    ❓ Manage Questions
  </a>
  <a
    href="/test"
    className="p-4 border rounded shadow hover:bg-gray-50 text-center bg-green-100 hover:bg-green-200"
  >
    📝 Go to Quiz
  </a>
  <a
    href="/auth/login"
    className="p-4 border rounded shadow hover:bg-gray-50 text-center bg-yellow-100 hover:bg-yellow-200"
  >
    🔑 Forgot Password
  </a>
</div>



      {/* Inbox / Send Message Tabs */}
      <div>
        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'inbox' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            📥 View Inbox
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'send' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('send')}
          >
            ✉️ Send Message
          </button>
        </div>

        {activeTab === 'inbox' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Inbox Messages</h2>

            {loadingMessages && <p>Loading messages...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loadingMessages && messages.length === 0 && (
              <p>No messages received yet.</p>
            )}

            <ul>
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className="border p-4 mb-4 rounded shadow bg-white"
                >
                  <p>
                    <strong>From:</strong> {msg.from.fullName} ({msg.from.phone})
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2">{msg.content}</p>
                  <button
                    onClick={() => {
                      setActiveTab('send');
                      setToId(msg.from.id);
                      setContent('Re: ');
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Reply
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === 'send' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
            <form
              onSubmit={handleSendMessage}
              className="flex flex-col gap-4 max-w-lg"
            >
              <label>
                To User ID:
                <input
                  type="number"
                  value={toId}
                  onChange={(e) =>
                    setToId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </label>
              <label>
                Message:
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border p-2 rounded w-full"
                  rows={4}
                  required
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
              {sendStatus && (
                <p
                  className={`${
                    sendStatus.startsWith('✅')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {sendStatus}
                </p>
              )}
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
