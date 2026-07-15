import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fptjobs.com",
        port: "",
        pathname: "/Media/**",
      },
      {
        protocol: "https",
        hostname: "www.fptjobs.com",
        port: "",
        pathname: "/Media/**",
      },
    ],
  },
  output: "standalone",
  turbopack: {
    root: join(currentDirectory, ".."),
  },
};

export default nextConfig;
