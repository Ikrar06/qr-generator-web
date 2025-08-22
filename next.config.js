// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove webpack canvas alias that's causing conflicts
  webpack: (config, { isServer }) => {
    // Only disable canvas on client-side, keep it for server-side
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }
    
    // Handle node modules that need to be external
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('canvas');
    }
    
    return config;
  },
  
  // Ensure proper app directory configuration
  experimental: {
    // Remove if not needed, but sometimes helps with stability
    serverComponentsExternalPackages: ['canvas']
  },
  
  // Add proper TypeScript configuration
  typescript: {
    // Don't fail build on type errors during development
    ignoreBuildErrors: false,
  },
  
  // Ensure proper routing
  trailingSlash: false,
  
  // Add headers for better CORS handling AND cache control
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      // Add cache control for all pages (fix cache issue)
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Keep static assets cached but with shorter duration
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig