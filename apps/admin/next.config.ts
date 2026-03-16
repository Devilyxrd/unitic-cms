import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "..", ".."),
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
