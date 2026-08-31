import type { IMediaItem } from "@/models/Post";

export function parseMediaInput(value: unknown): IMediaItem[] | null {
  if (!Array.isArray(value)) return null;
  const media: IMediaItem[] = [];
  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as Record<string, unknown>).url !== "string" ||
      typeof (item as Record<string, unknown>).publicId !== "string" ||
      ((item as Record<string, unknown>).type !== "image" &&
        (item as Record<string, unknown>).type !== "video")
    ) {
      return null;
    }
    const { url, publicId, type } = item as { url: string; publicId: string; type: "image" | "video" };
    media.push({ url, publicId, type });
  }
  return media;
}
