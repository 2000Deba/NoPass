import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Added environment variables to be available at build time
  env: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    ALLOWED_MOBILE_SCHEMES: process.env.ALLOWED_MOBILE_SCHEMES,
  },
};

export default nextConfig;
