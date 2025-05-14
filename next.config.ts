import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
   eslint: {
    // Warning: this disables ESLint during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
