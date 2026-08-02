import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.GITHUB_PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: "export",
    images: { unoptimized: true },
    basePath,
    trailingSlash: true,
  }),
};

export default nextConfig;
