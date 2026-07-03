import type { EscapeRecord } from "./store";

// ─────────────────────────────────────────────────────────────
// 지역 추론: 매장명(cafeName) 텍스트에서 시/도를 유추.
// store/폼을 건드리지 않고 기존 기록만으로 지역 분포를 계산한다.
// (공공데이터가 부족해 유저 기록 기반으로 분포를 그린다는 전략)
// ─────────────────────────────────────────────────────────────

export type Region =
  | "서울"
  | "경기"
  | "인천"
  | "부산"
  | "대구"
  | "대전"
  | "광주"
  | "울산"
  | "세종"
  | "강원"
  | "충북"
  | "충남"
  | "전북"
  | "전남"
  | "경북"
  | "경남"
  | "제주";

export const REGIONS: Region[] = [
  "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산",
  "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

// 시/도별 대표 지역·상권 키워드 (매장명에 자주 등장하는 것들)
const REGION_KEYWORDS: Record<Region, string[]> = {
  서울: ["서울", "강남", "홍대", "홍익", "연남", "신촌", "건대", "성수", "잠실", "강북", "노원", "종로", "을지로", "명동", "이태원", "신림", "사당", "목동", "왕십리", "수유", "혜화", "대학로", "구로", "영등포"],
  경기: ["경기", "수원", "성남", "분당", "판교", "일산", "고양", "부천", "안양", "평촌", "안산", "용인", "의정부", "김포", "광명", "하남", "화성", "동탄", "남양주", "파주", "시흥"],
  인천: ["인천", "부평", "송도", "구월", "계양", "주안"],
  부산: ["부산", "서면", "해운대", "남포", "광안", "사상", "센텀"],
  대구: ["대구", "동성로", "반월당", "수성"],
  대전: ["대전", "둔산", "유성", "은행동"],
  광주: ["광주", "충장로", "상무", "첨단"],
  울산: ["울산", "삼산", "성남동"],
  세종: ["세종"],
  강원: ["강원", "춘천", "원주", "강릉", "속초"],
  충북: ["충북", "청주", "충주"],
  충남: ["충남", "천안", "아산", "서산"],
  전북: ["전북", "전주", "익산", "군산"],
  전남: ["전남", "여수", "순천", "목포"],
  경북: ["경북", "포항", "경주", "구미", "안동"],
  경남: ["경남", "창원", "김해", "진주", "양산", "거제"],
  제주: ["제주", "서귀포"],
};

// 임의 텍스트(매장명 등)에서 시/도 추론. 카탈로그 등에서도 재사용.
export function regionFromText(text: string): Region | null {
  for (const region of REGIONS) {
    if (REGION_KEYWORDS[region].some((kw) => text.includes(kw))) {
      return region;
    }
  }
  return null;
}

export function inferRegion(record: EscapeRecord): Region | null {
  // 1) 기록에 지역을 직접 선택했으면 그걸 확정으로 사용
  if (record.region && (REGIONS as string[]).includes(record.region)) {
    return record.region as Region;
  }
  // 2) 없으면 매장명·테마명 텍스트에서 키워드로 추측
  return regionFromText(`${record.cafeName} ${record.themeName}`);
}

export interface RegionBucket {
  region: Region | "미분류";
  count: number;
}

export function regionDistribution(records: EscapeRecord[]): RegionBucket[] {
  const counts = new Map<Region | "미분류", number>();
  for (const r of records) {
    const key = inferRegion(r) ?? "미분류";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);
}

export function recordsInRegion(
  records: EscapeRecord[],
  region: Region | "미분류"
): EscapeRecord[] {
  return records.filter((r) => (inferRegion(r) ?? "미분류") === region);
}
