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
};

export default nextConfig;
