"use client";

import { useState, FormEvent } from "react";
import { format } from "date-fns";

export interface CommentItem {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: CommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !text.trim()) {
      setError("Please fill in your name and a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="font-heading text-3xl text-pink-dark">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <div className="mt-4 space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted">Be the first to say something sweet 💬</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-medium text-pink-dark">{c.name}</p>
              <p className="shrink-0 text-xs text-muted">
                {format(new Date(c.createdAt), "MMM d, h:mm a")}
              </p>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{c.text}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a sweet comment..."
          maxLength={1000}
          rows={3}
          className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-pink-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>
    </section>
  );
}
