// 사이트 공통 상수 (metadata, sitemap, robots, OG 등에서 공유)
// 커스텀 도메인이 생기면 NEXT_PUBLIC_SITE_URL 에 넣으면 됨.
// 없으면 Vercel 프로덕션 주소를 사용.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://escape-log-web-eight.vercel.app";

export const SITE_NAME = "방탈로그";

export const SITE_DESCRIPTION =
  "방탈출 경험을 기록하고, 취향을 진단받고, 딱 맞는 테마를 추천받는 방탈러 아카이브. 친구와 취향 궁합도 무료로.";

// 로그인/회원 전용·개인 페이지에 붙이는 색인 제외 메타.
// noindex 는 크롤을 막지 않고 "색인만 하지 마"라는 뜻이라, 검색엔진이
// 태그를 실제로 읽고 확실히 de-index 할 수 있음. (robots.txt Disallow 는
// 크롤 자체를 막아 noindex 를 못 읽게 만들 수 있으니 회원 페이지엔 이 방식을 씀)
export const NOINDEX = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
} as const;
