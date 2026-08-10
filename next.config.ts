import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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