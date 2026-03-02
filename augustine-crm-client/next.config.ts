/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,

  redirects: async () => [
    { source: '/marketing-icp', destination: '/icp', permanent: false },
    { source: '/marketing-campaigns', destination: '/campaigns', permanent: false },
  ],

  experimental: {
    middlewareClientMaxBodySize: '50mb', // increase as needed
  },
};

export default nextConfig;
