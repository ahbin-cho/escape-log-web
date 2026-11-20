// ─────────────────────────────────────────────────────────────
// 저장 레이어: Supabase(Postgres) 기반.
// 화면 코드는 getRecords/getRecord/saveRecord/deleteRecord/getCatalog
// 만 호출하며, 모두 async 입니다.
// (예전 MVP는 localStorage 기반이었고, 이 파일만 교체했습니다.)
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import { CATALOG as LOCAL_CATALOG } from "./catalog";
import type { QuizValues } from "./quiz/slots";
import { normalizeGenre } from "./genre";
import { compressImage, normalizePhotos, storagePath } from "./photos";

export type Genre =
  | "공포"
  | "스릴러"
  | "추리"
  | "아케이드"
  | "감성"
  | "코믹"
  | "판타지"
  | "모험"
  | "SF"
  | "기타";

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
  photoUrl: string; // 대표 인증샷(= photoUrls[0]). 피드·달력·서재·공유 카드는 이것만 쓴다
  photoUrls?: string[]; // 인증샷 여러 장(대표 포함, 최대 4). 없으면 photoUrl 한 장
  partySize: number; // 함께한 인원 (명), 0=미입력
  themeType: string; // 테마 유형: 장치/자물쇠/문제/혼합 ("" = 미입력)
  isPublic: boolean; // 한 줄 후기(글)를 다른 사람에게 보일지
  photoPublic?: boolean; // 사진도 보일지(기본 꺼짐). isPublic 이 켜져 있을 때만 의미가 있다
  spoiler?: boolean; // 한 줄에 스포일러가 있음 → 가려서 보여 준다
  hidden: boolean; // 관리자 숨김
  createdAt: string; // ISO
}

// 공개 피드용: 기록 + 작성자 닉네임
export interface PublicReview extends EscapeRecord {
  nickname: string;
  isSample?: boolean; // 운영자가 넣은 예시 후기(화면에 '예시' 표시, 통계·배지 제외)
}

export const GENRES: Genre[] = [
  "공포",
  "스릴러",
  "추리",
  "아케이드",
  "감성",
  "코믹",
  "판타지",
  "모험",
  "SF",
  "기타",
];

export const GENRE_COLOR: Record<Genre, string> = {
  공포: "bg-red-50 text-red-600",
  스릴러: "bg-slate-100 text-slate-700",
  아케이드: "bg-sky-50 text-sky-600",
  판타지: "bg-fuchsia-50 text-fuchsia-600",
  추리: "bg-emerald-50 text-emerald-600",
  모험: "bg-amber-50 text-amber-600",
  감성: "bg-pink-50 text-pink-500",
  코믹: "bg-yellow-50 text-yellow-600",
  SF: "bg-violet-50 text-violet-600",
  기타: "bg-stone-100 text-stone-500",
};

export const GENRE_EMOJI: Record<Genre, string> = {
  공포: "👻",
  스릴러: "🕵️",
  아케이드: "🎯",
  판타지: "🧚",
  추리: "🔍",
  모험: "🗺️",
  감성: "🥹",
  코믹: "🤡",
  SF: "🛸",
  기타: "🎲",
};

// 크롤링 등으로 앱 장르 외 값이 들어와도 안전하게 표시(카탈로그용).
export function genreEmoji(g: string): string {
  return GENRE_EMOJI[g as Genre] ?? "🎲";
}
export function genreColorClass(g: string): string {
  return GENRE_COLOR[g as Genre] ?? "bg-stone-100 text-stone-500";
}

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
    themeType: "",
    isPublic: false,
    hidden: false,
    createdAt: "",
  };
}

