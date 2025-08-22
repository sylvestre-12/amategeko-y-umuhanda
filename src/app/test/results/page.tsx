'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type TestResult = {
  score: number;
  name: string;
  phone: string;
};

export default function ResultPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User not logged in');
      return;
    }

    const { id } = JSON.parse(storedUser);

    let timer: NodeJS.Timeout;

    fetch(`/api/test/results?userId=${id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch result');
        }
        const data = await res.json();
        if (typeof data.score !== 'number') {
          throw new Error('Invalid score format');
        }
        setResult(data);

        // Start countdown
        timer = setInterval(() => {
          setCountdown((prev) => Math.max(prev - 1, 0));
        }, 1000);
      })
      .catch((err) => {
        setError(err.message);
      });

    // Cleanup
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Separate effect for redirect
  useEffect(() => {
    if (countdown === 0) {
      router.push('/auth/login');
    }
  }, [countdown, router]);

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!result) return <p>Loading result...</p>;

  const status = result.score < 12 ? '❌ Fail (Try for Improvement)' : '✅ Pass';

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>📊 Test Result</h2>
      <p><strong>Name:</strong> {result.name}</p>
      <p><strong>Phone:</strong> {result.phone}</p>
      <p><strong>Score:</strong> {result.score} / 20</p>
      <p><strong>Status:</strong> {status}</p>
      <p style={{ color: 'gray' }}>
        Redirecting to login in {countdown} second{countdown == 1 ? 's' : ''}...
      </p>
    </div>
  );
}
