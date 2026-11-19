/** @type {import('next').NextConfig} */

// 예전 주소(lib/site.ts LEGACY_HOSTS 와 같은 목록)는 여기서 301 로 넘긴다.
// 미들웨어에서 하면 모든 요청이 함수를 한 번씩 거쳐 Vercel 무료 CPU 를 쓴다(2026-11-19 85% 경고) → 라우팅 단계에서 처리.
const LEGACY_HOSTS = ["escape-log-web-eight.vercel.app", "www.bangtallog.com", "bangtallog.com", "www.talkkaknote.com"];

const nextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: "https://talkkaknote.com/:path*",
      statusCode: 301,
    }));
  },
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
