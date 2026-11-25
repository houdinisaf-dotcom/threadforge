/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "cloudinary"],
  },
};

export default nextConfig;
