"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MAX_MEDIA_ITEMS } from "@/lib/constants";
import { uploadMediaFiles } from "@/lib/uploadMedia";

interface ExistingMedia {
  url: string;
  publicId: string;
  type: "image" | "video";
}

interface EditablePost {
  id: string;
  title: string;
  content: string;
  date: string;
  media: ExistingMedia[];
}

export default function EditPostForm({ post }: { post: EditablePost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [date, setDate] = useState(post.date);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>(post.media);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [hasConflictingMessage, setHasConflictingMessage] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);

  const remainingSlots = MAX_MEDIA_ITEMS - existingMedia.length - newFiles.length;

  useEffect(() => {
    let cancelled = false;

    async function checkDate() {
      if (date === post.date) {
        setHasConflictingMessage(false);
        return;
      }
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
  }, [date, post.date]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > remainingSlots) {
      setError(`You can attach up to ${MAX_MEDIA_ITEMS} photos or videos in total.`);
      setNewFiles(picked.slice(0, Math.max(remainingSlots, 0)));
      return;
    }
    setError(null);
    setNewFiles(picked);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingMedia(publicId: string) {
    setExistingMedia((prev) => prev.filter((item) => item.publicId !== publicId));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (hasConflictingMessage) {
      setError("This day already has a message. Remove it first if you want to move this post there.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (newFiles.length > 0) {
        setUploadStatus(
          newFiles.length === 1 ? "Uploading photo/video..." : `Uploading ${newFiles.length} files...`
        );
      }
      const uploaded = await uploadMediaFiles(newFiles);
      setUploadStatus(null);

      const media = [...existingMedia, ...uploaded];

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, date, media }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploadStatus(null);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-4"
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
          disabled={hasConflictingMessage}
          className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark disabled:opacity-50"
        />
      </div>
      <div>
        <label className="text-xs text-muted">Story</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          disabled={hasConflictingMessage}
          className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-pink-dark disabled:opacity-50"
        />
      </div>
      {hasConflictingMessage && !checkingDate && (
        <p className="text-sm text-red-500">
          This day already has a message. Remove it first if you want to move this post there.
        </p>
      )}

      {existingMedia.length > 0 && (
        <div>
          <label className="text-xs text-muted">Current photos & videos</label>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {existingMedia.map((item) => (
              <li key={item.publicId} className="group relative aspect-square overflow-hidden rounded-xl bg-cream">
                {item.type === "video" ? (
                  <video src={item.url} className="h-full w-full object-cover" muted />
                ) : (
                  <Image src={item.url} alt="" fill sizes="150px" className="object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeExistingMedia(item.publicId)}
                  aria-label="Remove"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="text-xs text-muted">
          Add more photos & videos ({Math.max(remainingSlots, 0)} slot
          {remainingSlots === 1 ? "" : "s"} left)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFilesChange}
          disabled={hasConflictingMessage || remainingSlots <= 0}
          className="mt-1 block w-full text-sm disabled:opacity-50"
        />
        {newFiles.length > 0 && (
          <ul className="mt-2 space-y-1">
            {newFiles.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-full bg-background px-3 py-1 text-xs"
              >
                <span className="truncate">
                  {file.type.startsWith("video/") ? "🎥" : "📷"} {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
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
      {uploadStatus && <p className="text-sm text-muted">{uploadStatus}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || hasConflictingMessage}
          className="rounded-full bg-pink-dark px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? (uploadStatus ? "Uploading..." : "Saving...") : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-full border border-border px-5 py-2 text-sm text-muted transition hover:text-pink-dark"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
