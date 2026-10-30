import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure transpile for modern ESM packages if needed
  transpilePackages: ["lucide-react"],
};

export default nextConfig;
