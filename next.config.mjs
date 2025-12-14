/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    NEXT_PUBLIC_HAS_GOOGLE_OAUTH: process.env.GOOGLE_CLIENT_ID ? "true" : "false",
    NEXT_PUBLIC_HAS_MICROSOFT_OAUTH: process.env.AZURE_AD_CLIENT_ID ? "true" : "false",
  },
};

export default nextConfig;
