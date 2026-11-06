import type { ThemeRow } from "@/lib/catalog-server";

// ─────────────────────────────────────────────────────────────
// 조건별 목록 페이지(/best/[slug]) 정의.
// "안 무서운 방탈출", "2인 방탈출"처럼 예약 직전 사람이 치는 검색어를 받는다.
// 판정은 카탈로그 컬럼(장르·난이도·공포도·인원)만으로 한다(DB 변경 없음).
// 순수 함수만 둔다 — 페이지·사이트맵·테마 상세·테스트가 함께 쓴다.
// ─────────────────────────────────────────────────────────────

export type BestCondition = {
  slug: string; // 주소에 들어가는 한글 값
  label: string; // 칩·링크에 쓰는 짧은 이름
  emoji: string;
  title: string; // <title>, h1 앞부분 ("안 무서운 방탈출 추천")
  intro: string; // 본문 첫 문단 (페이지마다 다른 설명으로 얇은 페이지 방지)
  criteria: string; // "이 목록은 이렇게 골랐어요" 한 줄
  match: (t: ThemeRow) => boolean;
  // 목록 안 순서: 작을수록 앞. 조건에 "더 잘 맞는" 테마가 먼저 오게.
  rank: (t: ThemeRow) => number;
  faq: { q: string; a: string }[];
  quizCta: string; // 하단 취향 찾기 유도 문구
};

// 이보다 적게 걸리는 조건은 페이지를 만들지 않는다(얇은 페이지 방지).
export const MIN_BEST_THEMES = 5;

