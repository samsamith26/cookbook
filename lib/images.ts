import sharp from "sharp";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 80;

/**
 * Normalizes an uploaded photo before it's committed: applies EXIF rotation,
 * strips metadata (including GPS), caps the longest side at 1600px and
 * re-encodes as JPEG. Typical phone photos end up ~200–400KB.
 */
export async function compressImage(file: File): Promise<Buffer> {
  try {
    return await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error("That photo couldn't be read. Please upload a JPEG, PNG, or WebP image.");
  }
}
