// ─────────────────────────────────────────────────────────────
// 화제의 방(스포트라이트): 새로 생겼거나 이슈가 된 매장·테마를 홈과 정리 페이지에 올린다.
// 내용은 DB(spotlights 표)에 있고 관리자 화면(/admin/spotlights)에서 넣고 고친다.
// 아래 SPOTLIGHTS 는 표가 아직 없거나 못 읽을 때만 쓰는 예비 목록이다.
// 사실 정보는 공식 사이트·공지에서 확인한 것만 적고, 출처와 확인한 날짜를 남긴다.
// 테마 목록은 DB(catalog)에서 매장 이름(cafeIncludes)으로 찾아 붙인다(DB 에 없으면 홈에는 안 나온다).
// ─────────────────────────────────────────────────────────────

export type Spotlight = {
  slug: string;
  label: string; // 홈 꼬리표(예: "신규 오픈")
  name: string; // 매장·기획 이름
  title: string; // 홈·페이지 제목(질문·후킹)
  lead: string; // 한두 문장 소개
  seoTitle: string;
  seoDescription: string;
  cafeIncludes: string; // catalog.cafe 에 이 글자가 들어간 테마를 묶는다
  facts: { label: string; value: string; note?: string }[];
  faq: { q: string; a: string }[];
  source: { name: string; url: string };
  checkedAt: string; // YYYY-MM-DD (정보를 확인한 날)
  until: string; // 이 날짜까지 홈에 노출(YYYY-MM-DD)
};

export const SPOTLIGHTS: Spotlight[] = [
  {
    slug: "maplestory-escape",
    label: "신규 오픈",
    name: "메이플스토리 이스케이프",
    title: "결말이 비어 있는 책 다섯 권이 발견됐다",
    lead: "홍대에 메이플스토리 방탈출 카페가 생겼어요. 차원의 도서관에서 책 속 용사가 되어 '차원의 조각'을 찾아 빈 결말을 채우는 이야기로, 테마는 다섯 개예요.",
    seoTitle: "메이플스토리 방탈출 '메이플스토리 이스케이프' 테마 5개·예약·가격·인원 정리",
    seoDescription:
      "홍대 메이플스토리 이스케이프 방탈출 테마 5개(커닝시티·무릉도장·헌티드 맨션·에델슈타인·루디브리엄)의 장르, 난이도, 공포도, 최소 인원, 요금, YES24 예약 방법을 공식 정보 기준으로 정리했어요.",
    cafeIncludes: "메이플스토리 이스케이프",
    facts: [
      { label: "위치", value: "서울 마포구 와우산로 90", note: "홍익대 정문 앞" },
      { label: "플레이 시간", value: "테마마다 60분" },
      { label: "인원", value: "커닝시티 2~6명 · 나머지 3~6명", note: "2026년 10월 19일부터 최소 인원이 바뀌었어요" },
      { label: "요금", value: "1인 29,000원" },
      { label: "예약", value: "YES24 티켓", note: "매주 월요일 오전 10시에 열려요" },
      { label: "운영 기간", value: "2028년 9월 20일까지", note: "약 2년 상설" },
      { label: "주의", value: "폐쇄공포증·노약자 입장 제한" },
    ],
    faq: [
      {
        q: "메이플스토리 이스케이프는 몇 명부터 할 수 있나요?",
        a: "'커닝시티, 사라진 사람들'은 2명부터, 나머지 네 테마는 3명부터 할 수 있어요(최대 6명). 2026년 10월 19일부터 바뀐 기준이에요.",
      },
      {
        q: "예약은 어디서 하나요?",
        a: "YES24 티켓에서 예매해요. 정기 예약은 매주 월요일 오전 10시에 열려요.",
      },
      {
        q: "무서운가요?",
        a: "공식 공포도는 커닝시티와 헌티드 맨션이 5단계 중 2, 무릉도장·에델슈타인·루디브리엄은 공포 요소가 없어요.",
      },
      {
        q: "메이플스토리를 몰라도 할 수 있나요?",
        a: "책 속 세계에 들어가 사건을 해결하는 방탈출이라 게임을 몰라도 진행할 수 있어요. 게임을 아는 분은 익숙한 마을과 인물을 만나는 재미가 더해져요.",
      },
    ],
    source: { name: "메이플스토리 이스케이프 공식 사이트", url: "https://maplestoryescape.com" },
    checkedAt: "2026-11-13",
    until: "2026-12-31",
  },
];

// 홈에 올릴 것(노출 기간이 지나지 않은 것)
export function activeSpotlights(list: Spotlight[], todayKst: string): Spotlight[] {
  return list.filter((s) => s.until >= todayKst);
}

// ── DB 행 ↔ Spotlight ──
export type SpotlightRow = {
  slug: string;
  label: string;
  name: string;
  title: string;
  lead: string;
  seo_title: string;
  seo_description: string;
  cafe_includes: string;
  facts: unknown;
  faq: unknown;
  source_name: string;
  source_url: string;
  checked_at: string;
  until: string;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function spotlightFromRow(r: SpotlightRow): Spotlight {
  const facts = (Array.isArray(r.facts) ? r.facts : [])
    .map((f) => ({ label: str(f?.label), value: str(f?.value), note: str(f?.note) || undefined }))
    .filter((f) => f.label && f.value);
  const faq = (Array.isArray(r.faq) ? r.faq : [])
    .map((f) => ({ q: str(f?.q), a: str(f?.a) }))
    .filter((f) => f.q && f.a);
  return {
    slug: r.slug,
    label: r.label,
    name: r.name,
    title: r.title,
    lead: r.lead,
    seoTitle: r.seo_title || `${r.name} 테마·예약·가격·인원 정리`,
    seoDescription: r.seo_description || r.lead,
    cafeIncludes: r.cafe_includes,
    facts,
    faq,
    source: { name: r.source_name, url: r.source_url },
    checkedAt: r.checked_at,
    until: r.until,
  };
}

// ── 관리자 화면의 여러 줄 입력 ↔ 목록 ("항목 | 내용 | 덧붙임", "질문 | 답") ──
const cut = (line: string) => line.split("|").map((x) => x.trim());

export function parseFacts(text: string): Spotlight["facts"] {
  return text
    .split("\n")
    .map(cut)
    .filter((p) => p[0] && p[1])
    .map(([label, value, note]) => (note ? { label, value, note } : { label, value }));
}
export function factsToText(facts: Spotlight["facts"]): string {
  return facts.map((f) => [f.label, f.value, f.note].filter(Boolean).join(" | ")).join("\n");
}
export function parseFaq(text: string): Spotlight["faq"] {
  return text
    .split("\n")
    .map(cut)
    .filter((p) => p[0] && p[1])
    .map(([q, ...rest]) => ({ q, a: rest.join(" | ") }));
}
export function faqToText(faq: Spotlight["faq"]): string {
  return faq.map((f) => `${f.q} | ${f.a}`).join("\n");
}
