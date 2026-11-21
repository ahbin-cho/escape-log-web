// 사이트 공통 상수 (metadata, sitemap, robots, OG 등에서 공유)
// ⚠️ VERCEL_URL 은 배포마다 바뀌는 임시 주소라 쓰면 안 됨(사이트맵/canonical 오염).
//    고정 프로덕션 주소를 기본값으로 둔다.
export const CANONICAL_URL = "https://talkkaknote.com";

// 예전 주소. next.config 의 redirects 가 이 주소로 온 요청을 CANONICAL_URL 로 301 이동시킨다(목록을 고치면 next.config 도 같이).
// bangtallog.com 은 2026-11 이름 변경(방탈로그 → 탈깍노트 → 2026-11-19 방탈깍노트) 전 주소. 만료(2027-11-11)까지 새 주소로 넘긴다
export const LEGACY_HOSTS = ["escape-log-web-eight.vercel.app", "www.bangtallog.com", "bangtallog.com", "www.talkkaknote.com"];

// 환경변수가 예전 주소로 남아 있어도 대표 주소가 갈라지지 않게 무시한다.
const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
export const SITE_URL =
  envUrl && !LEGACY_HOSTS.some((h) => envUrl.includes(h)) ? envUrl : CANONICAL_URL;

export const SITE_NAME = "방탈깍노트";

// 카드·이미지에 찍는 주소(https:// 없이). 도메인을 바꾸면 CANONICAL_URL 만 고치면 따라 바뀐다
export const SITE_HOST = new URL(SITE_URL).host;

// 페이지가 openGraph 를 따로 지정하면 루트 opengraph-image 가 상속되지 않으므로
// 그런 페이지는 이걸 images 에 넣는다(app/opengraph-image.png 기본 이미지).
export const DEFAULT_OG_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630 };

// 사업·매장 문의 메일
export const CONTACT_EMAIL = "coco.cho.bz@gmail.com";

export const SITE_DESCRIPTION =
  "다녀온 방탈출을 기록하는 방탈출 기록장. 포스터 달력 다이어리, 연말 결산, 취향 진단, 딱 맞는 테마 추천, 친구 궁합까지.";

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
