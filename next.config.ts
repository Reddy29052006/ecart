import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow dev server access from local network IPs (e.g. IDE remote preview, other devices)
  allowedDevOrigins: ['10.176.28.235'],
};

export default nextConfig;
