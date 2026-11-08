import { GENRES, type Genre } from "./store";

// ─────────────────────────────────────────────────────────────
// 크롤링한 카탈로그 장르(40여 가지)를 앱 장르 10개로 묶는다.
// 장르가 분명하면 장르를 따르고, 뭉뚱그린 장르(기타·스토리 등)면 태그로 정한다.
// 원본 데이터 자체가 틀린 경우(예: 공포 테마가 "드라마")는 여기서 못 고친다
// → 관리자 화면에서 직접 고친다.
// ─────────────────────────────────────────────────────────────

const RAW_TO_GENRE: Record<string, Genre> = {
  호러: "공포",
  잠입: "스릴러", 범죄: "스릴러", 탈옥: "스릴러", 서스펜스: "스릴러", 수사: "스릴러", 탈취: "스릴러",
  탐문: "추리", 문제방: "추리", 미스터리: "추리",
  미션: "아케이드", 타임어택: "아케이드", 대결: "아케이드",
  드라마: "감성", 일상드라마: "감성", 일상: "감성", 실화: "감성", 로맨스: "감성", 힐링: "감성", 사극: "감성", 역사: "감성",
  병맛: "코믹", 머니머니: "코믹",
  동화: "판타지", 요정: "판타지", 설화: "판타지", 큐트: "판타지", 고양이: "판타지", 환상: "판타지",
  어드벤처: "모험", 어드벤쳐: "모험", 여행: "모험", 히어로: "모험",
  시간: "SF",
};

// 뭉뚱그린 장르: 태그를 먼저 본다. 값은 태그로도 못 정했을 때의 기본값.
const VAGUE: Record<string, Genre> = { 기타: "기타", 스토리: "감성", 탈출: "기타", "-": "기타", "": "기타" };

// 태그로 장르를 정할 때의 순서(앞이 우선). 무서운 방을 놓치지 않도록 공포가 먼저.
const TAG_RULES: [Genre, string[]][] = [
  ["공포", ["공포", "호러", "무서움"]],
  ["스릴러", ["스릴러", "잠입", "범죄", "탈옥", "탈취"]],
  ["아케이드", ["아케이드", "미션", "타임어택"]],
  ["판타지", ["판타지", "동화", "큐트"]],
  ["코믹", ["코믹"]],
  ["감성", ["감성", "힐링", "드라마", "로맨스"]],
  ["모험", ["모험", "어드벤처"]],
  ["SF", ["SF"]],
  ["추리", ["추리", "미스터리", "수사"]],
];

const key = (s: string) => s.trim().replace(/\s*\(.*\)$/, "").toUpperCase();

export function normalizeGenre(raw: string | null | undefined, tags: string[] | null | undefined): Genre {
  const k = key(typeof raw === "string" ? raw : "");
  const own = GENRES.find((g) => key(g) === k);
  if (own && own !== "기타") return own;
  if (k in RAW_TO_GENRE) return RAW_TO_GENRE[k];
  const fallback = VAGUE[k] ?? "기타";
  const tagKeys = new Set((tags ?? []).map(key));
  for (const [genre, words] of TAG_RULES) {
    if (words.some((w) => tagKeys.has(key(w)))) return genre;
  }
  return fallback;
}
