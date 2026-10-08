import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/recipes.ts reads this at request time; make sure it ships with every route.
  outputFileTracingIncludes: {
    "/*": ["./data/recipes.json"],
  },
  experimental: {
    serverActions: {
      // Photos are downscaled in the browser first; Vercel caps requests at 4.5MB anyway.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