// "2~4" → [2,4], "3" → [3,3], "" → null(정보 없음)
export function playersRange(s: string | null | undefined): [number, number] | null {
  const nums = ((s ?? "").match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

function fitsCount(t: ThemeRow, n: number): boolean {
  const r = playersRange(t.players);
  return !!r && r[0] <= n && r[1] >= n;
}

export const BEST_CONDITIONS: BestCondition[] = [
  {
    slug: "안-무서운-방탈출",
    label: "안 무서운",
    emoji: "🌼",
    title: "안 무서운 방탈출 추천",
    intro:
      "무서운 건 싫은데 방탈출은 해 보고 싶다면 여기서 고르세요. 공포 장르를 빼고 공포도가 낮은 테마만 모았어요. 갑자기 튀어나오는 연출 걱정 없이 문제 풀이와 이야기에 집중할 수 있어요.",
    criteria: "공포 장르가 아니고 공포도 2/5 이하인 테마",
    match: (t) => t.genre !== "공포" && t.fear_level <= 2,
    rank: (t) => t.fear_level * 10 + t.difficulty,
    faq: [
      {
        q: "겁이 많은데 방탈출 해도 괜찮을까요?",
        a: "네. 공포 장르가 아닌 테마는 대부분 어두운 연출이나 깜짝 놀래키는 장치가 거의 없어요. 이 목록은 공포도 2/5 이하만 골랐어요.",
      },
      {
        q: "안 무서운 테마는 쉬운가요?",
        a: "공포도와 난이도는 별개예요. 각 테마의 난이도(1~5)를 함께 표시했으니, 처음이라면 난이도 2 이하부터 골라 보세요.",
      },
    ],
    quizCta: "무서운 건 빼고, 내 취향에 딱 맞는 방만 골라 줄게요.",
  },
  {
    slug: "공포-방탈출",
    label: "공포",
    emoji: "👻",
    title: "공포 방탈출 추천",
    intro:
      "심장이 쫄깃한 방을 찾는다면 여기예요. 공포 장르이거나 공포도가 높은 테마를 무서운 순서로 모았어요. 배우 연출·암전·청각 연출이 있는 방은 태그로 확인하세요.",
    criteria: "공포 장르이거나 공포도 4/5 이상인 테마 (무서운 순)",
    match: (t) => t.genre === "공포" || t.fear_level >= 4,
    rank: (t) => (5 - t.fear_level) * 10 + (5 - t.difficulty),
    faq: [
      {
        q: "공포 방탈출은 얼마나 무서운가요?",
        a: "테마마다 달라요. 이 목록은 공포도가 높은 순으로 정렬했어요. 처음이라면 공포도 4부터, 자신 있다면 5부터 도전해 보세요.",
      },
      {
        q: "공포 테마는 몇 명이 가는 게 좋아요?",
        a: "혼자 앞장설 사람이 부담되지 않게 3~4명이 많이 가요. 각 테마의 권장 인원을 확인하세요.",
      },
    ],
    quizCta: "공포 취향도 갈려요. 깜짝파인지 분위기파인지 진단해 볼까요?",
  },
  {
    slug: "입문-방탈출",
    label: "입문·초보",
    emoji: "🐣",
    title: "방탈출 입문·초보 추천",
    intro:
      "방탈출이 처음이라면 난이도가 낮고 너무 무섭지 않은 방부터 시작하세요. 첫 방에서 탈출에 성공하면 훨씬 재밌어져요. 난이도 낮은 순으로 모았어요.",
    criteria: "난이도 2/5 이하이고 공포도 3/5 이하인 테마",
    match: (t) => t.difficulty <= 2 && t.fear_level <= 3,
    rank: (t) => t.difficulty * 10 + t.fear_level,
    faq: [
      {
        q: "방탈출 처음인데 뭐부터 해야 하나요?",
        a: "난이도 1~2, 공포도 낮은 테마를 2~4명이 함께 가는 걸 추천해요. 힌트는 아끼지 말고 쓰는 게 더 즐거워요.",
      },
      {
        q: "초보는 몇 명이 가는 게 좋아요?",
        a: "3~4명이 가장 무난해요. 역할을 나눠 여러 문제를 동시에 볼 수 있어서 첫 탈출 성공률이 높아요.",
      },
    ],
    quizCta: "처음이라도 취향은 있어요. 질문 몇 개로 첫 방을 골라 줄게요.",
  },
  {
    slug: "고난도-방탈출",
    label: "고난도",
    emoji: "🧠",
    title: "고난도 방탈출 추천",
    intro:
      "웬만한 방은 다 깼다면 여기서 고르세요. 난이도 4/5 이상인 테마를 어려운 순으로 모았어요. 숙련자끼리 가야 제대로 즐길 수 있는 방들이에요.",
    criteria: "난이도 4/5 이상인 테마 (어려운 순)",
    match: (t) => t.difficulty >= 4,
    rank: (t) => (5 - t.difficulty) * 10 + (5 - t.fear_level),
    faq: [
      {
        q: "고난도 방탈출은 탈출률이 얼마나 되나요?",
        a: "매장마다 다르지만 숙련자도 실패하는 경우가 많아요. 힌트 사용 규칙을 미리 확인하세요.",
      },
    ],
    quizCta: "어려운 것도 종류가 있어요. 추리형인지 장치형인지 진단해 볼까요?",
  },
  {
    slug: "2인-방탈출",
    label: "2인·데이트",
    emoji: "💞",
    title: "2인 방탈출 추천 (데이트 코스)",
    intro:
      "둘이서 가기 좋은 방만 모았어요. 권장 인원에 2명이 들어가는 테마예요. 데이트라면 공포도 낮은 방부터, 둘 다 겁이 없다면 공포 테마도 좋아요.",
    criteria: "권장 인원에 2명이 포함된 테마 (덜 무서운 순)",
    match: (t) => fitsCount(t, 2),
    rank: (t) => t.fear_level * 10 + t.difficulty,
    faq: [
      {
        q: "방탈출 2명이서 해도 되나요?",
        a: "네. 권장 인원에 2명이 포함된 테마라면 충분히 탈출할 수 있어요. 다만 인원이 적으면 문제를 나눠 풀기 어려우니 난이도를 함께 보세요.",
      },
      {
        q: "데이트로 가기 좋은 방탈출은?",
        a: "공포도가 낮고 이야기가 있는 감성·모험 테마가 무난해요. 이 목록은 덜 무서운 순으로 정렬했어요.",
      },
    ],
    quizCta: "둘의 취향이 얼마나 맞는지, 친구 궁합으로 확인해 보세요.",
  },
  {
    slug: "단체-방탈출",
    label: "단체(5인+)",
    emoji: "🎉",
    title: "단체 방탈출 추천 (5인 이상)",
    intro:
      "동아리, 회사 워크숍, 친구 모임처럼 여럿이 갈 때는 5명 이상 들어가는 방을 고르세요. 권장 최대 인원이 5명 이상인 테마만 모았어요.",
    criteria: "권장 최대 인원이 5명 이상인 테마",
    match: (t) => (playersRange(t.players)?.[1] ?? 0) >= 5,
    rank: (t) => -(playersRange(t.players)?.[1] ?? 0) * 10 + t.fear_level,
    faq: [
      {
        q: "회사 워크숍으로 방탈출 가도 되나요?",
        a: "네. 5인 이상 테마는 팀을 나눠 협동하기 좋아요. 인원이 더 많다면 같은 매장의 여러 테마를 동시에 예약하는 방법도 있어요.",
      },
    ],
    quizCta: "팀원 취향이 다 달라도 괜찮아요. 친구 궁합으로 팀에 맞는 방을 찾아보세요.",
  },
  {
    slug: "추리-방탈출",
    label: "추리",
    emoji: "🔍",
    title: "추리 방탈출 추천",
    intro:
      "단서를 모아 범인을 찾는 재미가 좋다면 추리 장르를 고르세요. 추리 장르 테마를 난이도 순으로 모았어요.",
    criteria: "추리 장르 테마",
    match: (t) => t.genre === "추리",
    rank: (t) => t.difficulty * 10 + t.fear_level,
    faq: [
      {
        q: "추리 방탈출은 어려운가요?",
        a: "자물쇠보다 단서 해석 비중이 커요. 난이도 낮은 순으로 정렬했으니 위에서부터 골라 보세요.",
      },
    ],
    quizCta: "추리파 안에서도 취향이 갈려요. 내 유형을 진단해 볼까요?",
  },
  {
    slug: "감성-방탈출",
    label: "감성·스토리",
    emoji: "🌙",
    title: "감성·스토리 방탈출 추천",
    intro:
      "문제보다 이야기에 빠지는 걸 좋아한다면 감성 장르를 고르세요. 연출과 스토리가 중심인 테마를 모았어요.",
    criteria: "감성 장르 테마 (덜 무서운 순)",
    match: (t) => t.genre === "감성",
    rank: (t) => t.fear_level * 10 + t.difficulty,
    faq: [
      {
        q: "감성 방탈출은 뭐가 달라요?",
        a: "탈출보다 이야기 몰입이 중심이에요. 엔딩 연출이 인상적인 테마가 많아 처음 하는 사람도 만족도가 높아요.",
      },
    ],
    quizCta: "이야기 취향을 알려 주면 딱 맞는 감성방을 골라 줄게요.",
  },
];

export function conditionBySlug(slug: string): BestCondition | null {
  return BEST_CONDITIONS.find((c) => c.slug === slug) ?? null;
}

// 조건에 맞는 테마를 "더 잘 맞는 순"으로 정렬해 반환
export function themesForCondition(
  c: BestCondition,
  themes: ThemeRow[]
): ThemeRow[] {
  return themes
    .filter(c.match)
    .sort((a, b) => c.rank(a) - c.rank(b) || a.name.localeCompare(b.name, "ko"));
}

// 페이지가 실제로 생성되는 조건 (정의 순서 유지)
export function listedConditions(
  themes: ThemeRow[]
): { condition: BestCondition; count: number }[] {
  return BEST_CONDITIONS.map((condition) => ({
    condition,
    count: themes.filter(condition.match).length,
  })).filter((x) => x.count >= MIN_BEST_THEMES);
}
