// ─────────────────────────────────────────────────────────────
// 저장 레이어: Supabase(Postgres) 기반.
// 화면 코드는 getRecords/getRecord/saveRecord/deleteRecord/getCatalog
// 만 호출하며, 모두 async 입니다.
// (예전 MVP는 localStorage 기반이었고, 이 파일만 교체했습니다.)
// ─────────────────────────────────────────────────────────────

import { createClient } from "./supabase/client";
import { CATALOG as LOCAL_CATALOG } from "./catalog";

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
  region: string; // 시/도 (직접 선택, 빈 값이면 매장명으로 자동 추측)
  photoUrl: string; // 인증샷 한 장 (Supabase Storage, 공개 시 함께 노출)
  partySize: number; // 함께한 인원 (명), 0=미입력
  isPublic: boolean; // 공개 후기로 올릴지
  hidden: boolean; // 관리자 숨김
  createdAt: string; // ISO
}

// 공개 피드용: 기록 + 작성자 닉네임
export interface PublicReview extends EscapeRecord {
  nickname: string;
}

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
    region: "",
    photoUrl: "",
    partySize: 0,
    isPublic: false,
    hidden: false,
    createdAt: "",
  };
}

// ── DB(snake_case) ↔ 앱(camelCase) 매핑 ────────────────────────
type RecordRow = {
  id: string;
  user_id?: string;
  theme_name: string;
  cafe_name: string;
  played_at: string | null;
  genre: Genre;
  difficulty: number;
  fear_level: number;
  rating: number;
  success: boolean;
  remaining_time: string;
  hint_count: number;
  one_liner: string;
  memo: string;
  region: string | null;
  photo_url: string | null;
  party_size: number | null;
  is_public: boolean;
  hidden: boolean;
  created_at: string;
};

function fromRow(r: RecordRow): EscapeRecord {
  return {
    id: r.id,
    themeName: r.theme_name ?? "",
    cafeName: r.cafe_name ?? "",
    playedAt: r.played_at ?? "",
    genre: r.genre ?? "기타",
    difficulty: r.difficulty ?? 3,
    fearLevel: r.fear_level ?? 3,
    rating: r.rating ?? 3,
    success: !!r.success,
    remainingTime: r.remaining_time ?? "",
    hintCount: r.hint_count ?? 0,
    oneLiner: r.one_liner ?? "",
    memo: r.memo ?? "",
    region: r.region ?? "",
    photoUrl: r.photo_url ?? "",
    partySize: r.party_size ?? 0,
    isPublic: !!r.is_public,
    hidden: !!r.hidden,
    createdAt: r.created_at ?? "",
  };
}

function toRow(r: EscapeRecord, userId: string) {
  return {
    user_id: userId,
    theme_name: r.themeName,
    cafe_name: r.cafeName,
    played_at: r.playedAt || null,
    genre: r.genre,
    difficulty: r.difficulty,
    fear_level: r.fearLevel,
    rating: r.rating,
    success: r.success,
    remaining_time: r.remainingTime,
    hint_count: r.hintCount,
    one_liner: r.oneLiner,
    memo: r.memo,
    region: r.region || "", // NOT NULL 컬럼 → null 금지, 빈 문자열로
    photo_url: r.photoUrl || "", // NOT NULL 컬럼 → null 금지, 빈 문자열로
    party_size: Number(r.partySize) || 0,
    is_public: r.isPublic,
    hidden: r.hidden,
  };
}

// ── 기록 CRUD (본인 계정) ───────────────────────────────────────
// 로그인 안 했으면 빈 배열 반환.
export async function getRecords(): Promise<EscapeRecord[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as RecordRow[]).map(fromRow);
}

export async function getRecord(id: string): Promise<EscapeRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data as RecordRow);
}

export async function saveRecord(record: EscapeRecord): Promise<EscapeRecord | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const row = toRow(record, user.id);
  if (record.id) {
    const { data, error } = await supabase
      .from("records")
      .update(row)
      .eq("id", record.id)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data as RecordRow);
  }
  const { data, error } = await supabase
    .from("records")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as RecordRow);
}

export async function deleteRecord(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) throw error;
}

