/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  experimental: {
    serverComponentsExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'motonapratica.online',
      },
      {
        protocol: 'https',
        hostname: 'motonapratica.dominuslabs.online',
      },
    ],
  },
};

export default nextConfig;
