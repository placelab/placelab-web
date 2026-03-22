/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // GitHub Pages: 레포지토리명에 맞게 수정
  // 예) https://username.github.io/urban-lab-web/
  basePath: process.env.NODE_ENV === 'production' ? '/urban-lab-web' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/urban-lab-web/' : '',

  images: {
    unoptimized: true, // GitHub Pages는 Next.js Image Optimization 미지원
  },

  trailingSlash: true, // GitHub Pages 호환성
};

module.exports = nextConfig;
