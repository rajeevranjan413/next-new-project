import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*',"https://5e74-47-15-66-85.ngrok-free.app"],

  // Proxy /uploads/* to the backend so images load same-origin (no CORS needed)
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    return [
      {
        source: '/uploads/:path*',
        destination: `${backend}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
