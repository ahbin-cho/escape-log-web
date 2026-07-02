"use client";

// ─────────────────────────────────────────────────────────────
// MVP 저장 레이어: 브라우저 localStorage 기반 (백엔드/비용 0)
// 나중에 Supabase 등으로 옮길 때는 이 파일의 함수 4개
// (getRecords / getRecord / saveRecord / deleteRecord) 만
// API 호출로 교체하면 됩니다. 화면 코드는 그대로 둬도 됩니다.
// ─────────────────────────────────────────────────────────────

export type Genre = "공포" | "추리" | "모험" | "감성" | "코믹" | "SF" | "기타";

export interface EscapeRecord {
  id: string;
  themeName: string;
  cafeName: string;
  playedAt: string; // YYYY-MM-DD
  genre: Genre;
  difficulty: number; // 1~5
  fearLevel: number; // 1~5
  rating: number; // 1~5
  success: boolean;
  remainingTime: string;
  hintCount: number;
  oneLiner: string; // 공개 · 무스포
  memo: string; // 비공개 · 스포 OK
  createdAt: string; // ISO
}

const KEY = "escapelog:records:v1";

export const GENRES: Genre[] = ["공포", "추리", "모험", "감성", "코믹", "SF", "기타"];

export const GENRE_COLOR: Record<Genre, string> = {
  공포: "bg-red-50 text-red-600",
  추리: "bg-emerald-50 text-emerald-600",
  모험: "bg-amber-50 text-amber-600",
  감성: "bg-pink-50 text-pink-500",
  코믹: "bg-yellow-50 text-yellow-600",
  SF: "bg-violet-50 text-violet-600",
  기타: "bg-stone-100 text-stone-500",
};

export const GENRE_EMOJI: Record<Genre, string> = {
  공포: "👻",
  추리: "🔍",
  모험: "🗺️",
  감성: "🌸",
  코믹: "🤡",
  SF: "🛸",
  기타: "🎲",
};

export function emptyRecord(): EscapeRecord {
  return {
    id: "",
    themeName: "",
    cafeName: "",
    playedAt: "",
    genre: "공포",
    difficulty: 3,
    fearLevel: 3,
    rating: 3,
    success: false,
    remainingTime: "",
    hintCount: 0,
    oneLiner: "",
    memo: "",
    createdAt: "",
  };
}

function read(): EscapeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EscapeRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: EscapeRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export function getRecords(): EscapeRecord[] {
  return read().sort((a, b) => {
    const da = a.playedAt || a.createdAt || "";
    const db = b.playedAt || b.createdAt || "";
    return db.localeCompare(da);
  });
}

export function getRecord(id: string): EscapeRecord | null {
  return read().find((r) => r.id === id) ?? null;
}

export function saveRecord(record: EscapeRecord): EscapeRecord {
  const records = read();
  if (record.id) {
    const i = records.findIndex((r) => r.id === record.id);
    if (i >= 0) records[i] = record;
    else records.push(record);
  } else {
    record.id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    record.createdAt = new Date().toISOString();
    records.push(record);
  }
  write(records);
  return record;
}

export function deleteRecord(id: string): void {
  write(read().filter((r) => r.id !== id));
}

// ─────────────────────────────────────────────────────────────
// 2단계: 취향 프로필 (기록에서 자동 계산)
// ─────────────────────────────────────────────────────────────

export interface TasteProfile {
  count: number; // 취향 계산에 쓰인 "좋았던" 기록 수 (별점 4+)
  topGenre: Genre | null; // 가장 자주 즐긴 장르
  genreCounts: Record<Genre, number>;
  fearComfort: number; // 선호 공포도(평균) 1~5
  difficultyFit: number; // 선호 난이도(평균) 1~5
}

export function computeTaste(records: EscapeRecord[]): TasteProfile {
  const liked = records.filter((r) => Number(r.rating) >= 4);
  const base = liked.length ? liked : records; // 좋았던 게 없으면 전체로

  const genreCounts = GENRES.reduce(
    (acc, g) => ({ ...acc, [g]: 0 }),
    {} as Record<Genre, number>
  );
  base.forEach((r) => {
    genreCounts[r.genre] = (genreCounts[r.genre] || 0) + 1;
  });

  let topGenre: Genre | null = null;
  let max = 0;
  GENRES.forEach((g) => {
    if (genreCounts[g] > max) {
      max = genreCounts[g];
      topGenre = g;
    }
  });

  const avg = (key: "fearLevel" | "difficulty") =>
    base.length
      ? base.reduce((s, r) => s + (Number(r[key]) || 0), 0) / base.length
      : 3;

  return {
    count: liked.length,
    topGenre,
    genreCounts,
    fearComfort: Math.round(avg("fearLevel") * 10) / 10,
    difficultyFit: Math.round(avg("difficulty") * 10) / 10,
  };
}

