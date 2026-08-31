import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost } from "@/models/Post";
import EditPostForm from "@/components/admin/EditPostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]/edit">) {
  const { id } = await props.params;
  await connectToDatabase();

  let post: IPost | null;
  try {
    post = (await Post.findById(id).lean()) as unknown as IPost | null;
  } catch {
    post = null;
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-heading text-4xl text-pink-dark">Edit post</h1>
      <EditPostForm
        post={{
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          date: post.date.toISOString().slice(0, 10),
          media: post.media.map((m) => ({ url: m.url, publicId: m.publicId, type: m.type })),
        }}
      />
    </div>
  );
}
