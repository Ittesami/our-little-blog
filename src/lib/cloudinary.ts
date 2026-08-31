import { v2 as cloudinary } from "cloudinary";
import type { MediaType } from "@/models/Post";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function deleteMedia(publicId: string, type: MediaType) {
  await cloudinary.uploader.destroy(publicId, { resource_type: type });
}

export default cloudinary;