// 기록 인증샷 업로드 → 공개 URL 반환 (Storage 버킷: photos)
export async function uploadRecordPhoto(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const ext = file.name.split(".").pop() || "jpg";
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${user.id}/${rand}.${ext}`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

// user_id 목록 → 닉네임 맵. (records↔profiles 직접 FK가 없어 조인 대신 별도 조회)
export async function nicknamesFor(
  userIds: (string | undefined)[]
): Promise<Map<string, string>> {
  const supabase = createClient();
  const ids = Array.from(new Set(userIds.filter(Boolean))) as string[];
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("id", ids);
  (data as { id: string; nickname: string }[] | null)?.forEach((p) =>
    map.set(p.id, p.nickname || "익명")
  );
  return map;
}

// ── 공개 피드 (모두의 공개 후기) ────────────────────────────────
// memo 등 비공개 컬럼이 빠진 안전 뷰(public_reviews)에서만 읽는다.
export async function getPublicFeed(limit = 60): Promise<PublicReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("public_reviews")
    .select("*")
    .order("created_at", { ascending: false }) // 등록 최신순
    .limit(limit);
  if (error || !data) return [];
  const rows = data as RecordRow[];
  const nickById = await nicknamesFor(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    ...fromRow(r),
    nickname: nickById.get(r.user_id ?? "") || "익명",
  }));
}

// ── 카탈로그 (추천 후보 · 어드민이 관리) ─────────────────────────
type CatalogRow = {
  id: string;
  name: string;
  cafe: string;
  genre: Genre;
  difficulty: number;
  fear_level: number;
  tags: string[];
  teaser: string;
  hint: string;
  spoiler: string;
  poster_url: string | null;
  time_limit: number | null;
  players: string | null;
  reservation_url: string | null;
  price: number | null;
};

function catalogFromRow(r: CatalogRow): CandidateTheme {
  return {
    id: r.id,
    name: r.name,
    cafe: r.cafe,
    genre: r.genre,
    difficulty: r.difficulty,
    fearLevel: r.fear_level,
    tags: r.tags ?? [],
    teaser: r.teaser ?? "",
    hint: r.hint ?? "",
    spoiler: r.spoiler ?? "",
    posterUrl: r.poster_url ?? "",
    timeLimit: r.time_limit ?? 0,
    players: r.players ?? "",
    reservationUrl: r.reservation_url ?? "",
    price: r.price ?? 0,
  };
}

// DB에서 카탈로그를 읽되, 아직 Supabase 미설정/빈 상태면 로컬 배열로 폴백.
export async function getCatalog(): Promise<CandidateTheme[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("catalog")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return LOCAL_CATALOG;
    return (data as CatalogRow[]).map(catalogFromRow);
  } catch {
    return LOCAL_CATALOG;
  }
}

// ─────────────────────────────────────────────────────────────
// 취향 프로필 (기록에서 자동 계산) — 순수 함수
// ─────────────────────────────────────────────────────────────

export interface TasteProfile {
  count: number;
  topGenre: Genre | null;
  genreCounts: Record<Genre, number>;
  fearComfort: number;
  difficultyFit: number;
}

export function computeTaste(records: EscapeRecord[]): TasteProfile {
  const liked = records.filter((r) => Number(r.rating) >= 4);
  const base = liked.length ? liked : records;

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
// 추천: 카탈로그를 취향에 맞춰 점수화 — 순수 함수
// ─────────────────────────────────────────────────────────────

export interface CandidateTheme {
  id: string;
  name: string;
  cafe: string;
  genre: Genre;
  difficulty: number;
  fearLevel: number;
  tags: string[];
  teaser: string; // 줄거리/소개 (무스포)
  hint: string;
  spoiler: string;
  posterUrl?: string; // 포스터 이미지 URL (Supabase Storage)
  timeLimit?: number; // 제한시간(분), 0/미설정=미입력
  players?: string; // 인원 (예: "2~4")
  reservationUrl?: string; // 예약/상세 페이지 링크
  price?: number; // 1인 가격(원), 0/미설정=미입력
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
        score: Math.round((score / MAX) * 100),
        reason: reasons[0] || "새로운 도전",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// 퀴즈 결과 저장 (개인 · localStorage 유지 — 서버 불필요)
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

// ─────────────────────────────────────────────────────────────
// 예전 localStorage 기록을 계정으로 가져오기(1회 이관)
// ─────────────────────────────────────────────────────────────
const LEGACY_KEY = "escapelog:records:v1";

export function getLegacyLocalRecords(): EscapeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Partial<EscapeRecord>[];
    return arr.map((r) => ({ ...emptyRecord(), ...r, id: "" }));
  } catch {
    return [];
  }
}

export function clearLegacyLocalRecords(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_KEY);
}

// 로컬 기록들을 현재 계정으로 업로드.
export async function importLegacyRecords(records: EscapeRecord[]): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  if (records.length === 0) return 0;
  const rows = records.map((r) => toRow({ ...r, id: "" }, user.id));
  const { error, count } = await supabase
    .from("records")
    .insert(rows, { count: "exact" });
  if (error) throw error;
  return count ?? records.length;
}
