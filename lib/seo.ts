import type { ThemeRow } from "./catalog-server";
import { brandOf } from "./cafe";

// 검색(SEO)·답변 엔진(AEO)·생성형 검색(GEO)용 구조화 데이터와 문답. 순수 함수(테스트 대상).
// 원칙: 우리 DB 에 실제로 있는 값만 쓴다. 공포도 1 은 '모름'의 기본값일 수 있어 "안 무섭다"고 단정하지 않는다.

export type Faq = { q: string; a: string };

const top = (counts: Map<string, number>, n: number) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, n);

function countBy<T>(list: T[], key: (x: T) => string | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of list) {
    const k = key(x);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

const genreLine = (themes: ThemeRow[]) =>
  top(countBy(themes, (t) => (t.genre === "기타" ? null : t.genre)), 3)
    .map(([g, n]) => `${g} ${n}개`)
    .join(", ");

/** "2~6", "2~6명", "1" → [최소, 최대] */
export function parsePlayers(players: string | null | undefined): [number, number] | null {
  const m = (players ?? "").match(/(\d+)\s*(?:[~\-–]\s*(\d+))?/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return a > 0 && b >= a && b <= 20 ? [a, b] : null;
}

/** 테마 한 개를 가리키는 구조화 데이터(schema.org Game). 값이 없는 칸은 넣지 않는다. */
export function themeEntityLd(
  t: ThemeRow,
  o: { url: string; genre?: string; region?: string | null; image?: string | null; description?: string }
): Record<string, unknown> {
  const players = parsePlayers(t.players);
  const genre = o.genre ?? t.genre;
  return {
    "@context": "https://schema.org",
    "@type": "Game",
    name: t.name,
    url: o.url,
    inLanguage: "ko",
    ...(o.description ? { description: o.description } : {}),
    ...(genre && genre !== "기타" ? { genre: `${genre} 방탈출` } : {}),
    ...(o.image ? { image: o.image } : {}),
    ...(players ? { numberOfPlayers: { "@type": "QuantitativeValue", minValue: players[0], maxValue: players[1] } } : {}),
    ...(t.time_limit ? { timeRequired: `PT${t.time_limit}M` } : {}),
    gameLocation: {
      "@type": "EntertainmentBusiness",
      name: t.cafe,
      ...(o.region ? { address: { "@type": "PostalAddress", addressRegion: o.region, addressCountry: "KR" } } : {}),
    },
  };
}

/** 지역 페이지 문답: "서울 방탈출 몇 개?" 같은 질문에 숫자로 바로 답한다 */
export function regionFaq(region: string, themes: ThemeRow[]): Faq[] {
  if (!themes.length) return [];
  const brands = countBy(themes, (t) => brandOf(t.cafe) || null);
  const brandTop = top(brands, 4).map(([b, n]) => `${b}(${n}개)`).join(", ");
  const horror = themes.filter((t) => t.genre === "공포").length;
  const easy = themes.filter((t) => t.difficulty > 0 && t.difficulty <= 2).length;
  const big = themes.filter((t) => (parsePlayers(t.players)?.[1] ?? 0) >= 6).length;
  const out: Faq[] = [
    {
      q: `${region}에 방탈출 테마가 몇 개 있나요?`,
      a: `방탈깍노트에 정리된 ${region} 방탈출 테마는 ${themes.length}개이고, 브랜드는 ${brands.size}곳이에요. 테마가 많은 곳은 ${brandTop}예요.`,
    },
  ];
  const g = genreLine(themes);
  if (g)
    out.push({
      q: `${region} 방탈출은 어떤 장르가 많나요?`,
      a: `장르가 적힌 테마 기준으로 ${g} 순이에요.${g.includes("공포") ? "" : ` 공포 장르는 ${horror}개예요.`}`,
    });
  if (easy >= 3)
    out.push({
      q: `${region}에서 처음 가기 좋은 방탈출이 있나요?`,
      a: `난이도 2/5 이하로 표기된 테마가 ${easy}개 있어요. 표에서 난이도를 보고 고르고, 예약 전에 매장 공식 페이지에서 인원과 시간을 확인하세요.`,
    });
  if (big >= 3)
    out.push({
      q: `${region}에서 여럿이(5~6명) 갈 수 있는 방탈출은요?`,
      a: `최대 6명 이상으로 표기된 테마가 ${big}개 있어요. 인원 정보가 없는 테마는 세지 않았어요.`,
    });
  return out;
}

/** 브랜드 페이지 문답 */
export function brandFaq(brand: string, themes: ThemeRow[]): Faq[] {
  if (!themes.length) return [];
  const cafes = [...new Set(themes.map((t) => t.cafe))];
  const out: Faq[] = [
    {
      q: `${brand} 방탈출 테마는 몇 개인가요?`,
      a: `방탈깍노트에 정리된 ${brand} 테마는 ${themes.length}개, 지점은 ${cafes.length}곳이에요(${cafes.slice(0, 5).join(", ")}${cafes.length > 5 ? " 등" : ""}).`,
    },
  ];
  const g = genreLine(themes);
  if (g) out.push({ q: `${brand}는 어떤 장르가 많나요?`, a: `장르가 적힌 테마 기준으로 ${g} 순이에요.` });
  // "키이스케이프 예매 오픈 시간" 같은 검색(Bing 키워드 리포트 2026-11-27)에 답하도록 지점별 예약 오픈 규칙을 모은다
  const rules = cafes
    .map((c) => [c, themes.find((t) => t.cafe === c && t.booking_open?.trim())?.booking_open?.trim() ?? ""] as const)
    .filter(([, r]) => r);
  if (rules.length)
    out.push({
      q: `${brand} 예약은 언제 열리나요? (예약 오픈 시간)`,
      a: `지점마다 달라요. ${rules
        .slice(0, 6)
        .map(([c, r]) => `${c.replace(brand, "").trim() || c} ${r}`)
        .join(" · ")}${rules.length > 6 ? " 등" : ""}. 매장 공지 기준이라 바뀔 수 있어요. 테마 페이지에서 날짜별로 언제 열리는지 계산해 보여 줘요.`,
    });
  out.push({
    q: `${brand} 예약은 어디서 하나요?`,
    a: `테마를 누르면 매장 공식 예약 페이지로 가는 링크가 있어요. 가격·예약 가능 시간은 매장 공식 페이지 기준이 정확해요.`,
  });
  return out;
}

export function faqLd(faq: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
}

// 검색 결과 요약이 너무 짧으면(Bing 웹마스터 "Meta descriptions ... too short", 2026-11-27) 뒤에 안내 문장을 붙인다.
export const MIN_DESCRIPTION = 90;
export function padDescription(desc: string, tail: string, min = MIN_DESCRIPTION): string {
  const d = desc.trim();
  return d.length >= min ? d : `${d.replace(/[.\s]*$/, ".")} ${tail}`.trim();
}

// 제목이 너무 짧으면(같은 경고의 "page titles are too short") 뒤에 설명을 붙인다. 사이트 이름 꼬리표는 따로 붙는다.
export const MIN_TITLE = 28;
export function padTitle(title: string, tail: string, min = MIN_TITLE): string {
  return title.length >= min ? title : `${title} ${tail}`;
}
