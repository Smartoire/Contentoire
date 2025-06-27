const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: isProd ? '/contentoire' : '',
  assetPrefix: isProd ? '/contentoire/' : '',
  trailingSlash: true, // optional but often helpful with basePath
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
  }
}

module.exports = nextConfig