// ── DB(snake_case) ↔ 앱(camelCase) 매핑 ────────────────────────
type RecordRow = {
  id: string;
  is_sample?: boolean; // public_reviews 뷰에만 있음
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
  photo_urls?: string[] | null; // 여러 장 사진 칸을 만들기 전 DB 엔 없음(supabase/schema.sql)
  party_size: number | null;
  theme_type: string | null;
  is_public: boolean;
  photo_public?: boolean | null; // 후기 공개 범위 칸을 만들기 전 DB 엔 없음(supabase/schema.sql)
  spoiler?: boolean | null;
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
    photoUrls: normalizePhotos(r.photo_url, r.photo_urls),
    partySize: r.party_size ?? 0,
    themeType: r.theme_type ?? "",
    isPublic: !!r.is_public,
    photoPublic: !!r.photo_public,
    spoiler: !!r.spoiler,
    hidden: !!r.hidden,
    createdAt: r.created_at ?? "",
  };
}

/** 기록의 사진 목록(대표가 맨 앞). photoUrls 가 있으면 그것, 없으면 photoUrl 한 장 */
export function photosOf(r: Pick<EscapeRecord, "photoUrl" | "photoUrls">): string[] {
  return r.photoUrls ? normalizePhotos(null, r.photoUrls) : normalizePhotos(r.photoUrl, []);
}

function toRow(r: EscapeRecord, userId: string) {
  const photos = photosOf(r);
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
    photo_url: photos[0] ?? "", // NOT NULL 컬럼 → null 금지, 빈 문자열로
    photo_urls: photos,
    party_size: Number(r.partySize) || 0,
    theme_type: r.themeType || "",
    is_public: r.isPublic,
    photo_public: !!r.isPublic && !!r.photoPublic,
    spoiler: !!r.spoiler,
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

  const full = toRow(record, user.id);
  const write = (row: Partial<typeof full>) =>
    record.id
      ? supabase.from("records").update(row).eq("id", record.id).select().single()
      : supabase.from("records").insert(row).select().single();
  let { data, error } = await write(full);
  // photo_urls 칸을 만드는 SQL 을 아직 안 돌린 DB → 대표 사진 한 장만 저장
  if (error && /photo_urls/.test(error.message)) {
    const { photo_urls: _drop, ...one } = full;
    void _drop;
    ({ data, error } = await write(one));
  }
  // photo_public·spoiler 칸을 만드는 SQL 을 아직 안 돌린 DB → 그 칸 없이 저장.
  // 그 상태의 공개 뷰는 사진을 그대로 내보내고 스포 가림도 못 하므로,
  // 사진을 공개하지 않기로 했거나 스포일러가 있는 기록은 통째로 비공개로 둔다.
  if (error && /photo_public|spoiler/.test(error.message)) {
    const { photo_public: _p, spoiler: _s, ...old } = full;
    void _p;
    void _s;
    const safe = (old.photo_url && !full.photo_public) || full.spoiler ? { ...old, is_public: false } : old;
    ({ data, error } = await write(safe));
  }
  if (error) throw error;
  return fromRow(data as RecordRow);
}

