import type { Genre, TasteProfile } from "./store";
import { GENRES } from "./store";

// ─────────────────────────────────────────────────────────────
// 오지선다 취향 찾기 퀴즈 (AI 추천 엔진 "느낌"의 입력)
// 각 문항 5지선다. 답변 → TasteProfile + 페르소나(자연어 진단).
// ─────────────────────────────────────────────────────────────

export interface QuizOption {
  emoji: string;
  label: string;
  /** 문항별 의미값: 장르 / 1~5 척도 / 포커스 키 / 플레이버 텍스트 */
  value: string | number;
}

export interface QuizQuestion {
  id: string;
  emoji: string;
  prompt: string;
  options: QuizOption[]; // 5개
}

export type QuizAnswers = Record<string, number>; // questionId → 선택 index

export const QUIZ: QuizQuestion[] = [
  {
    id: "genre",
    emoji: "🫀",
    prompt: "방탈출 하면 심장이 뛰는 순간은?",
    options: [
      { emoji: "👻", label: "오싹한 공포 연출", value: "공포" },
      { emoji: "🔍", label: "실마리를 잇는 추리", value: "추리" },
      { emoji: "🌸", label: "뭉클한 스토리", value: "감성" },
      { emoji: "🗺️", label: "짜릿한 모험", value: "모험" },
      { emoji: "🛸", label: "신기한 SF 세계", value: "SF" },
    ],
  },
  {
    id: "fear",
    emoji: "😱",
    prompt: "무서움, 어디까지 괜찮아요?",
    options: [
      { emoji: "🥺", label: "하나도 안 무서웠으면", value: 1 },
      { emoji: "🙂", label: "살짝 긴장되는 정도", value: 2 },
      { emoji: "😲", label: "적당히 놀래키는 건 OK", value: 3 },
      { emoji: "😨", label: "꽤 무서워도 좋아", value: 4 },
      { emoji: "🤯", label: "심장 쫄깃 대환영", value: 5 },
    ],
  },
  {
    id: "difficulty",
    emoji: "🔑",
    prompt: "난이도는 어떤 게 취향?",
    options: [
      { emoji: "🍭", label: "술술 풀리는 게 좋아", value: 1 },
      { emoji: "🙂", label: "적당히 쉬운 편", value: 2 },
      { emoji: "🤔", label: "평범한 난이도", value: 3 },
      { emoji: "🧠", label: "좀 어려워야 재밌지", value: 4 },
      { emoji: "🔥", label: "머리 쥐어뜯는 극악", value: 5 },
    ],
  },
  {
    id: "focus",
    emoji: "✨",
    prompt: "방탈출에서 제일 중요한 건?",
    options: [
      { emoji: "📖", label: "몰입되는 스토리", value: "story" },
      { emoji: "⚙️", label: "기발한 장치", value: "device" },
      { emoji: "🎭", label: "생생한 연출", value: "staging" },
      { emoji: "🤝", label: "다같이 협동", value: "coop" },
      { emoji: "🛋️", label: "예쁜 인테리어·감성", value: "cozy" },
    ],
  },
  {
    id: "party",
    emoji: "👯",
    prompt: "누구랑 가는 게 좋아요?",
    options: [
      { emoji: "🧍", label: "혼자 조용히 몰입", value: "혼자 몰입하는" },
      { emoji: "👫", label: "마음 맞는 소수 정예", value: "소수 정예로 파고드는" },
      { emoji: "👨‍👩‍👧", label: "왁자지껄 여럿이", value: "왁자지껄 즐기는" },
      { emoji: "💕", label: "연인이랑 오붓하게", value: "오붓하게 즐기는" },
      { emoji: "🎲", label: "아무나 상관없어", value: "누구와도 잘 노는" },
    ],
  },
  {
    id: "players",
    emoji: "👯‍♀️",
    prompt: "보통 몇 명이서 가요?",
    options: [
      { emoji: "🧍", label: "혼자 (1인)", value: 1 },
      { emoji: "👫", label: "둘이서 (2인)", value: 2 },
      { emoji: "👨‍👩‍👧", label: "3~4명이서", value: 4 },
      { emoji: "🎉", label: "5명 이상 왁자지껄", value: 5 },
      { emoji: "🤷", label: "그때그때 달라", value: 0 },
    ],
  },
  {
    id: "hint",
    emoji: "💡",
    prompt: "막히면 힌트, 쓰는 편?",
    options: [
      { emoji: "🦾", label: "절대 안 쓰고 버틴다", value: "고집스러운 순수주의자" },
      { emoji: "😌", label: "정말 최후에만", value: "은근한 승부사" },
      { emoji: "🙂", label: "적당히 쓰는 편", value: "균형 잡힌 플레이어" },
      { emoji: "🙋", label: "막히면 바로바로", value: "효율파 스피드러너" },
      { emoji: "🤷", label: "힌트 뭐 어때 다 써", value: "즐기면 그만인 낙천가" },
    ],
  },
  {
    id: "activity",
    emoji: "🏃",
    prompt: "방 안에서 어떤 스타일이야?",
    options: [
      { emoji: "🧘", label: "앉아서 머리로 승부", value: "두뇌파" },
      { emoji: "🚶", label: "돌아다니며 탐색", value: "탐색파" },
      { emoji: "🤸", label: "몸 쓰는 미션도 좋아", value: "활동파" },
      { emoji: "🎭", label: "NPC랑 소통이 재밌어", value: "소통파" },
      { emoji: "🎯", label: "일단 자물쇠부터 찾아", value: "돌격파" },
    ],
  },
  {
    id: "atmosphere",
    emoji: "🌙",
    prompt: "어떤 분위기가 끌려?",
    options: [
      { emoji: "🕯️", label: "어둡고 으스스한", value: "dark" },
      { emoji: "🌈", label: "밝고 화사한", value: "bright" },
      { emoji: "🏚️", label: "낡고 퇴폐적인", value: "grungy" },
      { emoji: "🏰", label: "웅장하고 판타지", value: "epic" },
      { emoji: "🎀", label: "아기자기 귀여운", value: "cute" },
    ],
  },
  {
    id: "time",
    emoji: "⏰",
    prompt: "플레이 시간은 어느 정도가 좋아?",
    options: [
      { emoji: "⚡", label: "40분 이내 후다닥", value: "short" },
      { emoji: "🙂", label: "60분 딱 적당해", value: "normal" },
      { emoji: "🕐", label: "70~80분 넉넉히", value: "long" },
      { emoji: "🏕️", label: "90분 이상 풀코스", value: "extra" },
      { emoji: "🤷", label: "시간은 상관없어", value: "any" },
    ],
  },
  {
    id: "vibe",
    emoji: "🎉",
    prompt: "방탈출 끝나고 당신은?",
    options: [
      { emoji: "🏆", label: "클리어 타임 인증샷부터", value: "성취형" },
      { emoji: "🍜", label: "바로 근처 맛집 직행", value: "먹부림형" },
      { emoji: "🗣️", label: "복기하며 수다 삼매경", value: "복기형" },
      { emoji: "📸", label: "소품이랑 사진 찰칵", value: "기록형" },
      { emoji: "🎟️", label: "다음 방 바로 예약각", value: "중독형" },
    ],
  },
];

