'use client';

import { useRouter } from 'next/navigation';
import SendMessageForm from './sendm';  // Make sure this matches your actual filename 'sendm.tsx'
import InboxList from './inbox';

export default function MessagingPage() {
  const router = useRouter();
  // TODO: replace hardcoded adminUserId with actual dynamic admin user ID
  const adminUserId = 2;

  return (
    <div style={{ padding: '2rem' }}>
      {/* ✅ Back button */}
      <button
        onClick={() => router.push('/admin/dashboard/')}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
      >
        ⬅ Back to Dashboard
      </button>

      <h1>📨 Admin Messaging</h1>
      <SendMessageForm />
      <hr style={{ margin: '2rem 0' }} />
      <InboxList userId={adminUserId} />
    </div>
  );
}
