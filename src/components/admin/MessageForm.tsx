"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

function todayInputValue(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function MessageForm() {
  const router = useRouter();
  const [date, setDate] = useState(todayInputValue());
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasConflictingPost, setHasConflictingPost] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMessage() {
      setLoading(true);
      setSaved(false);
      try {
        const [messageData, postsData] = await Promise.all([
          fetch(`/api/messages?date=${date}`).then((r) => r.json()),
          fetch(`/api/posts?date=${date}`).then((r) => r.json()),
        ]);
        if (!cancelled) {
          setText(messageData.message?.text ?? "");
          setHasConflictingPost((postsData.posts ?? []).length > 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMessage();
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (hasConflictingPost) {
      setError("This day already has a post. Remove it first if you want to add a message instead.");
      return;
    }

    if (!text.trim()) {
      setError("Message text is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-4"
    >
      <div>
        <label className="text-xs text-muted">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark"
        />
      </div>
      <div>
        <label className="text-xs text-muted">Message {loading && "(loading...)"}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Something sweet for today..."
          rows={3}
          disabled={hasConflictingPost}
          className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark disabled:opacity-50"
        />
      </div>
      {hasConflictingPost && !loading && (
        <p className="text-sm text-red-500">
          This day already has a post. Remove it first if you want to add a message instead.
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && !submitting && <p className="text-sm text-pink-dark">Saved ♡</p>}
      <button
        type="submit"
        disabled={submitting || hasConflictingPost}
        className="rounded-full bg-pink-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save message"}
      </button>
    </form>
  );
}
