import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  images: { qualities: [75, 85] },
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      { source: "/", destination: "/zh-CN", permanent: false },
      {
        source: "/seiyuu/:path*",
        destination: "/zh-CN/seiyuu/:path*",
        permanent: true,
      },
    ];
  },
};
export default config;
