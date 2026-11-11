// 사이트 공통 상수 (metadata, sitemap, robots, OG 등에서 공유)
// 커스텀 도메인이 생기면 NEXT_PUBLIC_SITE_URL 에 넣으면 됨.
// ⚠️ VERCEL_URL 은 배포마다 바뀌는 임시 주소라 쓰면 안 됨(사이트맵/canonical 오염).
//    고정 프로덕션 주소를 기본값으로 둔다.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://escape-log-web-eight.vercel.app";

export const SITE_NAME = "방탈로그";

// 페이지가 openGraph 를 따로 지정하면 루트 opengraph-image 가 상속되지 않으므로
// 그런 페이지는 이걸 images 에 넣는다(app/opengraph-image.png 기본 이미지).
export const DEFAULT_OG_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630 };

// 사업·매장 문의 메일
export const CONTACT_EMAIL = "coco.cho.bz@gmail.com";

export const SITE_DESCRIPTION =
  "다녀온 방탈출을 기록하는 무료 기록장. 포스터로 채워지는 달력 다이어리, 몇 번째 방인지와 연말 결산, 취향 진단과 딱 맞는 테마 추천, 친구 궁합까지.";

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
