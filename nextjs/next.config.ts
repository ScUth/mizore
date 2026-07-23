import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

module.exports = {
  allowedDevOrigin: ['192.168.1.57', '192.168.1.88']
}

export default nextConfig;
