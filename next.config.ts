import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sql.js', 'bcryptjs'],
  turbopack: {},
};

export default nextConfig;
