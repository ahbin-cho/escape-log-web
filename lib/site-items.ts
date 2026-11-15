// 관리자 화면(/admin/site)에서 고치는 사이트 문구·목록. Supabase 표 site_items 한 곳에 모은다.
//   kind = "chip"   : 홈 검색창 아래 '많이 찾는' 칩 (+ 검색창 '이렇게 찾아보세요' 는 주소 없는 칩만)
//   kind = "banner" : 홈 상단 배너
// 표가 없거나 비었거나 못 읽으면 코드에 적힌 기본값을 쓴다(사이트가 깨지지 않게).
import type { Banner } from "@/lib/banners";

export type SiteKind = "chip" | "banner";
export const SITE_KINDS: { kind: SiteKind; name: string; help: string }[] = [
  { kind: "chip", name: "많이 찾는 칩", help: "홈 검색창 아래 작은 버튼. 주소를 비우면 그 글자로 검색창이 열려요." },
  { kind: "banner", name: "홈 배너", help: "홈 위쪽 넘겨 보는 큰 카드. 하나도 없으면 배너 자리가 사라져요." },
];

export type SiteItemRow = {
  id: number;
  kind: SiteKind;
  label: string; // 칩 글자 / 배너 제목
  body: string; // 배너 설명
  cta: string; // 배너 버튼 글자
  href: string; // 누르면 갈 사이트 안 주소(/로 시작)
  art: string; // 배너 그림(/로 시작하는 사이트 안 파일)
  tone: string; // 배너 색: candy | grape | mint
  ad: boolean; // 대가를 받은 배너면 true → "광고" 표시
  sort: number;
  active: boolean;
  until: string | null; // 이 날까지만(KST 날짜), 비우면 계속
};

export const SITE_COLS = "id,kind,label,body,cta,href,art,tone,ad,sort,active,until";

/** 사이트 안 경로만 받는다(바깥 주소·자바스크립트 주소 막기) */
export function safePath(v: string | null | undefined): string {
  const s = (v ?? "").trim();
  return s.startsWith("/") && !s.startsWith("//") ? s : "";
}

/** 지금 보여 줄 줄만, 순서대로 */
export function liveItems(rows: SiteItemRow[], kind: SiteKind, today: string): SiteItemRow[] {
  return rows
    .filter((r) => r.kind === kind && r.active && r.label?.trim() && (!r.until || r.until >= today))
    .sort((a, b) => a.sort - b.sort || a.id - b.id);
}

export type Chip = { label: string; href: string };
export function toChips(rows: SiteItemRow[], today: string): Chip[] {
  return liveItems(rows, "chip", today).map((r) => ({ label: r.label.trim(), href: safePath(r.href) }));
}

const TONES = ["candy", "grape", "mint"] as const;
export function toBanners(rows: SiteItemRow[], today: string): Banner[] {
  return liveItems(rows, "banner", today)
    .filter((r) => safePath(r.href) && safePath(r.art))
    .map((r) => ({
      id: String(r.id),
      art: safePath(r.art),
      title: r.label.trim(),
      body: (r.body ?? "").trim(),
      cta: (r.cta ?? "").trim() || "보러 가기",
      href: safePath(r.href),
      tone: (TONES as readonly string[]).includes(r.tone) ? (r.tone as Banner["tone"]) : "candy",
      ad: !!r.ad,
    }));
}
