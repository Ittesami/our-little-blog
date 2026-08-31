import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST() {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "our-blog";
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  });
}
