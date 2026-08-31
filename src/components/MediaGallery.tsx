"use client";

import { useState } from "react";
import Image from "next/image";
import type { PostMedia } from "@/components/PostsGallery";

function Slide({ item, alt, priority }: { item: PostMedia; alt: string; priority: boolean }) {
  if (item.type === "video") {
    return (
      <video
        controls
        className="absolute inset-0 h-full w-full object-contain"
        src={item.url}
      />
    );
  }
  return (
    <Image
      src={item.url}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 672px"
      className="object-cover"
      priority={priority}
    />
  );
}

export default function MediaGallery({ media, alt }: { media: PostMedia[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (media.length === 0) return null;

  if (media.length === 1) {
    const item = media[0];
    return (
      <div className="mt-6">
        {item.type === "video" ? (
          <video controls className="w-full rounded-2xl bg-black" src={item.url} />
        ) : (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Slide item={item} alt={alt} priority />
          </div>
        )}
      </div>
    );
  }

  const current = media[index];

  function goTo(i: number) {
    setIndex((i + media.length) % media.length);
  }

  return (
    <div className="mt-6">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
        <Slide key={current.url} item={current} alt={`${alt} ${index + 1}`} priority={index === 0} />

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous"
          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          ›
        </button>

        <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
          {index + 1} / {media.length}
        </span>
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {media.map((item, i) => (
          <button
            key={item.url}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to item ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-pink-dark" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
