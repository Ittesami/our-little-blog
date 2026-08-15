import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost, type IMediaItem } from "@/models/Post";
import Comment from "@/models/Comment";
import { deleteMedia } from "@/lib/cloudinary";
import { serializePost } from "@/lib/serialize";

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
