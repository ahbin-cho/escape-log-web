import type { ThemeRow } from "./catalog-server";
import { districtFromText, regionFromText } from "./region";

// ─────────────────────────────────────────────────────────────
// 인스타그램 자동 게시: "오늘의 미스터리 방" 글(캡션)과 게시 순서.
// 캡션은 순수 함수(테스트 대상). 게시 API 호출은 app/api/ig/publish 에서.
// 인스타 캡션의 링크는 눌리지 않으므로 "프로필 링크"로 안내한다.
// ─────────────────────────────────────────────────────────────

export const IG_CAPTION_MAX = 2200; // 인스타 캡션 최대 글자 수
const IG_HASHTAG_MAX = 30; // 인스타 해시태그 최대 개수

function tag(s: string): string {
  return `#${s.replace(/[^0-9A-Za-z가-힣_]/g, "")}`;
}

// 해시태그: 큰 태그(묻히기 쉬움) + 중간 태그 + 좁은 태그(동네·조건, 여기서 눈에 띈다)를 섞는다.
// 브랜드 태그(#키이스케이프 등)는 정답이 드러나므로 넣지 않는다.
export function mysteryHashtags(t: ThemeRow): string[] {
  const region = regionFromText(t.cafe);
  const district = districtFromText(t.cafe);
  const playersMin = Number(((t.players ?? "").match(/\d+/) || [])[0]) || 0;
  const tags = [
    // 좁은 태그: 지역·동네
    district ? `${district}방탈출` : "",
    region ? `${region}방탈출` : "",
    district ? `${district}데이트` : "",
    // 조건
    `${t.genre}방탈출`,
    t.fear_level <= 2 ? "안무서운방탈출" : "",
    t.fear_level >= 4 ? "공포방탈출" : "",
    t.difficulty <= 2 ? "방탈출입문" : "",
    t.difficulty >= 4 ? "고난도방탈출" : "",
    playersMin && playersMin <= 2 && t.fear_level <= 3 ? "데이트코스" : "",
    // 중간 태그: 방탈출 커뮤니티
    "방탈출추천",
    "방탈출후기",
    "방탈출카페",
    "방탈러",
    "방린이",
    "방탈출스타그램",
    // 큰 태그 + 우리 태그
    "방탈출",
    "이색데이트",
    "오늘의미스터리방",
    "방탈로그",
  ].filter(Boolean);
  return [...new Set(tags.map(tag))].slice(0, IG_HASHTAG_MAX);
}

// 정답(테마 이름·매장)은 캡션에 넣지 않는다. 궁금하면 사이트로 오게.
export function mysteryCaption(t: ThemeRow): string {
  const region = regionFromText(t.cafe);
  const teaser = (t.teaser ?? "").trim().replace(/\s+/g, " ");
  const lines = [
    "👻 오늘의 미스터리 방",
    "",
    `“${teaser}”`,
    "",
    `${t.genre} · 난이도 ${t.difficulty}/5 · 공포도 ${t.fear_level}/5${region ? ` · ${region}` : ""}`,
    "",
    "이 줄거리, 어느 방일까요? 🤔",
    "정답은 프로필 링크 → 홈 '오늘의 미스터리 방'에서 공개해요.",
    "아는 방이면 댓글로 남겨 주세요!",
    "",
    mysteryHashtags(t).join(" "),
  ];
  let caption = lines.join("\n");
  if (caption.length > IG_CAPTION_MAX) {
    // 줄거리가 너무 길면 줄거리만 줄인다
    const over = caption.length - IG_CAPTION_MAX + 1;
    caption = caption.replace(teaser, `${teaser.slice(0, Math.max(0, teaser.length - over))}…`);
  }
  return caption;
}

// 오늘(한국 날짜) 이미 미스터리 방을 올렸는지 — 크론이 두 번 돌거나 수동으로 또 불러도 중복 게시 방지
export function alreadyPostedToday(
  media: { caption?: string; timestamp?: string }[],
  now: Date
): boolean {
  const kst = (d: Date) => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const today = kst(now);
  return media.some(
    (m) =>
      !!m.timestamp &&
      kst(new Date(m.timestamp)) === today &&
      (m.caption ?? "").includes("오늘의 미스터리 방")
  );
}

