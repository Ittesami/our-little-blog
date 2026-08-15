"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { PostSummary } from "@/components/PostsGallery";

export default function PostsList({ posts }: { posts: PostSummary[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      alert("Could not delete this post.");
    } finally {
      setDeletingId(null);
    }
  }

  if (posts.length === 0) {
    return <p className="mt-4 text-sm text-muted">No posts yet.</p>;
  }

  return (
    <div className="mt-4 flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center justify-between gap-4 p-4">
          <Link href={`/post/${post.id}`} className="min-w-0 flex-1">
            <p className="truncate font-medium">{post.title}</p>
            <p className="text-xs text-muted">{format(new Date(post.date), "MMM d, yyyy")}</p>
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(post.id)}
            disabled={deletingId === post.id}
            className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-red-300 hover:text-red-500 disabled:opacity-50"
          >
            {deletingId === post.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ))}
    </div>
  );
}
