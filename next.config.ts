import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 代码分割优化
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    scrollRestoration: true,
  },
  // Turbopack配置
  turbopack: {},
  // 缓存策略
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  // Disable static export for dynamic routes
  output: "standalone",
  // Ensure API routes work correctly
  trailingSlash: false,
};

export default nextConfig;
