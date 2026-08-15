import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost } from "@/models/Post";
import Comment, { type IComment } from "@/models/Comment";
import { serializePost, serializeComment } from "@/lib/serialize";
import CommentSection from "@/components/CommentSection";
import MediaGallery from "@/components/MediaGallery";

export default async function PostPage(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;
  await connectToDatabase();

  let post;
  try {
    post = await Post.findById(id).lean();
  } catch {
    post = null;
  }

  if (!post) {
    notFound();
  }

  const comments = await Comment.find({ postId: id }).sort({ createdAt: 1 }).lean();

  const serializedPost = serializePost(post as unknown as IPost);
  const serializedComments = comments.map((c) => serializeComment(c as unknown as IComment));

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-sm text-muted hover:text-pink-dark">
        ← back
      </Link>

      <h1 className="mt-4 font-heading text-4xl text-pink-dark">{serializedPost.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {format(new Date(serializedPost.date), "EEEE, MMMM d, yyyy")}
      </p>

      <MediaGallery media={serializedPost.media} alt={serializedPost.title} />

      <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed">
        {serializedPost.content}
      </div>

      <CommentSection postId={serializedPost.id} initialComments={serializedComments} />
    </article>
  );
}
