import type { ThemeRow } from "./catalog-server";

// ─────────────────────────────────────────────────────────────
// 홈의 "궁금증" 영역에서 쓰는 고르기 규칙. 순수 함수(테스트 대상).
// ─────────────────────────────────────────────────────────────

// 한국 날짜 "2026-11-08"
export function kstDate(now: Date): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// 줄거리만 보고 맞혀 볼 만한 테마: 줄거리가 충분히 길고, 줄거리에 테마 이름이 안 드러나는 것
export function mysteryCandidates(themes: ThemeRow[]): ThemeRow[] {
  return themes.filter((t) => {
    const teaser = cleanTeaser(t.teaser ?? "");
    return (
      teaser.length >= 40 &&
      !teaser.includes(t.name.trim()) &&
      !/^제작자의\s*한\s*마디/.test(teaser)
    );
  });
}

// 오늘의 미스터리 방: 같은 날엔 모두에게 같은 방, 날이 바뀌면 다른 방
export function dailyMystery(themes: ThemeRow[], now: Date): ThemeRow | null {
  const list = mysteryCandidates(themes).sort((a, b) => a.id.localeCompare(b.id));
  if (!list.length) return null;
  return list[hash(kstDate(now)) % list.length];
}

// 등록 최신순 (RSS 는 이 순서 그대로 쓴다)
export function newestThemes(themes: ThemeRow[], limit: number): ThemeRow[] {
  return [...themes]
    .filter((t) => t.created_at)
    .sort(
      (a, b) =>
        (b.created_at ?? "").localeCompare(a.created_at ?? "") || a.id.localeCompare(b.id)
    )
    .slice(0, limit);
}

const FRESH_POOL_DAYS = 3; // 가장 최근 등록일로부터 이 안에 들어온 묶음에서 고른다

// 홈 "새로 들어온 테마": 최신 묶음에서 지점만 다른 같은 테마는 하나로 줄이고,
// 한 브랜드가 한꺼번에 많이 들어와도 브랜드를 번갈아 뽑아 섞는다.
export function freshPicks(themes: ThemeRow[], limit: number): ThemeRow[] {
  const seen = new Set<string>();
  const unique = newestThemes(themes, themes.length).filter((t) => {
    const key = t.name.replace(/\s+/g, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!unique.length) return [];

  const cutoff = Date.parse(unique[0].created_at!) - FRESH_POOL_DAYS * 86400000;
  const recent = unique.filter((t) => Date.parse(t.created_at!) >= cutoff);
  const pool = recent.length >= limit ? recent : unique;

  const groups = new Map<string, ThemeRow[]>();
  for (const t of pool) {
    const brand = t.cafe.trim().split(" ")[0];
    const list = groups.get(brand);
    if (list) list.push(t);
    else groups.set(brand, [t]);
  }
  const lists = [...groups.values()];
  const out: ThemeRow[] = [];
  for (let i = 0; out.length < limit && lists.some((l) => l.length); i++) {
    const l = lists[i % lists.length];
    if (l.length) out.push(l.shift()!);
  }
  return out;
}

// "3일 전", "어제", "오늘"
export function agoLabel(iso: string, now: Date): string {
  const days = Math.floor(
    (Date.parse(kstDate(now)) - Date.parse(kstDate(new Date(iso)))) / 86400000
  );
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 31) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}달 전`;
}

// 줄거리 미리보기 길이 자르기 (단어 중간에서 자르지 않게)
export function teaserPreview(teaser: string, max = 110): string {
  const t = teaser.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).trim()}…`;
}

// 미리보기용 줄거리: 크롤링 원문에 섞인 예약·이용 안내를 걷어낸다.
// 앞쪽 '장르 - … 난이도 - n/5' 같은 머리말, [대괄호 안내], (인원·예약 안내 괄호),
// *·※·✓ 로 시작하는 주의사항 이후는 버린다.
const NOTICE_PAREN = /\([^)]*(?:추천|문의|예약|필수|이용|결제|\d+\s*인)[^)]*\)/g;

export function cleanTeaser(teaser: string): string {
  const t = teaser
    .replace(/^.{0,40}?난이도\s*[-:]\s*[\d.]+(?:\s*\/\s*5)?/, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(NOTICE_PAREN, " ")
    .split(/[*※✓✔]/)[0];
  return t.replace(/\s+/g, " ").trim();
}