// 포커스 → 카탈로그 태그 매핑 (추천 보정용)
export const FOCUS_TAGS: Record<string, string[]> = {
  story: ["몰입", "스토리", "따뜻함", "편지", "힐링"],
  device: ["장치"],
  staging: ["청각연출", "배우연출", "귀신"],
  coop: ["협동", "가족"],
  cozy: ["아기자기", "힐링", "귀여움", "따뜻함", "디저트"],
};

function optValue(qId: string, idx: number): string | number | undefined {
  const q = QUIZ.find((x) => x.id === qId);
  if (!q || idx == null || idx < 0) return undefined;
  return q.options[idx]?.value;
}

/** 퀴즈 답변 → TasteProfile (recommend()가 그대로 사용) */
export function quizToTaste(answers: QuizAnswers): TasteProfile {
  const genre = optValue("genre", answers["genre"]) as Genre | undefined;
  const fear = Number(optValue("fear", answers["fear"]) ?? 3);
  const diff = Number(optValue("difficulty", answers["difficulty"]) ?? 3);

  const genreCounts = GENRES.reduce(
    (acc, g) => ({ ...acc, [g]: 0 }),
    {} as Record<Genre, number>
  );
  if (genre) genreCounts[genre] = 1;

  return {
    count: Object.keys(answers).length,
    topGenre: genre ?? null,
    genreCounts,
    fearComfort: fear,
    difficultyFit: diff,
  };
}

