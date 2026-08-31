export interface UploadedMedia {
  url: string;
  publicId: string;
  type: "image" | "video";
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

async function getUploadSignature(): Promise<UploadSignature> {
  const res = await fetch("/api/cloudinary/signature", { method: "POST" });
  if (!res.ok) {
    throw new Error("Could not prepare upload. Please try again.");
  }
  return res.json();
}

async function uploadFile(file: File, sig: UploadSignature): Promise<UploadedMedia> {
  const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/${type}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message ?? `Failed to upload ${file.name}`);
  }

  const data = await res.json();
  return { url: data.secure_url as string, publicId: data.public_id as string, type };
}

export async function uploadMediaFiles(files: File[]): Promise<UploadedMedia[]> {
  if (files.length === 0) return [];
  const sig = await getUploadSignature();
  const uploaded: UploadedMedia[] = [];
  for (const file of files) {
    uploaded.push(await uploadFile(file, sig));
  }
  return uploaded;
}
