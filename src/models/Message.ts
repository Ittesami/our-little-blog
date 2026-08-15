import { Schema, model, models, Types } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId;
  date: Date;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    date: { type: Date, required: true, unique: true, index: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default models.Message || model<IMessage>("Message", MessageSchema);
