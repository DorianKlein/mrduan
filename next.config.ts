import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    unoptimized: true, // 关键：让 Vercel 直接以静态 CDN 方式分发图片，不走动态函数
  },
};

export default nextConfig;