export function focusTagsOf(answers: QuizAnswers): string[] {
  const focus = optValue("focus", answers["focus"]) as string | undefined;
  return focus ? FOCUS_TAGS[focus] ?? [] : [];
}

// 추천 점수 보정용 선호값 (크롤 데이터의 timeLimit·players 매칭)
export interface QuizPrefs {
  timePref: number; // 선호 분(0 = 상관없음)
  playersPref: number; // 선호 인원(0 = 상관없음)
}
export function quizPrefs(answers: QuizAnswers): QuizPrefs {
  const timeVal = optValue("time", answers["time"]) as string | undefined;
  const timeMap: Record<string, number> = {
    short: 40,
    normal: 60,
    long: 75,
    extra: 95,
    any: 0,
  };
  const players = Number(optValue("players", answers["players"]) ?? 0) || 0;
  return { timePref: timeVal ? timeMap[timeVal] ?? 0 : 0, playersPref: players };
}

// 취향 → 어울리는 브랜드 추천 (크롤한 4개 브랜드 성격 기반)
const BRAND_STYLE: Record<string, string> = {
  키이스케이프: "탄탄한 스토리와 완성도",
  제로월드: "강렬한 공포·연출과 높은 난이도",
  비트포비아: "활동적이고 몰입감 큰 모험",
  셜록홈즈: "정통 추리와 두뇌 플레이",
};
export function brandAffinity(answers: QuizAnswers): { name: string; reason: string } {
  const genre = (optValue("genre", answers["genre"]) as string) ?? "기타";
  const fear = Number(optValue("fear", answers["fear"]) ?? 3);
  const diff = Number(optValue("difficulty", answers["difficulty"]) ?? 3);
  const activity = (optValue("activity", answers["activity"]) as string) ?? "";
  const atmosphere = (optValue("atmosphere", answers["atmosphere"]) as string) ?? "";

  let name = "키이스케이프";
  if (genre === "공포" && (fear >= 4 || diff >= 4)) name = "제로월드";
  else if (atmosphere === "grungy" || atmosphere === "dark") name = "제로월드";
  else if (genre === "추리") name = "셜록홈즈";
  else if (genre === "모험" || activity === "활동파" || activity === "돌격파")
    name = "비트포비아";
  else if (genre === "감성" || genre === "SF" || genre === "코믹")
    name = "키이스케이프";

  return { name, reason: BRAND_STYLE[name] };
}

export interface Persona {
  title: string; // 아키타입 이름
  emoji: string;
  blurb: string; // 자연어 진단
  brand?: { name: string; reason: string }; // 어울리는 브랜드
}

// 서비스 마스코트 (사주유 '옥냥이'와 겹치지 않게 방탈출 유령 가이드)
export const MASCOT = {
  name: "탈출귀",
  emoji: "👻",
  tagline: "방 좀 깨본 유령이 취향 딱 짚어줄게",
} as const;

// ── 페르소나 조합 테이블 ──

