import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "inline-source-map"; // Better for debugging
    }
    return config;
  },
};

export default nextConfig;
