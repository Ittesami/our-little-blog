"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MAX_MEDIA_ITEMS } from "@/lib/constants";

function todayInputValue(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function NewPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConflictingMessage, setHasConflictingMessage] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkDate() {
      setCheckingDate(true);
      try {
        const data = await fetch(`/api/messages?date=${date}`).then((r) => r.json());
        if (!cancelled) setHasConflictingMessage(Boolean(data.message));
      } finally {
        if (!cancelled) setCheckingDate(false);
      }
    }

    checkDate();
    return () => {
      cancelled = true;
    };
  }, [date]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > MAX_MEDIA_ITEMS) {
      setError(`You can attach up to ${MAX_MEDIA_ITEMS} photos or videos.`);
      setFiles(picked.slice(0, MAX_MEDIA_ITEMS));
      return;
    }
    setError(null);
    setFiles(picked);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (hasConflictingMessage) {
      setError("This day already has a message. Remove it first if you want to add a post instead.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("content", content);
      formData.set("date", date);
      for (const file of files) formData.append("media", file);

      const res = await fetch("/api/posts", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");

      setTitle("");
      setContent("");
      setFiles([]);
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
        <label className="text-xs text-muted">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A title for this memory"
          disabled={hasConflictingMessage}
          className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark disabled:opacity-50"
        />
      </div>
      <div>
        <label className="text-xs text-muted">Story</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about it..."
          rows={5}
          disabled={hasConflictingMessage}
          className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark disabled:opacity-50"
        />
      </div>
      {hasConflictingMessage && !checkingDate && (
        <p className="text-sm text-red-500">
          This day already has a message. Remove it first if you want to add a post instead.
        </p>
      )}
      <div>
        <label className="text-xs text-muted">
          Photos & videos (optional, up to {MAX_MEDIA_ITEMS})
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFilesChange}
          disabled={hasConflictingMessage}
          className="mt-1 block w-full text-sm disabled:opacity-50"
        />
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-full bg-background px-3 py-1 text-xs"
              >
                <span className="truncate">
                  {file.type.startsWith("video/") ? "🎥" : "📷"} {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="shrink-0 text-muted hover:text-red-500"
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting || hasConflictingMessage}
        className="rounded-full bg-pink-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Publish post"}
      </button>
    </form>
  );
}
