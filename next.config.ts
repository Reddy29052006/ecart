import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow dev server access from local network IPs
  allowedDevOrigins: ['10.176.28.235'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dummyjson.com',
      },
      {
        protocol: 'https',
        hostname: 'dummyjson.com',
      },
    ],
  },
};

export default nextConfig;
