import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep self-hosted production memory predictable. The app is dynamic and
  // does not need Next's default 50 MB in-memory ISR/Data cache.
  cacheMaxMemorySize: 0,
  productionBrowserSourceMaps: false,
  experimental: {
    // Lower peak webpack memory during production builds.
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    serverSourceMaps: false,
    // Avoid loading every route into memory when the self-hosted server starts.
    preloadEntriesOnStart: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "8letexyz.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "8lete.xyz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "frayto.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hsakaa.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;