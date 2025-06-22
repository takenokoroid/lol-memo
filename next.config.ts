import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        port: '',
        pathname: '/cdn/**',
      },
    ],
  },
  // HMRの設定を追加
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      // Fast Refreshを有効化
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-refresh/runtime': require.resolve('react-refresh/runtime'),
      };
    }
    return config;
  },
  // 実験的な機能でHMRを改善
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
