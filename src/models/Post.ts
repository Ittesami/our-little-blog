import { Schema, model, models, Types } from "mongoose";

export type MediaType = "image" | "video";

export interface IMediaItem {
  url: string;
  publicId: string;
  type: MediaType;
}

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  content: string;
  date: Date;
  media: IMediaItem[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    media: { type: [MediaItemSchema], default: [] },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Post || model<IPost>("Post", PostSchema);
