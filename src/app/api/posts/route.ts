import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost, type IMediaItem } from "@/models/Post";
import Message from "@/models/Message";
import { uploadMediaBuffer } from "@/lib/cloudinary";
import { serializePost } from "@/lib/serialize";
import { MAX_MEDIA_ITEMS } from "@/lib/constants";
import { parseDateOnly, utcDayRange } from "@/lib/date";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const dateParam = request.nextUrl.searchParams.get("date");
  let filter = {};

  if (dateParam) {
    const day = parseDateOnly(dateParam);
    if (!day) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const { start, end } = utcDayRange(day);
    filter = { date: { $gte: start, $lt: end } };
  }

  const posts = await Post.find(filter).sort({ date: -1, createdAt: -1 }).lean();
  return NextResponse.json({
    posts: posts.map((p) => serializePost(p as unknown as IPost)),
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const title = formData.get("title");
  const content = formData.get("content");
  const dateValue = formData.get("date");
  const mediaFiles = formData
    .getAll("media")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  const postDate = typeof dateValue === "string" ? parseDateOnly(dateValue) : null;
  if (!postDate) {
    return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
  }
  if (mediaFiles.length > MAX_MEDIA_ITEMS) {
    return NextResponse.json(
      { error: `You can attach up to ${MAX_MEDIA_ITEMS} photos or videos.` },
      { status: 400 }
    );
  }
  for (const file of mediaFiles) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 400 }
      );
    }
  }

  await connectToDatabase();

  const conflictingMessage = await Message.exists({ date: postDate });
  if (conflictingMessage) {
    return NextResponse.json(
      { error: "This day already has a message. Remove it first if you want to add a post instead." },
      { status: 409 }
    );
  }

  let media: IMediaItem[];
  try {
    media = await Promise.all(
      mediaFiles.map(async (file) => {
        const type = file.type.startsWith("video/") ? "video" : "image";
        const arrayBuffer = await file.arrayBuffer();
        return uploadMediaBuffer(Buffer.from(arrayBuffer), type);
      })
    );
  } catch (err) {
    console.error("Media upload failed:", err);
    return NextResponse.json(
      { error: "Failed to upload photos/videos. Please try again." },
      { status: 502 }
    );
  }

  const post = await Post.create({
    title: title.trim(),
    content: content.trim(),
    date: postDate,
    media,
  });

  return NextResponse.json({ post: serializePost(post) }, { status: 201 });
}
