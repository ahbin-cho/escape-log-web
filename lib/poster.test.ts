import { describe, expect, it } from "vitest";
import { buildPosterIndex, findPoster } from "./poster";

const rows = [
  { id: "1", name: "행운만물상", cafe: "토끼굴 홍대점", poster_url: "https://a/1.png" },
  { id: "2", name: "파노라마", cafe: "셜록홈즈 뉴안양점", poster_url: "" },
  { id: "3", name: "암살", cafe: "A점", poster_url: "https://a/3.png" },
  { id: "4", name: "암살", cafe: "B점", poster_url: "https://a/4.png" },
];

describe("poster index", () => {
  const idx = buildPosterIndex(rows);
  it("이름+매장으로 찾는다(띄어쓰기 무시)", () => {
    expect(findPoster(idx, "행운 만물상", "토끼굴  홍대점")?.poster).toBe("https://a/1.png");
  });
  it("매장 이름이 달라도 테마 이름이 하나뿐이면 찾는다", () => {
    expect(findPoster(idx, "행운만물상", "토끼굴")?.id).toBe("1");
  });
  it("같은 이름이 여러 매장에 있으면 매장이 맞아야 한다", () => {
    expect(findPoster(idx, "암살", "B점")?.id).toBe("4");
    expect(findPoster(idx, "암살", "모르는 매장")).toBeNull();
  });
  it("없는 테마는 null", () => {
    expect(findPoster(idx, "없는 방", "어디")).toBeNull();
  });
});
