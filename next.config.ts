import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  basePath: '/activity_log',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
