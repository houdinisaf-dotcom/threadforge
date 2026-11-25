import { hasCloudinary } from "./env";

/**
 * Turns a canvas `toDataURL()` snapshot into a stored preview URL.
 *
 * Data URLs are far too large to keep in Postgres, so without Cloudinary the
 * preview is skipped rather than stored inline.
 */
export async function storePreview(dataUrl?: string | null): Promise<string | undefined> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return undefined;
  if (!hasCloudinary) return undefined;

  const { uploadDesign } = await import("./cloudinary");
  const { url } = await uploadDesign(dataUrl, "previews");
  return url;
}
