import { v2 as cloudinary } from "cloudinary";
import type { MediaType } from "@/models/Post";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadMediaBuffer(
  buffer: Buffer,
  type: MediaType,
  folder = "our-blog"
): Promise<{ url: string; publicId: string; type: MediaType }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: type },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id, type });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteMedia(publicId: string, type: MediaType) {
  await cloudinary.uploader.destroy(publicId, { resource_type: type });
}

export default cloudinary;
