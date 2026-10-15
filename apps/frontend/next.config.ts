import path from 'path';
import type { NextConfig } from 'next';

const internalApi =
  process.env.INTERNAL_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:3001';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${internalApi}/api/:path*` },
      { source: '/uploads/:path*', destination: `${internalApi}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
