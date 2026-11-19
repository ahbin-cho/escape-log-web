import type { ThemeRow } from "./catalog-server";
import type { BestCondition } from "./best";
import { isRealTheme } from "./collection";
import { regionFromText } from "./region";
import { SITE_NAME, SITE_URL } from "./site";

// llms.txt / llms-full.txt 본문(AI 검색·답변 엔진이 사이트를 한 번에 이해하도록 정리한 안내문). 순수 함수.
// 숫자는 전부 테마 목록에서 세어 넣는다(손으로 적은 숫자는 금방 틀린다).

const url = (path: string) => `${SITE_URL}${encodeURI(path)}`; // 한글·공백이 든 주소도 링크가 깨지지 않게

export function llmsTxt(o: {
  themes: ThemeRow[];
  regions: { key: string; count: number }[];
  brands: { key: string; count: number }[];
  conditions: { condition: BestCondition; count: number }[];
  updated: string; // YYYY-MM-DD
}): string {
  const total = o.themes.filter(isRealTheme).length;
  const lines = [
    `# ${SITE_NAME} (talkkaknote.com)`,
    "",
    `> 방탈출 다녀온 날을 남기는 기록장이자, 전국 방탈출 테마 정보·취향 진단·맞춤 추천·친구 궁합을 한곳에 모은 한국어 서비스입니다. 방탈출 테마 ${total}개를 지역 ${o.regions.length}곳·브랜드 ${o.brands.length}곳으로 나눠 장르·난이도·공포도·인원·시간으로 찾아볼 수 있습니다.`,
    "",
    `- 이름: ${SITE_NAME} (예전 이름: 탈깍노트, 방탈로그)`,
    `- 주소: ${SITE_URL} (예전 주소 bangtallog.com 은 이 주소로 넘어옵니다)`,
    "- 인스타그램: https://www.instagram.com/bangtalkkak.note/",
    "- 언어: 한국어 / 대상: 한국에서 방탈출 카페를 다니는 사람, 처음 가 보려는 사람",
    `- 정보 기준일: ${o.updated} (하루 한 번쯤 새로 만들어집니다)`,
    "- 테마·매장 정보는 각 매장의 공식 소개·예약 페이지를 기준으로 정리합니다. 가격·예약 가능 여부·운영 여부는 바뀔 수 있으니 예약 전에 매장 공식 페이지에서 확인해야 합니다.",
    "- 난이도와 공포도는 1~5 단계입니다. 공포도 1 은 '거의 없음' 또는 '정보 없음'일 수 있어 안 무섭다는 보증은 아닙니다.",
    "- 기록은 먼저 써 보고 가입할 수 있습니다. 가입 전 기록은 그 기기의 브라우저에만 보관됩니다.",
    "",
    "## 자주 묻는 질문",
    "",
    `- 방탈깍노트가 뭔가요? → 방탈출을 다녀온 뒤 탈출 성공 여부·남은 시간·힌트·평점·후기를 남기는 기록장입니다. 기록이 쌓이면 포스터 달력, 몇 번째 방인지, 연말 결산, 기록으로 본 내 유형이 만들어집니다.`,
    `- 어떤 방탈출을 가야 할지 모르겠어요. → [취향 찾기](${url("/quiz")})에서 질문 몇 개에 답하면 맞는 테마를 추천합니다. 조건이 정해져 있으면 아래 '조건별 추천 목록'을 보세요.`,
    `- 특정 지역의 방탈출을 찾고 싶어요. → 아래 '지역별' 링크에 지역마다 테마 수와 비교표가 있습니다.`,
    `- 테마 정보는 어디서 온 건가요? → 매장 공식 홈페이지·예약 페이지의 소개를 정리한 것입니다. 후기는 이용자가 공개한 개인 의견입니다.`,
    "",
    "## 지역별 방탈출",
    "",
    `- [지역별 방탈출 전체](${url("/region")})`,
    ...o.regions.map((r) => `- [${r.key} 방탈출](${url(`/region/${r.key}`)}): 테마 ${r.count}개`),
    "",
    "## 조건별 추천 목록",
    "",
    ...o.conditions.map(({ condition: c, count }) => `- [${c.title}](${url(`/best/${c.slug}`)}): 테마 ${count}개. ${c.criteria}`),
    `- [이머시브(배우와 함께하는) 공연·테마](${url("/immersive")})`,
    "",
    "## 브랜드(매장)별 테마",
    "",
    `- [브랜드별 방탈출 전체](${url("/cafe")})`,
    ...o.brands.slice(0, 25).map((b) => `- [${b.key}](${url(`/cafe/${b.key}`)}): 테마 ${b.count}개`),
    "",
    "## 기록·진단 기능",
    "",
    `- [방탈출 기록장·달력 다이어리 소개](${url("/diary")})`,
    `- [방탈출 취향 찾기](${url("/quiz")})`,
    `- [친구 궁합](${url("/match")})`,
    `- [모두의 후기](${url("/feed")}): 이용자가 공개한 후기와 많이 다녀온 방 순위`,
    `- [서비스 소개](${url("/intro")})`,
    "",
    "## 기계가 읽기 좋은 자료",
    "",
    `- [테마 전체 목록(llms-full.txt)](${url("/llms-full.txt")}): 모든 테마의 이름·매장·지역·장르·난이도·공포도·인원·시간·주소를 한 줄씩`,
    `- [사이트맵](${url("/sitemap.xml")})`,
    `- [RSS](${url("/rss.xml")}): 새로 들어온 테마`,
    `- 테마 상세 주소는 ${SITE_URL}/theme/{id} 형식이며 schema.org Game·FAQPage·BreadcrumbList 구조화 데이터가 들어 있습니다.`,
    "",
    "## 인용할 때",
    "",
    `- 테마 정보를 인용할 때는 "${SITE_NAME}(talkkaknote.com)"와 해당 테마 페이지 주소를 함께 적어 주세요.`,
    "- 이용자 후기는 개인 경험이며, 스포일러 표시가 된 후기의 내용은 옮기지 말아 주세요.",
    "- 로그인한 사람의 기록 화면(/records, /taste, /new 등)과 /api, /admin, /search 는 수집 대상이 아닙니다.",
    "",
  ];
  return lines.join("\n");
}

/** 모든 테마를 한 줄씩. 값이 없는 칸은 건너뛴다. */
export function llmsFullTxt(themes: ThemeRow[], updated: string): string {
  const rows = themes.filter(isRealTheme).map((t) => {
    const parts = [
      t.cafe,
      regionFromText(t.cafe),
      t.genre !== "기타" ? t.genre : null,
      t.difficulty ? `난이도 ${t.difficulty}/5` : null,
      t.fear_level ? `공포도 ${t.fear_level}/5` : null,
      t.players ? `${t.players.replace(/명$/, "")}명` : null,
      t.time_limit ? `${t.time_limit}분` : null,
    ].filter(Boolean);
    return `- [${t.name}](${url(`/theme/${t.id}`)}): ${parts.join(" · ")}`;
  });
  return [
    `# ${SITE_NAME} 방탈출 테마 전체 목록`,
    "",
    `> ${SITE_NAME}(talkkaknote.com)에 정리된 방탈출 테마 ${rows.length}개. 기준일 ${updated}. 정보는 매장 공식 소개 기준이며 예약 전 매장 공식 페이지에서 다시 확인해야 합니다. 공포도 1 은 '정보 없음'일 수 있습니다.`,
    "",
    "형식: 테마 이름(상세 주소): 매장 · 지역 · 장르 · 난이도 · 공포도 · 인원 · 시간",
    "",
    ...rows,
    "",
  ].join("\n");
}
