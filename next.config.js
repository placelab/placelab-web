/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 서버사이드 렌더링 (static export 제거)
  images: {
    // 같은 도메인의 /api/image 프록시 사용
    remotePatterns: [],
  },
};

module.exports = nextConfig;
