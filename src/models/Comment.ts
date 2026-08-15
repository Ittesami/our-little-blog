import { Schema, model, models, Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  name: string;
  text: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Comment || model<IComment>("Comment", CommentSchema);
