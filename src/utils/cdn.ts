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

  const response = await fetch("https://api.anonfiles.com/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload image to CDN. Status: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!data?.status || !data?.data?.file?.url?.full) {
    throw new Error("Invalid response from CDN API");
  }

  return data.data.file.url.full;
}
