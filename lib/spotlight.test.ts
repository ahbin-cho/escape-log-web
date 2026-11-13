import { describe, expect, it } from "vitest";
import { activeSpotlights, factsToText, faqToText, parseFacts, parseFaq, spotlightFromRow, SPOTLIGHTS } from "./spotlight";

describe("화제의 방", () => {
  it("여러 줄 입력을 목록으로, 다시 글로", () => {
    const facts = parseFacts("위치 | 서울 마포구 | 홍대 정문 앞\n요금 | 1인 29,000원\n빈 줄 |\n");
    expect(facts).toEqual([
      { label: "위치", value: "서울 마포구", note: "홍대 정문 앞" },
      { label: "요금", value: "1인 29,000원" },
    ]);
    expect(parseFacts(factsToText(facts))).toEqual(facts);
    const faq = parseFaq("몇 명부터? | 2명부터 | 최대 6명");
    expect(faq).toEqual([{ q: "몇 명부터?", a: "2명부터 | 최대 6명" }]);
    expect(parseFaq(faqToText(faq))).toEqual(faq);
  });

  it("DB 행을 읽고, 빈 검색 제목은 이름으로 채운다", () => {
    const s = spotlightFromRow({
      slug: "x-y", label: "신규", name: "어느 매장", title: "제목", lead: "소개", seo_title: "", seo_description: "",
      cafe_includes: "어느 매장", facts: [{ label: "요금", value: "1만원" }, { label: "", value: "x" }], faq: "깨진 값",
      source_name: "", source_url: "", checked_at: "2026-11-13", until: "2026-12-01",
    });
    expect(s.seoTitle).toBe("어느 매장 테마·예약·가격·인원 정리");
    expect(s.seoDescription).toBe("소개");
    expect(s.facts).toHaveLength(1);
    expect(s.faq).toEqual([]);
  });

  it("노출 기간이 지난 것은 홈에서 빠진다", () => {
    expect(activeSpotlights(SPOTLIGHTS, "2026-11-13").length).toBe(1);
    expect(activeSpotlights(SPOTLIGHTS, "2027-01-01").length).toBe(0);
  });
});
