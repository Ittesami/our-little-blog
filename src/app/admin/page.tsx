import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost } from "@/models/Post";
import { serializePost } from "@/lib/serialize";
import NewPostForm from "@/components/admin/NewPostForm";
import MessageForm from "@/components/admin/MessageForm";
import PostsList from "@/components/admin/PostsList";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await connectToDatabase();
  const posts = await Post.find().sort({ date: -1 }).lean();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl text-pink-dark">Admin</h1>
        <LogoutButton />
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-2xl text-pink-dark">Message for the day</h2>
        <MessageForm />
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl text-pink-dark">New post</h2>
        <NewPostForm />
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl text-pink-dark">All posts</h2>
        <PostsList posts={posts.map((p) => serializePost(p as unknown as IPost))} />
      </section>
    </div>
  );
}
