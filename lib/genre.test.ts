import { describe, expect, it } from "vitest";
import { GENRES } from "./store";
import { normalizeGenre } from "./genre";

describe("normalizeGenre", () => {
  it("앱 장르는 그대로 둔다", () => {
    for (const g of GENRES) expect(normalizeGenre(g, [])).toBe(g);
  });

  it.each([
    ["호러", "공포"],
    ["잠입", "스릴러"], ["범죄", "스릴러"], ["탈옥", "스릴러"], ["서스펜스", "스릴러"], ["수사", "스릴러"],
    ["탐문", "추리"], ["문제방", "추리"], ["미스터리", "추리"],
    ["미션", "아케이드"], ["타임어택", "아케이드"], ["대결 (부스형)", "아케이드"],
    ["드라마", "감성"], ["일상드라마", "감성"], ["일상", "감성"], ["실화", "감성"], ["사극", "감성"], ["역사", "감성"],
    ["병맛", "코믹"], ["머니머니", "코믹"],
    ["동화", "판타지"], ["요정", "판타지"], ["설화", "판타지"], ["큐트", "판타지"], ["고양이", "판타지"], ["환상", "판타지"],
    ["어드벤처", "모험"], ["어드벤쳐", "모험"], ["여행", "모험"], ["히어로", "모험"],
    ["시간", "SF"],
  ])("%s → %s", (raw, want) => {
    expect(normalizeGenre(raw, [])).toBe(want);
  });

  it("앞뒤 공백과 대소문자를 무시한다", () => {
    expect(normalizeGenre("  sf ", [])).toBe("SF");
    expect(normalizeGenre(" 스릴러", [])).toBe("스릴러");
  });

  it("뭉뚱그린 장르(기타·스토리·탈출·-·빈 값)는 태그로 정한다", () => {
    expect(normalizeGenre("스토리", ["스토리", "스릴러", "고난도", "무서움"])).toBe("공포");
    expect(normalizeGenre("기타", ["아케이드", "보통"])).toBe("아케이드");
    expect(normalizeGenre("-", ["잠입"])).toBe("스릴러");
    expect(normalizeGenre("", ["판타지"])).toBe("판타지");
    expect(normalizeGenre("탈출", ["미스터리"])).toBe("추리");
  });

  it("태그로도 못 정하면 스토리는 감성, 나머지는 기타", () => {
    expect(normalizeGenre("스토리", ["고난도"])).toBe("감성");
    expect(normalizeGenre("기타", ["보통", "2인추천"])).toBe("기타");
    expect(normalizeGenre("천만 영화", [])).toBe("기타");
  });

  it("장르가 분명하면 태그가 달라도 장르를 따른다", () => {
    expect(normalizeGenre("추리", ["잠입", "스릴러"])).toBe("추리");
    expect(normalizeGenre("드라마", ["공포"])).toBe("감성");
  });

  it("값이 없거나 문자열이 아니어도 죽지 않는다", () => {
    expect(normalizeGenre(null, null)).toBe("기타");
    expect(normalizeGenre(undefined, undefined)).toBe("기타");
  });
});
