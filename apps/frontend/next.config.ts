import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Set the root to the monorepo root (where your main package.json is)
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
