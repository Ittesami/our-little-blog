import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost, type IMediaItem } from "@/models/Post";
import Comment from "@/models/Comment";
import Message from "@/models/Message";
import { deleteMedia } from "@/lib/cloudinary";
import { serializePost } from "@/lib/serialize";
import { MAX_MEDIA_ITEMS } from "@/lib/constants";
import { parseDateOnly } from "@/lib/date";
import { parseMediaInput } from "@/lib/media";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectToDatabase();
  const post = await Post.findById(id).lean();
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({
    post: serializePost(post as unknown as IPost),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const conflictingMessage = await Message.exists({ date: postDate });
  if (conflictingMessage) {
    return NextResponse.json(
      { error: "This day already has a message. Remove it first if you want to add a post instead." },
      { status: 409 }
    );
  }

  const keptPublicIds = new Set(media.map((item) => item.publicId));
  const removedMedia = post.media.filter(
    (item: IMediaItem) => !keptPublicIds.has(item.publicId)
  );
  await Promise.all(
    removedMedia.map((item: IMediaItem) => deleteMedia(item.publicId, item.type).catch(() => {}))
  );

  post.title = title.trim();
  post.content = content.trim();
  post.date = postDate;
  post.media = media;
  await post.save();

  return NextResponse.json({ post: serializePost(post) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectToDatabase();
  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await Promise.all(
    post.media.map((item: IMediaItem) => deleteMedia(item.publicId, item.type).catch(() => {}))
  );
  await Comment.deleteMany({ postId: post._id });
  await post.deleteOne();

  return NextResponse.json({ ok: true });
}
