import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

module.exports = {
  ...nextConfig,
  allowedDevOrigin: ["192.168.1.57", "192.168.1.88"],
};

export default nextConfig;
