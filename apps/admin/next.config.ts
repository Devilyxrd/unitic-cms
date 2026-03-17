import type { NextConfig } from "next";
import { config as dotenvConfig } from "dotenv";
import path from "path";

const monorepoRoot = path.resolve(__dirname, "..", "..");

dotenvConfig({ path: path.resolve(__dirname, "..", "..", ".env") });

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/content-types",
        destination: "/contentTypes",
        permanent: true,
      },
      {
        source: "/content-types/:path*",
        destination: "/contentTypes/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
