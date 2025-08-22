'use client';

import React, {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
} from 'react';
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

export default function ManageQuestions() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<Omit<Question, 'id' | 'createdAt'>>({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct: 'a',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchQuestions = async (search = '') => {
    try {
      const url = new URL('/api/admin/questions/list', window.location.origin);
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString());
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message || 'Fetch failed');

      setQuestions(json.questions);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error fetching questions.');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchQuestions(value), 400);
  };

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct: 'a',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    try {
      const res = await fetch('/api/admin/questions/list', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        alert(editingId ? 'Question updated' : 'Question added');
        fetchQuestions(searchTerm);
        resetForm();
      } else {
        alert(json.message || 'Failed to save question');
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q: Question) => {
    setForm({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correct: q.correct,
    });
    setEditingId(q.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/questions/list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();
      if (json.success) {
        fetchQuestions(searchTerm);
      } else {
        alert(json.message || 'Delete failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Corrected: use native <img> tag instead of <Img>
  const renderOption = (opt: string, isCorrect: boolean) => {
    const isImg = /\.(jpeg|jpg|png|svg|gif|webp)$/i.test(opt.trim());
    const className = isCorrect ? 'text-red-600 font-bold' : '';
    return isImg ? (
      <img
        src={opt}
        alt="option"
        style={{ maxWidth: 80, maxHeight: 60 }}
        onError={(e) => (e.currentTarget.src = '/fallback.png')}
      />
    ) : (
      <span className={className}>{opt}</span>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/admin/dashboard/')}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
      >
        ⬅ Back to Dashboard
      </button>

      <h1 className="text-2xl font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Question</h1>

      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full p-2 border rounded mb-6"
      />

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <label>Question (text or image URL):</label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleInput}
            rows={3}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((opt) => (
          <div key={opt}>
            <label>{opt.toUpperCase()} option:</label>
            <input
              name={opt}
              value={form[opt]}
              onChange={handleInput}
              className="w-full p-2 border rounded"
              placeholder="text or image URL"
              required
            />
          </div>
        ))}

        <div>
          <label>Correct answer:</label>
          <select
            name="correct"
            value={form.correct}
            onChange={handleInput}
            className="p-2 border rounded"
          >
            {['a', 'b', 'c', 'd'].map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? (editingId ? 'Updating...' : 'Adding...') : editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4 text-red-600">📚 Question Bank</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="overflow-auto max-h-[70vh] border rounded shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-blue-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2">Question</th>
              <th className="px-4 py-2">A</th>
              <th className="px-4 py-2">B</th>
              <th className="px-4 py-2">C</th>
              <th className="px-4 py-2">D</th>
              <th className="px-4 py-2">Correct</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {questions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-500">
                  No questions found.
                </td>
              </tr>
            ) : (
              questions.map((q, index) => (
                <React.Fragment key={q.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">{q.id}</td>
                    <td
                      className="px-4 py-2"
                      dangerouslySetInnerHTML={{ __html: q.question }}
                    />
                    <td className="px-4 py-2">{renderOption(q.optionA, q.correct === 'a')}</td>
                    <td className="px-4 py-2">{renderOption(q.optionB, q.correct === 'b')}</td>
                    <td className="px-4 py-2">{renderOption(q.optionC, q.correct === 'c')}</td>
                    <td className="px-4 py-2">{renderOption(q.optionD, q.correct === 'd')}</td>
                    <td className="px-4 py-2 text-center text-gray-700">
                      {q.correct.toUpperCase()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(q.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {index !== questions.length - 1 && (
                    <tr>
                      <td colSpan={9} className="p-0">
                        <hr className="border-gray-300" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
