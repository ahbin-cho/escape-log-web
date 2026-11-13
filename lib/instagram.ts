import type { ThemeRow } from "./catalog-server";
import { districtFromText, regionFromText } from "./region";
import { areaThemes, pickCollection } from "./collection";
import { pickYearEndCafes } from "./cafe-picks";

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
export type PostSet = "intro" | "record-story" | "ad-diary" | "ad-recap";

// set 은 고정 묶음(PostSet) 또는 "collection:<지역>"(지역 모음), "story:<테마 id>"(이 방의 이야기),
// "reel:<테마 id>"(이 방의 이야기 릴스 — public/reels/ 의 영상), "skip"(그날은 자동 게시 쉼)
// extra: true 면 그날 직접 올린 게시물이 있어도 이 묶음은 올린다(같은 묶음이 이미 있으면 건너뜀)
export const POST_SCHEDULE: { date: string; set: string; extra?: boolean }[] = [
  { date: "2026-11-12", set: "intro" },
  { date: "2026-11-13", set: "static:suwon", extra: true }, // 제미나이 그림으로 다시 만든 수원 모음 6장
  { date: "2026-11-14", set: "static:diary" }, // 다이어리 소개 4장(후기 카드·달력·기록으로 본 유형)

  // 이 방의 이야기는 카드 대신 릴스로(처음 보는 사람에게 더 퍼진다)
  { date: "2026-11-15", set: "reel:b60b538b-618e-4102-ab57-06f369f56a4b" }, // 성지기숙학원 : 특수교정반
  { date: "2026-11-16", set: "reel:4451205b-df5a-462f-9f62-4461c59f9440" }, // 영안실
  { date: "2026-11-17", set: "reel:5bcecef5-c59b-41a4-bb31-dda03276f724" }, // 춘화각 : 피할 수 없는 저주
  { date: "2026-11-18", set: "cafes:yearend" },
  { date: "2026-12-01", set: "ad-recap" },
];

export function scheduledSet(kstDay: string): string | null {
  return POST_SCHEDULE.find((p) => p.date === kstDay)?.set ?? null;
}

export function scheduledExtra(kstDay: string): boolean {
  return POST_SCHEDULE.find((p) => p.date === kstDay)?.extra === true;
}

// 직접 만든 카드 묶음(public/ig-static/<이름>/1.jpg …). "static:<이름>" 으로 올린다
export const STATIC_POSTS: Record<string, { count: number; caption: string }> = {
  diary: {
    count: 4,
    caption: [
      "방켓팅까지 해서 간 방, 1년 뒤에도 기억나요?",
      "",
      "예약 전쟁 뚫고 간 방도, 시간이 지나면 이름부터 가물가물해요.",
      "📸 사진 한 장에 한 줄만 쓰면 후기 카드가 되고",
      "📅 다녀온 날마다 달력에 포스터가 쌓이고",
      "🔮 기록 3개면 내 방탈출 유형과 다음에 갈 방까지 나와요.",
      "",
      "후기 카드는 그대로 스토리에 공유할 수 있어요.",
      "먼저 써 보고 10초 가입 → 프로필 링크",
      "",
      "#방탈출 #방탈출기록 #방탈출다이어리 #방탈출후기 #방탈출추천 #방탈러 #방린이 #방켓팅 #방탈출스타그램 #이색데이트 #방탈로그",
    ].join("\n"),
  },
  suwon: {
    count: 6,
    caption: [
      "수원 방탈출, 어디 갈지 고민이라면 📍",
      "",
      "수원 테마 44개 중에서 취향별로 골라 봤어요. 옆으로 넘겨 보세요 →",
      "👻 무서운 게 좋다면",
      "🌿 무서운 건 싫다면",
      "🐣 방탈출이 처음이라면",
      "📖 이야기가 좋다면",
      "",
      "저장해 두고 수원 갈 때 꺼내 보기 📌",
      "테마 전체 목록·줄거리·후기 → 프로필 링크",
      "(정보는 각 매장 공식 소개 기준이에요)",
      "",
      "#수원방탈출 #인계동방탈출 #수원데이트 #수원놀거리 #수원가볼만한곳 #경기방탈출 #방탈출추천 #방탈출 #방탈러 #방린이 #방탈출스타그램 #이색데이트 #방탈로그",
    ].join("\n"),
  },
};

// 릴스 영상 파일(public/reels/). 테마 id → 파일 이름
export const REEL_FILES: Record<string, string> = {
  "b60b538b-618e-4102-ab57-06f369f56a4b": "sungji",
  "4451205b-df5a-462f-9f62-4461c59f9440": "morgue",
  "5bcecef5-c59b-41a4-bb31-dda03276f724": "chunhwa",
};

export type ResolvedPost = { imagePaths: string[]; caption: string; videoPath?: string };

