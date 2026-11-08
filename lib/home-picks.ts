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
    const teaser = (t.teaser ?? "").trim();
    return teaser.length >= 40 && !teaser.includes(t.name.trim());
  });
}

// 오늘의 미스터리 방: 같은 날엔 모두에게 같은 방, 날이 바뀌면 다른 방
export function dailyMystery(themes: ThemeRow[], now: Date): ThemeRow | null {
  const list = mysteryCandidates(themes).sort((a, b) => a.id.localeCompare(b.id));
  if (!list.length) return null;
  return list[hash(kstDate(now)) % list.length];
}

// 새로 들어온 테마: 등록 최신순. 같은 시각에 한꺼번에 들어간 묶음은 브랜드가 섞이게.
export function newestThemes(themes: ThemeRow[], limit: number): ThemeRow[] {
  return [...themes]
    .filter((t) => t.created_at)
    .sort(
      (a, b) =>
        (b.created_at ?? "").localeCompare(a.created_at ?? "") || a.id.localeCompare(b.id)
    )
    .slice(0, limit);
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
