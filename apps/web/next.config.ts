import type { NextConfig } from "next";
import { config as dotenvConfig } from "dotenv";
import path from "path";

dotenvConfig({ path: path.resolve(__dirname, "..", "..", ".env") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