// 게시할 이미지(또는 릴스 영상) 경로와 캡션. 알 수 없는 묶음·없는 테마면 null
export function resolvePost(set: string, themes: ThemeRow[]): ResolvedPost | null {
  if (set.startsWith("static:")) {
    const name = set.slice("static:".length);
    const p = STATIC_POSTS[name];
    if (!p) return null;
    return {
      imagePaths: Array.from({ length: p.count }, (_, i) => `/ig-static/${name}/${i + 1}.jpg`),
      caption: p.caption,
    };
  }
  if (set.startsWith("reel:")) {
    const id = set.slice("reel:".length);
    const file = REEL_FILES[id];
    const story = file ? resolvePost(`story:${id}`, themes) : null;
    if (!file || !story) return null;
    return { imagePaths: [], videoPath: `/reels/${file}.mp4`, caption: story.caption };
  }
  if (set in SET_CAPTIONS) {
    return { imagePaths: setImagePaths(set as PostSet), caption: SET_CAPTIONS[set as PostSet] };
  }
  if (set.startsWith("collection:")) {
    const area = set.slice("collection:".length);
    const list = areaThemes(themes, area);
    const sections = pickCollection(list);
    if (sections.length === 0) return null;
    const total = sections.length + 2;
    const q = encodeURIComponent(area);
    return {
      imagePaths: Array.from({ length: total }, (_, i) => `/api/ig/collection?area=${q}&page=${i + 1}`),
      caption: [
        `${area} 방탈출, 어디 갈지 고민이라면 📍`,
        "",
        `${area} 테마 ${list.length}개를 조건별로 골라 봤어요.`,
        sections.map((s) => `· ${s.title}`).join("\n"),
        "",
        "정보는 각 매장 공식 소개 기준이에요. 전체 목록·줄거리·후기 → 프로필 링크",
        "",
        `#${area}방탈출 #${area}데이트 #${area}놀거리 #경기방탈출 #방탈출추천 #방탈출 #방탈러 #방린이 #방탈출스타그램 #이색데이트 #방탈로그`,
      ].join("\n"),
    };
  }
  if (set === "cafes:yearend") {
    const cafes = pickYearEndCafes(themes, 6);
    if (cafes.length === 0) return null;
    return {
      imagePaths: Array.from({ length: cafes.length + 2 }, (_, i) => `/api/ig/cafes?page=${i + 1}`),
      caption: [
        "연말 모임, 방탈출 어디서 할까? 🗝️",
        "",
        `겁 많은 친구도 같이 갈 수 있게, 무섭지 않은 테마가 많은 서울 방탈출 카페 ${cafes.length}곳을 골랐어요.`,
        cafes.map((c, i) => `${i + 1}. ${c.cafe}`).join("\n"),
        "",
        "고른 기준: 서울 · 테마 3개 이상 · 공포도 2 이하 테마가 60% 넘는 곳 · 브랜드당 1곳 (방탈로그 테마 데이터 기준)",
        "예약·영업시간은 각 매장 예약 페이지에서 확인해 주세요.",
        "매장별 테마 전체·줄거리·후기 → 프로필 링크",
        "",
        "#서울방탈출 #연말모임 #연말데이트 #이색데이트 #방탈출카페 #방탈출추천 #안무서운방탈출 #방탈출 #방탈러 #방탈출스타그램 #방탈로그",
      ].join("\n"),
    };
  }
  if (set.startsWith("story:")) {
    const t = themes.find((x) => x.id === set.slice("story:".length));
    if (!t || !t.teaser) return null;
    const region = regionFromText(t.cafe);
    const district = districtFromText(t.cafe);
    return {
      imagePaths: [`/api/ig/story?id=${t.id}`],
      caption: [
        `🕯️ 이 방의 이야기 · ${t.name}`,
        "",
        `“${t.teaser.trim().replace(/\s+/g, " ")}”`,
        "",
        `${t.cafe} · ${t.genre} · 난이도 ${t.difficulty}/5 · 공포도 ${t.fear_level}/5`,
        "다녀왔다면 어땠는지 댓글로 알려 주세요. 기록은 프로필 링크에서.",
        "",
        "(줄거리는 매장 공식 소개 기준)",
        "",
        [
          district ? `#${district}방탈출` : "",
          region ? `#${region}방탈출` : "",
          `#${t.genre}방탈출`,
          t.fear_level >= 4 ? "#공포방탈출" : "",
          "#방탈출 #방탈출추천 #방탈출후기 #방탈러 #방탈출스타그램 #이방의이야기 #방탈로그",
        ]
          .filter(Boolean)
          .join(" "),
      ].join("\n"),
    };
  }
  return null;
}

// 묶음별 이미지(사이트 카드 생성기 주소)
export function setImagePaths(set: PostSet): string[] {
  if (set === "intro") return [1, 2, 3, 4, 5, 6].map((n) => `/api/ig/slides?n=${n}`);
  // 기록 캠페인 4장: 공감(방켓팅) → 해결(다이어리) → 보상(결산) → 행동(시작하기)
  if (set === "record-story")
    return [
      "/api/ig/slides?ad=ticket&page=1/4",
      "/api/ig/slides?ad=diary&page=2/4",
      "/api/ig/slides?n=3&page=3/4",
      "/api/ig/slides?n=6&page=4/4",
    ];
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
    "먼저 써 보고 10초 가입 → 프로필 링크",
    "",
    TAGS_BASE,
  ].join("\n"),
  "record-story": [
    "방켓팅까지 해서 간 방, 1년 뒤에도 기억나요?",
    "",
    "예약 전쟁 뚫고 간 방도, 시간이 지나면 이름부터 가물가물해요.",
    "다녀온 날 30초만 남겨 두면 몇 번째 방인지 세어 주고, 연말엔 결산까지 나와요.",
    "",
    "티켓은 사라져도, 기록은 남아요.",
    "먼저 써 보고 10초 가입 → 프로필 링크",
    "",
    `${TAGS_BASE} #방켓팅`,
  ].join("\n"),
  "ad-diary": [
    "지난주에 간 방, 벌써 헷갈리지 않아요?",
    "",
    "다녀온 날 30초만 남겨 두면 몇 번째 방인지 세어 드려요.",
    "50번째, 100번째 방은 따로 축하해요.",
    "",
    "먼저 써 보고 10초 가입 → 프로필 링크",
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
