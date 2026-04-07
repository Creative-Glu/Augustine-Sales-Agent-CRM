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

  // ─── Security headers ────────────────────────────────────────────────────
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],

  experimental: {
    middlewareClientMaxBodySize: '50mb', // increase as needed
  },
};

export default nextConfig;
