'use client';

import { useEffect, useState } from 'react';

type Note = { id: string; content: string; created_at: string };

function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" aria-live="polite" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      {label ? <span className="text-sm opacity-70">{label}</span> : null}
    </span>
  );
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [isFetching, setIsFetching] = useState(true);      // initial list load
  const [isSubmitting, setIsSubmitting] = useState(false); // adding a note
  const [error, setError] = useState<string | null>(null);

  async function loadNotes() {
    setIsFetching(true);
    try {
      const res = await fetch('/api/notes', { cache: 'no-store' });
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      setContent('');
      await loadNotes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteNote(id: string) {
    const ok = confirm('Delete this note?');
    if (!ok) return;

    const prev = notes;
    setNotes((ns) => ns.filter((n) => n.id !== id));

    const res = await fetch(`/api/notes?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      setNotes(prev);
      alert('Failed to delete — please try again.');
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Notes</h1>

      <form onSubmit={addNote} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50 inline-flex items-center gap-2"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? <Spinner label="Adding…" /> : 'Add'}
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {isFetching ? (
        <div className="flex items-center gap-3 opacity-70">
          <Spinner label="Loading notes…" />
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="border rounded p-3">
              <div className="text-xs opacity-60">
                {new Date(n.created_at).toLocaleString()}
              </div>
              <div className="flex items-start justify-between gap-4">
                <p>{n.content}</p>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-xs underline opacity-70 hover:opacity-100"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {notes.length === 0 && (
            <li className="rounded border border-dashed p-6 text-center opacity-70">
              <div className="text-2xl mb-2">🗒️</div>
              <div>No notes yet — add your first one above.</div>
            </li>
          )}
        </ul>
      )}
    </main>
  );
}
