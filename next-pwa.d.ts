declare module "next-pwa" {
  import { NextConfig } from "next";
  export default function withPWAInit(pwaConfig: any): (nextConfig: NextConfig) => NextConfig;
}
