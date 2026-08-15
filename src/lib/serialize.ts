import type { IPost } from "@/models/Post";
import type { IMessage } from "@/models/Message";
import type { IComment } from "@/models/Comment";

export function serializePost(post: IPost) {
  return {
    id: post._id.toString(),
    title: post.title,
    content: post.content,
    date: post.date.toISOString(),
    media: (post.media ?? []).map((m) => ({ url: m.url, type: m.type })),
    commentCount: post.commentCount ?? 0,
    createdAt: post.createdAt.toISOString(),
  };
}

export function serializeMessage(message: IMessage) {
  return {
    id: message._id.toString(),
    date: message.date.toISOString(),
    text: message.text,
  };
}

export function serializeComment(comment: IComment) {
  return {
    id: comment._id.toString(),
    postId: comment.postId.toString(),
    name: comment.name,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  };
}
