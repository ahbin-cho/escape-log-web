import { QUIZ_TYPES } from "./quiz/types";
import type { TypeId } from "./quiz/slots";

// ─────────────────────────────────────────────────────────────
// 매장(브랜드) 월간 리포트 집계. 예약 클릭 원본 행 → 리포트 숫자.
// 제휴 영업 때 "지난 30일 예약 페이지로 N회 보냈고, 이런 손님이었다"를 보여 주는 용도.
// 순수 함수라 화면과 테스트가 같이 쓴다.
// ─────────────────────────────────────────────────────────────

export type ClickRow = {
  theme_name: string;
  cafe: string;
  source: string;
  type_id: string | null;
  created_at: string;
};

export type Share = { key: string; label: string; count: number; percent: number };

export type BrandReport = {
  total: number;
  typed: number; // 유형을 아는 클릭 수
  themes: Share[]; // 테마별 (많은 순)
  branches: Share[]; // 지점(매장명 전체)별
  types: Share[]; // 유형별 (유형 아는 클릭 중 비율)
  sources: Share[]; // 어디서 눌렀나
  weekdays: Share[]; // 요일별 (월~일 순서)
};

// 유형 비율을 보여 줄 최소 표본. 이보다 적으면 비율이 의미 없어서 숨긴다.
export const MIN_TYPED_FOR_SHARE = 10;

const SOURCE_LABEL: Record<string, string> = {
  theme: "테마 상세",
  card: "목록 카드",
  recommend: "취향 맞춤 추천",
  home: "홈",
};

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function shares(
  counts: Map<string, number>,
  base: number,
  labelOf: (k: string) => string = (k) => k
): Share[] {
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: labelOf(key),
      count,
      percent: base ? Math.round((count / base) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "ko"));
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function typeLabel(id: string): string {
  return QUIZ_TYPES[id as TypeId]?.title ?? id;
}

// 한국 시간 기준 요일 (월=0 … 일=6)
function weekdayKst(iso: string): number {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
  return (d.getUTCDay() + 6) % 7;
}

export function buildBrandReport(rows: ClickRow[]): BrandReport {
  const themes = new Map<string, number>();
  const branches = new Map<string, number>();
  const types = new Map<string, number>();
  const sources = new Map<string, number>();
  const days = new Map<string, number>(WEEKDAYS.map((w) => [w, 0]));
  let typed = 0;

  for (const r of rows) {
    bump(themes, r.theme_name);
    bump(branches, r.cafe);
    bump(sources, r.source);
    bump(days, WEEKDAYS[weekdayKst(r.created_at)]);
    if (r.type_id) {
      typed++;
      bump(types, r.type_id);
    }
  }

  const total = rows.length;
  return {
    total,
    typed,
    themes: shares(themes, total),
    branches: shares(branches, total),
    types: typed >= MIN_TYPED_FOR_SHARE ? shares(types, typed, typeLabel) : [],
    sources: shares(sources, total, (k) => SOURCE_LABEL[k] ?? k),
    // 요일은 많은 순이 아니라 월~일 순서로
    weekdays: WEEKDAYS.map((w) => {
      const count = days.get(w) ?? 0;
      return {
        key: w,
        label: w,
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      };
    }),
  };
}

// 매장에 보낼 메일 본문 초안. 숫자만 바꿔 끼운다.
export function reportMessage(brand: string, r: BrandReport, siteName: string): string {
  const top = r.themes.slice(0, 3).map((t) => `${t.label}(${t.count}회)`).join(", ");
  const lines = [
    `안녕하세요, ${brand} 담당자님. 방탈출 취향 추천 서비스 ${siteName}입니다.`,
    "",
    `지난 30일 동안 ${siteName}에서 ${brand} 예약 페이지로 이동한 횟수는 ${r.total}회입니다.`,
  ];
  if (top) lines.push(`가장 많이 찾은 테마는 ${top}입니다.`);
  if (r.types.length) {
    const t = r.types
      .slice(0, 2)
      .map((x) => `'${x.label}' ${x.percent}%`)
      .join(", ");
    lines.push(`취향 진단 결과가 있는 이동 중에서는 ${t} 순으로 많았습니다.`);
  }
  const rec = r.sources.find((s) => s.key === "recommend");
  if (rec && rec.count) {
    lines.push(`이 중 ${rec.count}회는 취향 맞춤 추천을 보고 넘어간 것입니다.`);
  }
  lines.push(
    "",
    "매달 이런 리포트를 무료로 보내 드리고 있습니다. 테마 정보 수정이나 신규 테마 소개가 필요하시면 회신 주세요.",
    "",
    "* 개인을 식별할 수 있는 정보는 수집하지 않으며, 클릭 수와 취향 유형 집계만 제공합니다."
  );
  return lines.join("\n");
}
