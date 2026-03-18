import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@canton-mvp/shared-types", "@canton-mvp/wallet-adapter"],
};

export default nextConfig;
