import Image from "next/image";
import type { PostMedia } from "@/components/PostsGallery";

export default function MediaGallery({ media, alt }: { media: PostMedia[]; alt: string }) {
  if (media.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      {media.map((item, i) =>
        item.type === "video" ? (
          <video
            key={item.url}
            controls
            className="w-full rounded-2xl bg-black"
            src={item.url}
          />
        ) : (
          <div
            key={item.url}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={item.url}
              alt={`${alt} ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        )
      )}
    </div>
  );
}
