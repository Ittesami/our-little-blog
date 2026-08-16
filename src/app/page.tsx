import { connectToDatabase } from "@/lib/mongodb";
import Post, { type IPost } from "@/models/Post";
import Message, { type IMessage } from "@/models/Message";
import { serializePost, serializeMessage } from "@/lib/serialize";
import { startOfUtcToday } from "@/lib/date";
import HomeExplorer from "@/components/HomeExplorer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectToDatabase();

  const [posts, todayMessage] = await Promise.all([
    Post.find().sort({ date: -1, createdAt: -1 }).lean(),
    Message.findOne({ date: { $lte: startOfUtcToday() } })
      .sort({ date: -1 })
      .lean(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <HomeExplorer
        initialPosts={posts.map((p) => serializePost(p as unknown as IPost))}
        initialMessage={todayMessage ? serializeMessage(todayMessage as unknown as IMessage) : null}
      />
    </div>
  );
}
