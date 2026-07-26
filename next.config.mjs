/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'motonapratica.dominuslabs.online',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Desabilita avisos de lint ou typescript no build caso precise pular validação
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/posts/:slug([a-zA-Z0-9_-]+)',
        destination: '/post/:slug',
        permanent: true,
      },
      {
        source: '/en/posts/:slug([a-zA-Z0-9_-]+)',
        destination: '/en/post/:slug',
        permanent: true,
      },
      {
        source: '/es/posts/:slug([a-zA-Z0-9_-]+)',
        destination: '/es/post/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
