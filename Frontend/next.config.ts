import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    secretKey: process.env.TWELVEDATA_SECRET_KEY,
  },
};

export default nextConfig;
