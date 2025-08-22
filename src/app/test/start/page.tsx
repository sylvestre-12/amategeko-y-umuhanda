'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StartPage() {
  const router = useRouter();

  const [countdown, setCountdown] = useState(5);
  const [user, setUser] = useState<{ id: number; fullName: string; phone: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false); // <-- moved inside component

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (countdown === 0) {
      if (!user) return; // safety check

      fetch(`/api/test/start?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
            router.push('/'); // or wherever you want to send them on error
            return;
          }
          localStorage.setItem('questions', JSON.stringify(data.questions));
          localStorage.setItem('startTime', new Date().toISOString());
          router.push('/test/submit');
        })
        .catch(() => {
          alert('Exam Limit: continue to use pay: 5000 RWF');
          router.push('/');
        });
      return;
    }

    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, router, user]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {user && (
        <div style={{ marginBottom: '20px' }}>
          <h3>👤 {user.fullName}</h3>
          <p>📞 {user.phone}</p>
        </div>
      )}

      <h2>Test starting in five seconds {countdown} seconds...</h2>

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
    </div>
  );
}
