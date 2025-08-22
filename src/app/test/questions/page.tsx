'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: 'a' | 'b' | 'c' | 'd';
  createdAt: string;
};

type FetchResponse = {
  questions?: Question[];
  error?: string;
};

export default function QuestionList() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/admin/questions/list');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json: FetchResponse = await res.json();

        if (json.questions) {
          setQuestions(json.questions);
          setError(null);
        } else {
          setError(json.error || 'Error loading questions');
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  if (loading) return <p className="p-4">Loading questions...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (questions.length === 0) return <p className="p-4">No questions found.</p>;

  const renderOption = (label: 'a' | 'b' | 'c' | 'd', text: string, correct: string) => {
    const isCorrect = label.toLowerCase() === correct.toLowerCase();
    const isImg = /\.(jpeg|jpg|png|svg|gif|webp)$/i.test(text.trim());

    const content = isImg ? (
      <img
        src={text.startsWith('/') ? text : `/images/${text}`} // ✅ prepend /images/ if needed
        alt={label}
        style={{ maxWidth: 80, maxHeight: 60 }}
        onError={(e) => (e.currentTarget.src = '/fallback.png')}
      />
    ) : (
      text
    );

    return (
      <p
        key={label}
        style={{
          color: isCorrect ? 'red' : 'black',
          fontWeight: isCorrect ? 'bold' : 'normal',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        className="ml-4 font-medium"
      >
        <span>{label.toUpperCase()}.</span> {content}
        {isCorrect && <span aria-label="correct answer" role="img">✅</span>}
      </p>
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans relative">
      {/* Fixed Back Button */}
      <button
        onClick={() => router.push('/test')}
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#007bff',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 999,
          cursor: 'pointer',
        }}
      >
        ⬅ Back
      </button>

      {/* Fixed For Help Rectangle */}
      <div
        style={{
          position: 'fixed',
          right: '20px',
          top: '10px',
          backgroundColor: 'red',
          color: 'white',
          fontWeight: 'bold',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 999,
          fontSize: '14px',
          textAlign: 'center',
        }}
        onClick={() => setShowHelp(!showHelp)}
      >
        For Help
      </div>

      {/* Fixed Help Box */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            top: '45px',
            backgroundColor: '#e9ecef',
            padding: '10px',
            borderRadius: '6px',
            width: '220px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#333',
            zIndex: 999,
          }}
        >
          Contact via WhatsApp:{' '}
          <a
            href="https://wa.me/250786278953"
            target="_blank"
            rel="noopener noreferrer"
          >
            0786278953
          </a>
          <br />
          Email:{' '}
          <a href="mailto:124tegeri@gmail.com">124tegeri@gmail.com</a>
        </div>
      )}

      {/* Question List */}
      {questions.map((q, i) => (
        <div
          key={q.id}
          style={{
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '2px solid #ccc',
          }}
        >
          <p
  className="mb-2 font-semibold text-lg text-gray-900"
  dangerouslySetInnerHTML={{ __html: `${i + 1}. ${q.question}` }}
/>

          {renderOption('a', q.optionA, q.correct)}
          {renderOption('b', q.optionB, q.correct)}
          {renderOption('c', q.optionC, q.correct)}
          {renderOption('d', q.optionD, q.correct)}
        </div>
      ))}
    </div>
  );
}
