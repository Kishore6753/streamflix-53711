import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "www.themoviedb.org" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