const GENRE_WORD: Record<string, string> = {
  공포: "오싹한 공포", 추리: "치밀한 추리", 감성: "뭉클한 감성",
  모험: "짜릿한 모험", SF: "신비로운 SF", 코믹: "유쾌한 코믹", 기타: "다채로운",
};
const GENRE_EMOJI: Record<string, string> = {
  공포: "👻", 추리: "🕵️", 감성: "🌸", 모험: "🧭", SF: "🛸", 코믹: "🤹", 기타: "🎲",
};
const FOCUS_WORD: Record<string, string> = {
  story: "스토리파", device: "장치파", staging: "연출파", coop: "협동파", cozy: "감성파",
};
const ACTIVITY_WORD: Record<string, string> = {
  "두뇌파": "두뇌", "탐색파": "탐색", "활동파": "액티브", "소통파": "소통", "돌격파": "돌격",
};
const ATMOSPHERE_WORD: Record<string, string> = {
  dark: "다크", bright: "라이트", grungy: "그런지", epic: "판타지", cute: "큐트",
};

// 장르×공포 조합 → 특수 아키타입 (커버리지 대폭 확장)
const ARCHETYPE_COMBOS: Record<string, { title: string; emoji: string }> = {
  // 공포
  "공포_5": { title: "공포 중독자", emoji: "💀" },
  "공포_4": { title: "겁 없는 호러 마니아", emoji: "🖤" },
  "공포_3": { title: "담대한 공포 애호가", emoji: "😈" },
  "공포_2": { title: "살금살금 공포 탐험러", emoji: "🕯️" },
  "공포_1": { title: "겁쟁이 호러 도전러", emoji: "🫣" },
  // 추리
  "추리_5": { title: "셜록급 추리왕", emoji: "🧐" },
  "추리_4": { title: "집요한 탐정", emoji: "🔍" },
  "추리_3": { title: "예리한 추리가", emoji: "🕵️" },
  "추리_2": { title: "차분한 단서 수집가", emoji: "🔎" },
  "추리_1": { title: "말랑말랑 추리 입문러", emoji: "🧩" },
  // 감성
  "감성_1": { title: "따뜻한 힐링 여행자", emoji: "🌿" },
  "감성_2": { title: "감성 수집가", emoji: "🌙" },
  "감성_3": { title: "잔잔한 무드메이커", emoji: "🍵" },
  "감성_4": { title: "깊이 빠지는 감성러", emoji: "🌌" },
  // 모험
  "모험_5": { title: "무모한 모험왕", emoji: "⚔️" },
  "모험_4": { title: "대담한 탐험가", emoji: "🗺️" },
  "모험_3": { title: "씩씩한 탐험가", emoji: "🧭" },
  "모험_2": { title: "설레는 여행자", emoji: "🎒" },
  "모험_1": { title: "안전제일 모험가", emoji: "🧳" },
  // SF
  "SF_5": { title: "미지의 세계 개척자", emoji: "🚀" },
  "SF_4": { title: "차원을 넘는 여행자", emoji: "🌌" },
  "SF_3": { title: "우주 유영자", emoji: "🌠" },
  "SF_2": { title: "호기심 SF 탐구자", emoji: "🔭" },
  "SF_1": { title: "말랑 SF 입문러", emoji: "🪐" },
  // 코믹
  "코믹_1": { title: "깔깔 힐링러", emoji: "😄" },
  "코믹_2": { title: "유쾌한 장난꾸러기", emoji: "🤪" },
  "코믹_3": { title: "웃음 사냥꾼", emoji: "🎪" },
  "코믹_4": { title: "짓궂은 코믹 마니아", emoji: "🤡" },
};

// 극단·특이 조합 → 희귀 페르소나 (일반 조합보다 우선 적용)
function specialPersona(o: {
  genre: string;
  fear: number;
  diff: number;
  hint: string;
  atmosphere: string;
  activity: string;
}): { title: string; emoji: string } | null {
  const { genre, fear, diff, hint, atmosphere, activity } = o;
  if (diff >= 5 && fear >= 5 && hint.includes("순수주의자"))
    return { title: "극한의 노힌트 완파러", emoji: "🔥" };
  if (diff >= 5 && hint.includes("순수주의자"))
    return { title: "노힌트 하드코어러", emoji: "🧗" };
  if (genre === "공포" && fear >= 5 && diff >= 4)
    return { title: "공포+고난도 광인", emoji: "👹" };
  if (genre === "감성" && fear <= 1 && diff <= 2 && atmosphere === "cute")
    return { title: "완전체 힐링 요정", emoji: "🧚" };
  if (diff <= 1 && hint.includes("낙천가"))
    return { title: "마음 편한 산책러", emoji: "🍃" };
  if (activity === "소통파" && atmosphere === "epic")
    return { title: "세계관에 빙의하는 배우", emoji: "🎭" };
  if (diff >= 4 && hint.includes("스피드러너"))
    return { title: "하드코어 스피드러너", emoji: "⚡" };
  return null;
}

