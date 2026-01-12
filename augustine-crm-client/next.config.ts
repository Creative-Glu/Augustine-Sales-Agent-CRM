/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,

  experimental: {
    middlewareClientMaxBodySize: '50mb', // increase as needed
  },
};

export default nextConfig;