// 예전 비공개 기록을 '글만' 한꺼번에 공개(사진은 그대로 비공개). 바뀐 개수를 돌려준다.
export async function publishMyPrivateRecords(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data, error } = await supabase
    .from("records")
    .update({ is_public: true })
    .eq("user_id", user.id)
    .eq("is_public", false)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
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
  const { blob, ext } = await compressImage(file); // 긴 변 1600px · WebP/JPEG 로 줄여서 올린다
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${user.id}/${rand}.${ext}`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, blob, { cacheControl: "31536000", upsert: false, contentType: blob.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

// 더는 안 쓰는 인증샷 파일 지우기(뺀 사진·지운 기록). 내 폴더 것만, 실패해도 조용히 넘어간다
export async function deleteRecordPhotos(urls: string[]): Promise<void> {
  if (!urls.length) return;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const paths = urls.map(storagePath).filter((p): p is string => !!p && p.startsWith(`${user.id}/`));
    if (paths.length) await supabase.storage.from("photos").remove(paths);
  } catch {
    /* 파일이 남아도 화면에는 영향 없음 */
  }
}

// user_id 목록 → 닉네임 맵. (records↔profiles 직접 FK가 없어 조인 대신 별도 조회)
// supabase 를 넘기면 그 클라이언트로 읽는다(서버에서 그릴 때 익명 publicClient 사용).
export async function nicknamesFor(
  userIds: (string | undefined)[],
  supabase: SupabaseClient = createClient()
): Promise<Map<string, string>> {
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
export async function getPublicFeed(
  limit = 60,
  supabase: SupabaseClient = createClient()
): Promise<PublicReview[]> {
  const { data, error } = await supabase
    .from("public_reviews")
    .select("*")
    .order("created_at", { ascending: false }) // 등록 최신순
    .limit(limit);
  if (error || !data) return [];
  const rows = data as RecordRow[];
  const nickById = await nicknamesFor(rows.map((r) => r.user_id), supabase);
  return rows.map((r) => ({
    ...fromRow(r),
    nickname: nickById.get(r.user_id ?? "") || "익명",
    isSample: !!r.is_sample,
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
  booking_open?: string | null;
};

function catalogFromRow(r: CatalogRow): CandidateTheme {
  return {
    id: r.id,
    name: r.name,
    cafe: r.cafe,
    genre: normalizeGenre(r.genre, r.tags),
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
    bookingOpen: r.booking_open ?? "",
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

// 기록 달력에 깔 포스터만 가볍게 (줄거리 등은 안 읽음)
export async function getPosters(): Promise<
  { name: string; cafe: string; posterUrl: string }[]
> {
  try {
    const { data, error } = await createClient()
      .from("catalog")
      .select("name, cafe, poster_url")
      .not("poster_url", "is", null)
      .neq("poster_url", "");
    if (error || !data) return [];
    return data.map((r) => ({ name: r.name, cafe: r.cafe, posterUrl: r.poster_url ?? "" }));
  } catch {
    return [];
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
  bookingOpen?: string; // 예약이 열리는 시점(예: "7일 전부터"), 비면 미확인
}

export interface Recommendation extends CandidateTheme {
  score: number;
  reason: string;
}

export interface RecommendPrefs {
  timePref?: number; // 선호 분(0/미설정 = 무시)
  playersPref?: number; // 선호 인원(0/미설정 = 무시)
}

// "2~4" → [2,4], "3" → [3,3], "" → null
function parsePlayersRange(s: string): [number, number] | null {
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

export function recommend(
  catalog: CandidateTheme[],
  taste: TasteProfile,
  playedNames: string[],
  limit = 4,
  focusTags: string[] = [],
  prefs: RecommendPrefs = {}
): Recommendation[] {
  const played = new Set(playedNames.map((n) => n.trim()));
  const focus = new Set(focusTags);
  const useTime = !!prefs.timePref;
  const usePlayers = !!prefs.playersPref;
  const MAX = 120 + (useTime ? 15 : 0) + (usePlayers ? 15 : 0);
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
      // 플레이 시간대 매칭
      if (useTime && c.timeLimit) {
        const gap = Math.abs(c.timeLimit - prefs.timePref!);
        score += Math.max(0, 15 - gap * 0.5);
        if (gap <= 10) reasons.push("플레이 시간대가 잘 맞습니다");
      }
      // 인원 매칭
      if (usePlayers && c.players) {
        const range = parsePlayersRange(c.players);
        if (range && prefs.playersPref! >= range[0] && prefs.playersPref! <= range[1]) {
          score += 15;
          reasons.push(`${prefs.playersPref}인 플레이에 맞습니다`);
        }
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
  persona: {
    title: string;
    emoji: string;
    blurb: string;
    brand?: { name: string; reason: string };
  };
  typeId?: string; // 유형 16개 중 하나. 개편 전 저장분에는 없다.
  values?: QuizValues; // 슬롯별 값. 개편 전 저장분에는 없다.
  answers?: Record<string, number>; // 개편 전 형식(문항 → 선택 번호). 새로 저장하지 않는다.
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

// 유형별 완료 수(전체). 집계 함수가 아직 없거나 읽기에 실패하면 null → 화면은 비율을 숨긴다.
export async function getTypeCounts(): Promise<Record<string, number> | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await createClient().rpc("quiz_type_counts");
    if (error || !Array.isArray(data)) return null;
    const counts: Record<string, number> = {};
    for (const row of data as { type_id: string; count: number | string }[]) {
      counts[row.type_id] = Number(row.count) || 0;
    }
    return counts;
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

// ─────────────────────────────────────────────────────────────
// 비회원 기록: 로그인 없이 먼저 쓰고, 가입하면 계정으로 옮긴다.
// 예전 로컬 기록과 같은 저장소(LEGACY_KEY)를 써서 기존 가져오기 흐름도 그대로 쓴다.
// GUEST_PENDING_KEY 가 있으면 "가입하면 자동으로 옮길 기록"이라는 뜻.
// ─────────────────────────────────────────────────────────────
const GUEST_PENDING_KEY = "escapelog:guest-pending";

export function saveGuestRecord(record: EscapeRecord): void {
  if (typeof window === "undefined") return;
  const list = getLegacyLocalRecords();
  list.push({ ...record, id: "", createdAt: new Date().toISOString() });
  window.localStorage.setItem(LEGACY_KEY, JSON.stringify(list));
  window.localStorage.setItem(GUEST_PENDING_KEY, "1");
}

// 가입 전 기록을 화면에 보여 줄 때 쓰는 목록. 계정 기록과 구분되게 id 를 "guest-N" 으로 붙인다
// (이 id 로는 수정 화면을 열 수 없다 → 화면에서 수정 링크를 숨긴다).
export const GUEST_ID_PREFIX = "guest-";
export const isGuestRecord = (r: { id: string }) => r.id.startsWith(GUEST_ID_PREFIX);
export function getGuestRecords(): EscapeRecord[] {
  return getLegacyLocalRecords().map((r, i) => ({ ...r, id: `${GUEST_ID_PREFIX}${i}` }));
}

export function hasGuestPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(GUEST_PENDING_KEY) === "1" &&
      getLegacyLocalRecords().length > 0
    );
  } catch {
    return false;
  }
}

// 로그인 직후 호출: 비회원으로 쓴 기록을 계정으로 옮긴다. 옮긴 개수(없거나 실패면 0).
export async function importGuestRecords(): Promise<number> {
  if (!hasGuestPending()) return 0;
  try {
    const n = await importLegacyRecords(getLegacyLocalRecords());
    clearLegacyLocalRecords();
    window.localStorage.removeItem(GUEST_PENDING_KEY);
    return n;
  } catch {
    return 0; // 실패하면 로컬에 그대로 두고 홈 배너에서 다시 시도
  }
}

// ── 테마 상세: 그 테마의 공개 후기 / 내 기록 ───────────────────────
// 이름으로 넓게 가져온 뒤 같은 브랜드인지 lib/reviews.ts 의 isSameTheme 으로 거른다.
export async function getThemePublicReviews(
  themeName: string,
  limit = 30
): Promise<PublicReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("public_reviews")
    .select("*")
    .eq("theme_name", themeName.trim())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  const rows = data as RecordRow[];
  const nickById = await nicknamesFor(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    ...fromRow(r),
    nickname: nickById.get(r.user_id ?? "") || "익명",
    isSample: !!r.is_sample,
  }));
}

export async function getMyThemeRecords(themeName: string): Promise<EscapeRecord[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", user.id)
    .eq("theme_name", themeName.trim())
    .order("played_at", { ascending: false, nullsFirst: false });
  if (error || !data) return [];
  return (data as RecordRow[]).map(fromRow);
}

// 그 테마의 가장 오래된 공개 후기 후보들(첫 후기 배지용). 목록이 최신 30개만 읽어도
// 첫 후기를 놓치지 않도록 오래된 순으로 따로 조금 읽는다.
export async function getThemeOldestReviews(
  themeName: string,
  limit = 20
): Promise<PublicReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("public_reviews")
    .select("*")
    .eq("theme_name", themeName.trim())
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  const rows = data as RecordRow[];
  const nickById = await nicknamesFor(rows.map((r) => r.user_id));
  return rows.map((r) => ({
    ...fromRow(r),
    nickname: nickById.get(r.user_id ?? "") || "익명",
    isSample: !!r.is_sample,
  }));
}
