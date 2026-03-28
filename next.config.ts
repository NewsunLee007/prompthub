import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  // Disable static export for dynamic routes
  output: "standalone",
  // Ensure API routes work correctly
  trailingSlash: false,
};

export default nextConfig;