// ─────────────────────────────────────────────────────────────
// 추천: 내장 후보 카탈로그를 취향에 맞춰 점수화
// ─────────────────────────────────────────────────────────────

export interface CandidateTheme {
  id: string;
  name: string;
  cafe: string;
  genre: Genre;
  difficulty: number; // 1~5
  fearLevel: number; // 1~5
  tags: string[];
  teaser: string; // Lv0 무스포
  hint: string; // Lv2 약스포(힌트)
  spoiler: string; // Lv3 풀스포
}

export interface Recommendation extends CandidateTheme {
  score: number;
  reason: string;
}

export function recommend(
  catalog: CandidateTheme[],
  taste: TasteProfile,
  playedNames: string[],
  limit = 4,
  focusTags: string[] = []
): Recommendation[] {
  const played = new Set(playedNames.map((n) => n.trim()));
  const focus = new Set(focusTags);
  // 점수 최대치: 장르40 + 공포30 + 난이도30 + 포커스20 = 120 → 매칭%로 환산
  const MAX = 120;
  return catalog
    .filter((c) => !played.has(c.name.trim()))
    .map((c) => {
      let score = 0;
      const reasons: string[] = [];
      if (taste.topGenre && c.genre === taste.topGenre) {
        score += 40;
        reasons.push(`좋아하는 ${c.genre} 장르`);
      }
      const fearGap = Math.abs(c.fearLevel - taste.fearComfort);
      score += Math.max(0, 30 - fearGap * 10);
      if (fearGap <= 1) reasons.push("공포 수위가 잘 맞습니다");
      const diffGap = Math.abs(c.difficulty - taste.difficultyFit);
      score += Math.max(0, 30 - diffGap * 10);
      if (diffGap <= 1) reasons.push("난이도도 잘 맞습니다");
      const hit = c.tags.find((t) => focus.has(t));
      if (hit) {
        score += 20;
        reasons.push(`#${hit} 태그 매칭`);
      }
      return {
        ...c,
        score: Math.round((score / MAX) * 100), // 매칭 %
        reason: reasons[0] || "새로운 도전",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// 퀴즈 결과 저장 (홈/취향 화면과 공유)
// ─────────────────────────────────────────────────────────────

export interface SavedQuiz {
  taste: TasteProfile;
  focusTags: string[];
  persona: { title: string; emoji: string; blurb: string };
  answers: Record<string, number>;
  savedAt: string;
}

const QUIZ_KEY = "escapelog:quiz:v1";

export function saveQuiz(data: SavedQuiz): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUIZ_KEY, JSON.stringify(data));
}

export function getSavedQuiz(): SavedQuiz | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_KEY);
    return raw ? (JSON.parse(raw) as SavedQuiz) : null;
  } catch {
    return null;
  }
}

// 예시 데이터를 한 번만 넣어 첫 화면이 비어보이지 않게 함
export function seedIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (read().length > 0) return;
  const now = new Date().toISOString();
  write([
    {
      id: "seed-1",
      themeName: "어느 폐가의 기록",
      cafeName: "○○방탈출 강남점",
      playedAt: "2026-06-28",
      genre: "공포",
      difficulty: 4,
      fearLevel: 5,
      rating: 5,
      success: true,
      remainingTime: "3분 12초",
      hintCount: 2,
      oneLiner: "분위기 압도적. 심장 약하면 각오 필요.",
      memo: "(비공개) 여기 스포 있는 상세 메모",
      createdAt: now,
    },
    {
      id: "seed-2",
      themeName: "사라진 탐정",
      cafeName: "△△이스케이프 홍대점",
      playedAt: "2026-06-15",
      genre: "추리",
      difficulty: 3,
      fearLevel: 1,
      rating: 4,
      success: false,
      remainingTime: "0분",
      hintCount: 4,
      oneLiner: "추리 흐름 깔끔. 초보도 즐길 만함.",
      memo: "(비공개) 막힌 구간 메모",
      createdAt: now,
    },
  ]);
}