// 토큰 종류에 맞는 그래프 API 주소.
// 인스타 로그인 방식 토큰(IGAA…)만 graph.instagram.com, 통합 로그인·시스템 사용자 토큰(EAA…)은 graph.facebook.com
export function graphHost(token: string): string {
  return token.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com";
}

// ─────────────────────────────────────────────────────────────
// 게시 일정: 하루에 한 게시물만. 일정에 있는 날은 미스터리 대신 그 묶음을 올린다.
// 날짜는 한국 날짜(YYYY-MM-DD). 바꾸려면 여기만 고치고 배포.
// ─────────────────────────────────────────────────────────────
export type PostSet = "intro" | "ad-diary" | "ad-recap";

export const POST_SCHEDULE: { date: string; set: PostSet }[] = [
  { date: "2026-11-13", set: "intro" },
  { date: "2026-11-16", set: "ad-diary" },
  { date: "2026-12-01", set: "ad-recap" },
];

export function scheduledSet(kstDay: string): PostSet | null {
  return POST_SCHEDULE.find((p) => p.date === kstDay)?.set ?? null;
}

// 묶음별 이미지(사이트 카드 생성기 주소)
export function setImagePaths(set: PostSet): string[] {
  if (set === "intro") return [1, 2, 3, 4, 5, 6].map((n) => `/api/ig/slides?n=${n}`);
  return [`/api/ig/slides?ad=${set === "ad-diary" ? "diary" : "recap"}`];
}

const TAGS_BASE =
  "#방탈출 #방탈출기록 #방탈출다이어리 #방탈출추천 #방탈출후기 #방탈러 #방린이 #방탈출스타그램 #이색데이트 #방탈로그";

// 첫 줄은 묶음마다 달라야 한다(중복 게시 확인에 쓴다)
export const SET_CAPTIONS: Record<PostSet, string> = {
  intro: [
    "다녀온 방탈출, 기록하고 있어요? 📓",
    "",
    "몇 번째 방이었는지, 누구랑 갔는지, 힌트는 몇 번 썼는지.",
    "방탈로그에 남기면 다이어리로 쌓이고 연말엔 나만의 결산이 나와요.",
    "아직 안 가 본 방은 내 취향으로 골라 드려요.",
    "",
    "무료 · 로그인 없이 바로 시작 → 프로필 링크",
    "",
    TAGS_BASE,
  ].join("\n"),
  "ad-diary": [
    "지난주에 간 방, 벌써 헷갈리지 않아요?",
    "",
    "다녀온 날 30초만 남겨 두면 몇 번째 방인지 세어 드려요.",
    "50번째, 100번째 방은 따로 축하해요.",
    "",
    "무료 · 로그인 없이 30초 → 프로필 링크",
    "",
    TAGS_BASE,
  ].join("\n"),
  "ad-recap": [
    "올해, 몇 방 했어요?",
    "",
    "기록만 해 두면 연말 결산이 자동으로 나와요.",
    "플레이 수, 탈출 성공률, 노힌트, 원정 지역까지. 친구들한테 자랑은 버튼 하나.",
    "",
    "지금부터 써도 늦지 않았어요 → 프로필 링크",
    "",
    `${TAGS_BASE} #연말결산`,
  ].join("\n"),
};

// 최근 게시물 중 오늘(한국 날짜) 이 캡션 첫 줄로 올린 게 있는지
export function postedTodayWith(
  media: { caption?: string; timestamp?: string }[],
  now: Date,
  firstLine: string
): boolean {
  const kst = (d: Date) => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const today = kst(now);
  return media.some(
    (m) =>
      !!m.timestamp &&
      kst(new Date(m.timestamp)) === today &&
      (m.caption ?? "").split("\n")[0].includes(firstLine)
  );
}