// 끝나고 행동(vibe) → 한 줄
const VIBE_LINE: Record<string, string> = {
  성취형: "클리어하면 인증샷부터 남기는 성취파고,",
  먹부림형: "끝나면 근처 맛집으로 직행하는 먹부림파고,",
  복기형: "복기하면서 수다 떠는 걸 좋아하고,",
  기록형: "소품이랑 사진 남기는 기록파고,",
  중독형: "끝나자마자 다음 방 예약하는 찐 중독자고,",
};

// 시간 선호 → 한 줄
const TIME_LINE: Record<string, string> = {
  short: "짧고 굵게 후다닥 즐기는 편이고,",
  normal: "60분 표준이 제일 맘 편하고,",
  long: "넉넉한 70~80분에서 진가를 발휘하고,",
  extra: "90분 풀코스도 마다 않는 진성이고,",
  any: "",
};

// 난이도×힌트 조합 → 플레이 성격
function playStyle(diff: number, hint: string): string {
  if (diff >= 4 && hint.includes("순수주의자")) return "절대 안 꺾이는 하드코어 완파러";
  if (diff >= 4 && hint.includes("승부사")) return "끝까지 물고 늘어지는 승부사";
  if (diff >= 4 && hint.includes("스피드러너")) return "어려운 방도 속도전으로 돌파하는 타입";
  if (diff <= 2 && hint.includes("낙천가")) return "편하게 즐기는 게 제일인 낙천파";
  if (diff <= 2 && hint.includes("스피드러너")) return "쉬운 방을 빠르게 쓸어버리는 스피드러너";
  if (diff >= 4) return "어려울수록 불타오르는 도전파";
  if (diff <= 2) return "가볍게 즐기는 캐주얼 플레이어";
  return "밸런스 잡힌 올라운더";
}

// 분위기×장르 조합 → 무드 한 줄
function moodLine(atmosphere: string, genre: string): string {
  if (atmosphere === "dark" && genre === "공포") return "어둠 속에서 진가를 발휘하는 타입이야.";
  if (atmosphere === "dark" && genre === "추리") return "음침한 분위기에서 단서 찾을 때 눈이 반짝이는 타입이지.";
  if (atmosphere === "cute" && genre === "공포") return "귀여운 걸 좋아하면서 공포도 즐기다니, 반전 매력이네.";
  if (atmosphere === "cute" && genre === "감성") return "아기자기하고 따뜻한 방이면 완전 취향저격이겠다.";
  if (atmosphere === "epic" && genre === "모험") return "웅장한 세계관에 빠져드는 진짜 모험가 스타일이야.";
  if (atmosphere === "epic" && genre === "SF") return "스케일 큰 SF 세계관이면 완벽하겠는데?";
  if (atmosphere === "bright" && genre === "감성") return "밝고 따뜻한 분위기에서 감동받는 타입이구만.";
  if (atmosphere === "grungy" && genre === "공포") return "퇴폐적인 공간에서 오히려 몰입 200%인 타입이네.";
  if (atmosphere === "grungy" && genre === "추리") return "낡고 거친 현장감이 추리의 맛을 살려주지.";
  const atmoName = ATMOSPHERE_WORD[atmosphere] ?? "";
  return atmoName ? `${atmoName} 감성이 취향이구만.` : "";
}

