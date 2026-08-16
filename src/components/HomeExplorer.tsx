"use client";

import { useState } from "react";
import MessageOfDay from "@/components/MessageOfDay";
import PostsGallery, { type PostSummary } from "@/components/PostsGallery";

interface MessageData {
  text: string;
  date: string;
}

export default function HomeExplorer({
  initialPosts,
  initialMessage,
}: {
  initialPosts: PostSummary[];
  initialMessage: MessageData | null;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);

  async function handleDateChange(value: string) {
    setSelectedDate(value);

    if (!value) {
      setPosts(initialPosts);
      setMessage(initialMessage);
      return;
    }

    setLoading(true);
    try {
      const [postsData, messageData] = await Promise.all([
        fetch(`/api/posts?date=${value}`).then((r) => r.json()),
        fetch(`/api/messages?date=${value}`).then((r) => r.json()),
      ]);
      setPosts(postsData.posts ?? []);
      setMessage(messageData.message ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
        <label htmlFor="browse-date" className="text-sm text-muted">
          Browse a date
        </label>
        <input
          id="browse-date"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-full border border-border bg-background px-3 py-1 text-sm outline-none focus:border-pink-dark"
        />
        {selectedDate && (
          <button
            type="button"
            onClick={() => handleDateChange("")}
            className="text-xs text-muted underline hover:text-pink-dark"
          >
            Show everything
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : (
        <>
          {message ? (
            <MessageOfDay message={message} />
          ) : (
            selectedDate && (
              <p className="mb-10 text-center text-sm text-muted">
                No note for this day 💌
              </p>
            )
          )}
          <PostsGallery posts={posts} emptyMessage={selectedDate ? "No posts on this day." : undefined} />
        </>
      )}
    </div>
  );
}
