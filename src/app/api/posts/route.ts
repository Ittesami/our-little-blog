import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost } from "@/models/Post";
import Message from "@/models/Message";
import { serializePost } from "@/lib/serialize";
import { MAX_MEDIA_ITEMS } from "@/lib/constants";
import { parseDateOnly, utcDayRange } from "@/lib/date";
import { parseMediaInput } from "@/lib/media";

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
  const body = await request.json().catch(() => null);

  const title = body?.title;
  const content = body?.content;
  const dateValue = body?.date;

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
  const media = parseMediaInput(body?.media ?? []);
  if (!media) {
    return NextResponse.json({ error: "Invalid media" }, { status: 400 });
  }
  if (media.length > MAX_MEDIA_ITEMS) {
    return NextResponse.json(
      { error: `You can attach up to ${MAX_MEDIA_ITEMS} photos or videos.` },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const conflictingMessage = await Message.exists({ date: postDate });
  if (conflictingMessage) {
    return NextResponse.json(
      { error: "This day already has a message. Remove it first if you want to add a post instead." },
      { status: 409 }
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
