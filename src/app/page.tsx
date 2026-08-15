import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost } from "@/models/Post";
import Message, { type IMessage } from "@/models/Message";
import { serializePost, serializeMessage } from "@/lib/serialize";
import MessageOfDay from "@/components/MessageOfDay";
import PostsGallery from "@/components/PostsGallery";

export const dynamic = "force-dynamic";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function HomePage() {
  await connectToDatabase();

  const [posts, todayMessage] = await Promise.all([
    Post.find().sort({ date: -1, createdAt: -1 }).lean(),
    Message.findOne({ date: { $lte: startOfDay(new Date()) } })
      .sort({ date: -1 })
      .lean(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <MessageOfDay
        message={todayMessage ? serializeMessage(todayMessage as unknown as IMessage) : null}
      />
      <PostsGallery posts={posts.map((p) => serializePost(p as unknown as IPost))} />
    </div>
  );
}
