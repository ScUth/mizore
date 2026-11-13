import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
const apiProxyOrigin = new URL(
  apiProxyTarget.includes("://") ? apiProxyTarget : `http://${apiProxyTarget}`,
).origin;

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyOrigin}/api/:path*`,
      },
    ];
  },
};

module.exports = {
  ...nextConfig,
  allowedDevOrigin: ["192.168.1.57", "192.168.1.88"],
};

export default nextConfig;
