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
  webpack: (config, { dev, isServer }) => {
    // 開発環境でのHMR最適化
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-refresh/runtime': require.resolve('react-refresh/runtime'),
      };
    }
    
    // プロダクション環境での最適化
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }
    
    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // プロダクション環境での出力最適化
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
