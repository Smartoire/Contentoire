const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  basePath: '/contentoire',
  assetPrefix: '/contentoire/',
  trailingSlash: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  images: {
    domains: ['ui-avatars.com'],
  },
  // Use Pages Router
  useFileSystemPublicRoutes: true,
  // Add CSS paths
  webpack: (config, { isServer }) => {
    config.resolve.alias['@styles'] = path.join(__dirname, 'styles');
    return config;
  },
  // Handle cross-origin requests
  allowedDevOrigins: ['gpu.smartoire.com']
}

module.exports = nextConfig