// 활동×동행 조합 → 동행 한 줄
function partyLine(activity: string, party: string): string {
  if (activity === "소통파" && party.includes("혼자")) return "NPC 소통을 좋아하면서 혼자 간다고? 은근 내향 사교형이네.";
  if (activity === "활동파" && party.includes("왁자지껄")) return "몸 쓰는 미션에 여럿이서 난리 치는 게 제일 재밌는 타입이지.";
  if (activity === "두뇌파" && party.includes("소수")) return "소수 정예로 머리 굴리는 작전형이구만.";
  if (activity === "돌격파" && party.includes("왁자지껄")) return "일단 돌격하고 보는 스타일에 여럿이면 카오스 파티네.";
  if (activity === "탐색파" && party.includes("연인")) return "같이 구석구석 뒤지면서 오붓하게, 로맨틱하네.";
  if (party) return `${party} 편이지?`;
  return "";
}

/** 규칙 기반 페르소나 진단 (조합 기반) */
export function buildPersona(answers: QuizAnswers): Persona {
  const genre = (optValue("genre", answers["genre"]) as Genre) ?? "기타";
  const fear = Number(optValue("fear", answers["fear"]) ?? 3);
  const diff = Number(optValue("difficulty", answers["difficulty"]) ?? 3);
  const focus = optValue("focus", answers["focus"]) as string | undefined;
  const party = (optValue("party", answers["party"]) as string) ?? "";
  const hint = (optValue("hint", answers["hint"]) as string) ?? "";
  const activity = (optValue("activity", answers["activity"]) as string) ?? "";
  const atmosphere = (optValue("atmosphere", answers["atmosphere"]) as string) ?? "";

  // 1) 타이틀: 특수(희귀) → 장르×공포 조합 → 포커스+장르 조합
  const special = specialPersona({ genre, fear, diff, hint, atmosphere, activity });
  const combo = ARCHETYPE_COMBOS[`${genre}_${fear}`];
  let title: string;
  let emoji: string;
  if (special) {
    title = special.title;
    emoji = special.emoji;
  } else if (combo) {
    title = combo.title;
    emoji = combo.emoji;
  } else {
    const focusPart = focus && FOCUS_WORD[focus] ? FOCUS_WORD[focus] + " " : "";
    const activityPart =
      activity && ACTIVITY_WORD[activity] ? ACTIVITY_WORD[activity] + " " : "";
    title = `${activityPart}${focusPart}${GENRE_WORD[genre]} 탐험가`;
    emoji = GENRE_EMOJI[genre] ?? "🎲";
  }

  // 2) 본문: 여러 축을 엮어 풍부하게
  const style = playStyle(diff, hint);
  const mood = moodLine(atmosphere, genre);
  const partyMsg = partyLine(activity, party);
  const brand = brandAffinity(answers);
  const vibe = (optValue("vibe", answers["vibe"]) as string) ?? "";
  const vibeLine = VIBE_LINE[vibe] ?? "";
  const timeVal = optValue("time", answers["time"]) as string | undefined;
  const timeLine = timeVal ? TIME_LINE[timeVal] ?? "" : "";
  const playersPref = Number(optValue("players", answers["players"]) ?? 0) || 0;
  const playersLine =
    playersPref === 1
      ? "혼자서도 파고드는 스타일이라, "
      : playersPref >= 5
        ? "여럿이 왁자지껄 즐기는 걸 좋아하니, "
        : playersPref === 2
          ? "둘이서 오붓하게 즐기는 편이라, "
          : "";

  const blurb =
    `흐흐, 딱 보니까 넌 ${style}이구만. ` +
    (mood ? `${mood} ` : "") +
    (partyMsg ? `${partyMsg} ` : "") +
    (vibeLine ? `${vibeLine} ` : "") +
    (timeLine ? `${timeLine} ` : "") +
    `${playersLine}특히 ${brand.name} 같은 곳이 잘 맞아 — ${brand.reason} 덕분이지. ` +
    `그래서 ${GENRE_WORD[genre]} 테마 위주로 골라놨어. 따라와 봐. 👻`;

  return { title, emoji, blurb, brand };
}
