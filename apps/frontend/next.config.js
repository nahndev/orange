/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@orange/shared-types"],
  async rewrites() {
    return [
      {
        source: "/rest/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:3001/rest"}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
