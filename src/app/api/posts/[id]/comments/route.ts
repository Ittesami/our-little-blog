import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { serializeComment } from "@/lib/serialize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectToDatabase();
  const comments = await Comment.find({ postId: id }).sort({ createdAt: 1 }).lean();
  return NextResponse.json({
    comments: comments.map((c) =>
      serializeComment(c as unknown as import("@/models/Comment").IComment)
    ),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }
  if (name.length > 60 || text.length > 1000) {
    return NextResponse.json({ error: "Name or comment is too long" }, { status: 400 });
  }

  await connectToDatabase();

  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await Comment.create({ postId: id, name, text });
  post.commentCount = (post.commentCount ?? 0) + 1;
  await post.save();

  return NextResponse.json({ comment: serializeComment(comment) }, { status: 201 });
}
