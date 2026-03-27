/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 서버사이드 렌더링 (static export 제거)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dl.dropboxusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.dropboxusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
