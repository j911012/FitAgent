import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Google OAuth のプロフィール画像を next/image で表示するために許可する
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
