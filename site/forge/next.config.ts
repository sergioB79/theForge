import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**/*": ["content/forge/**/*", "content/editorial/**/*", "data/*.json"],
  },
};

export default nextConfig;
