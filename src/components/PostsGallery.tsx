"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

export interface PostMedia {
  url: string;
  type: "image" | "video";
}

export interface PostSummary {
  id: string;
  title: string;
  content: string;
  date: string;
  media: PostMedia[];
  commentCount: number;
}

function videoPosterUrl(url: string): string {
  return url.replace(/\.[a-zA-Z0-9]+$/, ".jpg");
}

function CoverThumbnail({ item, alt, sizes }: { item: PostMedia; alt: string; sizes: string }) {
  return (
    <Image
      src={item.type === "video" ? videoPosterUrl(item.url) : item.url}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

export default function PostsGallery({ posts }: { posts: PostSummary[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (posts.length === 0) {
    return (
      <p className="py-20 text-center text-muted">
        No posts yet — check back soon 💕
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-3xl text-pink-dark">Our Posts</h2>
        <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={`rounded-full px-3 py-1 text-sm transition ${
              view === "grid" ? "bg-pink-dark text-white" : "text-muted"
            }`}
          >
            ⚏
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`rounded-full px-3 py-1 text-sm transition ${
              view === "list" ? "bg-pink-dark text-white" : "text-muted"
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {posts.map((post) => {
            const cover = post.media[0];
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-cream"
              >
                {cover ? (
                  <CoverThumbnail
                    item={cover}
                    alt={post.title}
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-3 text-center font-heading text-lg text-pink-dark">
                    {post.title}
                  </div>
                )}

                {cover?.type === "video" && (
                  <span className="absolute right-2 top-2 rounded-full bg-black/50 px-1.5 py-0.5 text-xs text-white">
                    ▶
                  </span>
                )}
                {post.media.length > 1 && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/50 px-1.5 py-0.5 text-xs text-white">
                    🖼 {post.media.length}
                  </span>
                )}

                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-transparent to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <span className="line-clamp-1 text-xs font-medium text-white">
                    {post.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {posts.map((post) => {
            const cover = post.media[0];
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-cream/60"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {cover ? (
                    <CoverThumbnail item={cover} alt={post.title} sizes="64px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg">💗</div>
                  )}
                  {post.media.length > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 rounded-full bg-black/50 px-1 text-[10px] text-white">
                      {post.media.length}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="line-clamp-1 text-sm text-muted">{post.content}</p>
                  <p className="mt-1 text-xs text-muted">
                    {format(new Date(post.date), "MMM d, yyyy")} · 💬 {post.commentCount}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
