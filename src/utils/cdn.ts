import sharp from "sharp";

export async function CompressImage(
  image: File,
  maxWidth = 1920,
): Promise<Buffer> {
  const arrayBuffer = await image.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  return await sharp(inputBuffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function UploadImageToCDN(
  imageBuffer: Buffer,
  fileName: string,
): Promise<string> {
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("file", blob, fileName);

  const response = await fetch("https://cdn.hackclub.com/api/v4/upload", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${import.meta.env.CDN_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload image to CDN. Status: ${response.status}`,
    );
  }

  const { url } = await response.json();

  return url;
}
