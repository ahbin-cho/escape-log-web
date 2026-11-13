/** @type {import('next').NextConfig} */

const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    // 인스타 카드 이미지가 서버에서 읽는 글꼴 파일을 배포에 포함
    outputFileTracingIncludes: {
      "/api/ig/mystery": ["./assets/fonts/**"],
      "/api/ig/collection": ["./assets/fonts/**"],
      "/api/ig/cafes": ["./assets/fonts/**"],
      "/api/ig/slides": ["./assets/fonts/**"],
      "/api/ig/story": ["./assets/fonts/**"],
    },
  },
};

export default nextConfig;
