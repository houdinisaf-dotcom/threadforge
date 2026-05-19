import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadDesign(base64: string, folder = "designs") {
  const result = await cloudinary.uploader.upload(base64, {
    folder: `threadforge/${folder}`,
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function getMockupUrl(publicId: string, width = 1200) {
  return cloudinary.url(publicId, {
    width,
    quality: "auto",
    fetch_format: "auto",
    crop: "limit",
  });
}
