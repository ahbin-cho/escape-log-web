// 어드민 전용 데이터 함수. RLS 의 is_admin() 정책이 실제 권한을 강제하므로
// 여기서는 일반 브라우저 클라이언트를 그대로 쓴다(관리자가 아니면 서버가 거부).

import { createClient } from "./supabase/client";
import { nicknamesFor } from "./store";
import type { Genre, PublicReview, CandidateTheme } from "./store";

type RecordRow = {
  id: string;
  user_id: string;
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

// 공개 후기 전체(숨김 포함) — 관리자만 hidden=true 도 볼 수 있음.
export async function adminListReviews(): Promise<PublicReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const rows = data as RecordRow[];
  const nickById = await nicknamesFor(rows.map((r) => r.user_id));
  return rows.map((r) => ({
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
    memo: "", // 비공개 메모는 어드민 화면에도 노출하지 않음
    region: r.region ?? "",
    photoUrl: r.photo_url ?? "",
    partySize: r.party_size ?? 0,
    isPublic: true,
    hidden: !!r.hidden,
    createdAt: r.created_at ?? "",
    nickname: nickById.get(r.user_id) || "익명",
  }));
}

export async function setReviewHidden(id: string, hidden: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("records").update({ hidden }).eq("id", id);
  if (error) throw error;
}

export async function adminDeleteReview(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) throw error;
}

// ── 카탈로그 CRUD ──────────────────────────────────────────────
export interface CatalogInput extends Omit<CandidateTheme, "id"> {
  id?: string;
}

export function emptyCatalogItem(): CatalogInput {
  return {
    name: "",
    cafe: "",
    genre: "공포",
    difficulty: 3,
    fearLevel: 3,
    tags: [],
    teaser: "",
    hint: "",
    spoiler: "",
    posterUrl: "",
    timeLimit: 60,
    players: "",
    reservationUrl: "",
    price: 0,
  };
}

export async function saveCatalogItem(item: CatalogInput): Promise<void> {
  const supabase = createClient();
  const row = {
    name: item.name,
    cafe: item.cafe,
    genre: item.genre,
    difficulty: Number(item.difficulty),
    fear_level: Number(item.fearLevel),
    tags: item.tags,
    teaser: item.teaser,
    hint: item.hint,
    spoiler: item.spoiler,
    poster_url: item.posterUrl ?? "",
    time_limit: Number(item.timeLimit) || 0,
    players: item.players ?? "",
    reservation_url: item.reservationUrl ?? "",
    price: Number(item.price) || 0,
  };
  if (item.id) {
    const { error } = await supabase.from("catalog").update(row).eq("id", item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("catalog").insert(row);
    if (error) throw error;
  }
}

export async function deleteCatalogItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("catalog").delete().eq("id", id);
  if (error) throw error;
}

// 포스터 이미지 업로드 → 공개 URL 반환. (Storage 버킷: posters)
export async function uploadPoster(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${rand}.${ext}`;
  const { error } = await supabase.storage
    .from("posters")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("posters").getPublicUrl(path);
  return data.publicUrl;
}

// ── 대시보드 카운트 ────────────────────────────────────────────
export async function adminCounts(): Promise<{
  records: number;
  publicReviews: number;
  catalog: number;
}> {
  const supabase = createClient();
  const [rec, pub, cat] = await Promise.all([
    supabase.from("records").select("id", { count: "exact", head: true }),
    supabase
      .from("records")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true),
    supabase.from("catalog").select("id", { count: "exact", head: true }),
  ]);
  return {
    records: rec.count ?? 0,
    publicReviews: pub.count ?? 0,
    catalog: cat.count ?? 0,
  };
}
