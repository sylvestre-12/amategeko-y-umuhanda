'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  id: string;
  question: string; // can include HTML like <img src="/image/266.png" />
  image?: string;   // optional main question image
  optionA: string;  // can include HTML
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
};

type AnswerMap = Record<string, 'A' | 'B' | 'C' | 'D'>;

export default function ExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60);
  const timerRef = useRef<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id?: number; fullName?: string; phone?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    const q = localStorage.getItem('questions');
    if (!q) {
      router.push('/test/start');
      return;
    }
    setQuestions(JSON.parse(q).slice(0, 20));

    const savedAnswers = localStorage.getItem('exam_answers');
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

    const startTimeStr = localStorage.getItem('startTime');
    if (startTimeStr) {
      const start = new Date(startTimeStr).getTime();
      const elapsedSec = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 20 * 60 - elapsedSec);
      setTimeLeft(remaining);
      if (remaining === 0) void handleSubmit();
    } else {
      localStorage.setItem('startTime', new Date().toISOString());
    }
  }, [router]);

  useEffect(() => {
    if (!questions.length) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length]);

  const formatTime = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const currentQuestion = questions[currentIndex];

  const selectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: option };
      localStorage.setItem('exam_answers', JSON.stringify(next));
      return next;
    });
  };

  const goPrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const goNext = () => currentIndex < questions.length - 1 ? setCurrentIndex(currentIndex + 1) : void handleSubmit();

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const startedAt = localStorage.getItem('startTime') ?? new Date().toISOString();
    const finishedAt = new Date().toISOString();
    const answerArray = Object.entries(answers).map(([questionId, selected]) => ({ questionId, selected }));

    const payload = { userId: user?.id ?? null, answers: answerArray, startedAt, finishedAt };

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      localStorage.setItem('lastResult', JSON.stringify(data));
      router.push('/test/results');
    } catch {
      router.push('/test/results');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQuestion) return <p>Loading questions...</p>;

  const renderOption = (opt: 'A' | 'B' | 'C' | 'D', label: string) => {
    const checked = answers[currentQuestion.id] === opt;
    return (
      <label
        key={opt}
        style={{
          display: 'block',
          padding: '10px',
          marginBottom: 10,
          border: checked ? '2px solid #007bff' : '1px solid #ccc',
          borderRadius: 6,
          background: checked ? 'rgba(0,123,255,0.06)' : 'transparent',
          cursor: 'pointer'
        }}
      >
        <input
          type="radio"
          name={currentQuestion.id}
          checked={checked}
          onChange={() => selectOption(currentQuestion.id, opt)}
          style={{ marginRight: 6 }}
        />
        {opt}. <span dangerouslySetInnerHTML={{ __html: label }} />
      </label>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {user && (
          <div>
            <strong>{user.fullName}</strong>
            <div>{user.phone}</div>
          </div>
        )}
        <div>⏱️ {formatTime(timeLeft)}</div>
      </div>

      <hr />

      <h2>Question {currentIndex + 1} (Marks out of 20)</h2>
      <div style={{ marginBottom: 18 }}>
        <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt="question"
            style={{ maxWidth: 250, display: 'block', marginTop: 10 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/fallback.png'; }}
          />
        )}
      </div>

      <div role="radiogroup">
        {(['A','B','C','D'] as const).map(opt => {
          const label = currentQuestion[`option${opt}` as keyof Question] as string;
          return renderOption(opt, label);
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          style={{
            padding: '8px 14px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous
        </button>

        <div>Question {currentIndex + 1} of {questions.length}</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => confirm('Submit now?') && handleSubmit()}
            style={{ padding: '8px 14px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6 }}
          >
            Submit
          </button>
          <button
            onClick={goNext}
            style={{ padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6 }}
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>

      {submitting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ padding: 20, background: '#222', color: '#fff', borderRadius: 8 }}>
            Submitting your answers...
          </div>
        </div>
      )}
    </div>
  );
}
