import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // @ts-ignore -- Next.js 15 CLI warns to set turbopack.root, which might not be typed perfectly yet
    turbopack: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
