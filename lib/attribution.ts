// ─────────────────────────────────────────────────────────────
// 유입 출처 추적(커뮤니티·광고·검색). 순수 함수만 둔다(테스트 대상).
// - 링크 꼬리표(utm_source/utm_medium/utm_campaign)가 있으면 그걸 쓰고,
// - 없으면 어디서 넘어왔는지(referrer)로 알려진 사이트를 판별한다.
// - 주소를 직접 쳐서 들어온 경우(출처 없음)는 세지 않는다.
// 개인 정보는 다루지 않는다.
// ─────────────────────────────────────────────────────────────

export type Attribution = {
  source: string; // dcinside, naver_cafe, instagram, naver_search …
  medium: string; // community, social, search, cpc, referral …
  campaign: string; // 글·광고 구분용(없으면 "")
  at: number; // 기록 시각(ms) — 만료 판단용
};

export const ATTRIBUTION_TTL_MS = 30 * 24 * 3600 * 1000; // 30일 동안 유효

export const EVENTS = [
  "visit",
  "quiz_done",
  "record_saved",
  "signup",
  "reserve_click",
] as const;
export type AttributionEvent = (typeof EVENTS)[number];

// 호스트 → [source, medium]. 앞에서부터 맞는 것을 쓴다(더 구체적인 것을 위에).
const REFERRERS: [RegExp, string, string][] = [
  [/(^|\.)cafe\.naver\.com$/, "naver_cafe", "community"],
  [/(^|\.)blog\.naver\.com$/, "naver_blog", "community"],
  [/(^|\.)search\.naver\.com$|(^|\.)m\.search\.naver\.com$/, "naver_search", "search"],
  [/(^|\.)naver\.com$/, "naver", "referral"],
  [/(^|\.)dcinside\.com$/, "dcinside", "community"],
  [/(^|\.)theqoo\.net$/, "theqoo", "community"],
  [/(^|\.)cafe\.daum\.net$/, "daum_cafe", "community"],
  [/(^|\.)search\.daum\.net$/, "daum_search", "search"],
  [/(^|\.)everytime\.kr$/, "everytime", "community"],
  [/(^|\.)teamblind\.com$/, "blind", "community"],
  [/(^|\.)boardlife\.co\.kr$/, "boardlife", "community"],
  [/(^|\.)instagram\.com$/, "instagram", "social"],
  [/(^|\.)threads\.(net|com)$/, "threads", "social"],
  [/(^|\.)(x|twitter)\.com$|(^|\.)t\.co$/, "x", "social"],
  [/(^|\.)facebook\.com$/, "facebook", "social"],
  [/(^|\.)kakao\.com$|(^|\.)kakaocdn\.net$/, "kakao", "social"],
  [/(^|\.)google\.[a-z.]+$/, "google", "search"],
  [/(^|\.)bing\.com$/, "bing", "search"],
];

// 소문자·영숫자·_·- 만, 최대 50자 (DB 제약과 같게)
export function cleanTag(v: string | null | undefined): string {
  return (v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-가-힣]/g, "")
    .slice(0, 50);
}

export function fromReferrer(
  referrer: string,
  ownHost: string
): { source: string; medium: string } | null {
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (!host || host === ownHost.toLowerCase()) return null; // 우리 사이트 안 이동
  for (const [re, source, medium] of REFERRERS) {
    if (re.test(host)) return { source, medium };
  }
  // 모르는 사이트는 도메인 그대로(www. 제거)
  return { source: cleanTag(host.replace(/^www\./, "").replace(/\./g, "_")), medium: "referral" };
}

// 이번 방문의 출처. 출처가 없으면 null(직접 방문).
export function detectAttribution(
  search: string,
  referrer: string,
  ownHost: string,
  now: number
): Attribution | null {
  const q = new URLSearchParams(search);
  const utmSource = cleanTag(q.get("utm_source"));
  if (utmSource) {
    return {
      source: utmSource,
      medium: cleanTag(q.get("utm_medium")) || "link",
      campaign: cleanTag(q.get("utm_campaign")),
      at: now,
    };
  }
  const ref = referrer ? fromReferrer(referrer, ownHost) : null;
  return ref ? { ...ref, campaign: "", at: now } : null;
}

// 저장해 둔 출처를 쓸지: 30일 안이면 유효
export function isFresh(a: Attribution | null, now: number): a is Attribution {
  return !!a && typeof a.at === "number" && now - a.at < ATTRIBUTION_TTL_MS;
}

// 커뮤니티 글·광고에 붙일 추적 링크 만들기
export function buildTrackedUrl(
  base: string,
  path: string,
  source: string,
  medium: string,
  campaign: string
): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base);
  const s = cleanTag(source);
  if (s) url.searchParams.set("utm_source", s);
  const m = cleanTag(medium);
  if (m) url.searchParams.set("utm_medium", m);
  const c = cleanTag(campaign);
  if (c) url.searchParams.set("utm_campaign", c);
  return url.toString();
}

// 전환율 표시: 방문자 대비 비율(방문자가 없으면 "–")
export function rateLabel(n: number, visitors: number): string {
  if (!visitors) return "–";
  return `${Math.round((n / visitors) * 100)}%`;
}

// 링크 만들기 도구의 출처 목록 [꼬리표, 화면 이름, medium]
export const SOURCE_PRESETS: [string, string, string][] = [
  ["dcinside", "디시 방탈출 갤러리", "community"],
  ["naver_cafe", "네이버 카페", "community"],
  ["theqoo", "더쿠", "community"],
  ["daum_cafe", "다음 카페", "community"],
  ["everytime", "에브리타임", "community"],
  ["blind", "블라인드", "community"],
  ["instagram", "인스타그램", "social"],
  ["threads", "스레드", "social"],
  ["x", "X(트위터)", "social"],
  ["kakao", "카카오톡 공유", "social"],
  ["naver_ads", "네이버 검색광고", "cpc"],
  ["google_ads", "구글 Ads", "cpc"],
];
