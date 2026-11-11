import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { norm, searchThemes, toChosung } from "./search";

const t = (name: string, cafe: string, p: Partial<ThemeRow> = {}): ThemeRow => ({
  id: name, name, cafe, genre: "추리", difficulty: 3, fear_level: 2, tags: null, teaser: null,
  time_limit: null, players: null, reservation_url: null, ...p,
});

const DATA = [
  t("후즈데어", "키이스케이프 후즈데어", { genre: "공포" }),
  t("LOG_IN 1", "키이스케이프 LOG_IN"),
  t("어느 폐가의 기록", "제로월드 강남점", { genre: "공포", tags: ["배우연출"] }),
  t("사라진 마카롱", "몽글이스케이프 연남점", { genre: "감성" }),
  t("은하수 배달부", "비트포비아 서면던전", { genre: "SF" }),
];
const names = (q: string) => searchThemes(DATA, q).map((h) => h.theme.name);

describe("검색 기본", () => {
  it("테마명 일부", () => expect(names("마카롱")).toEqual(["사라진 마카롱"]));
  it("띄어쓰기·대소문자·기호 무시", () => {
    expect(names("log in")).toContain("LOG_IN 1");
    expect(names("어느폐가")).toEqual(["어느 폐가의 기록"]);
    expect(names("어느 폐가의 기록")[0]).toBe("어느 폐가의 기록");
  });
  it("브랜드·지점·동네", () => {
    expect(names("키이스케이프").sort()).toEqual(["LOG_IN 1", "후즈데어"].sort());
    expect(names("강남")).toEqual(["어느 폐가의 기록"]);
    expect(names("서면")).toEqual(["은하수 배달부"]);
  });
  it("시도 이름(매장명에 없어도 지역 판별로)", () => {
    expect(names("부산")).toEqual(["은하수 배달부"]);
  });
  it("장르·태그", () => {
    expect(names("감성")).toEqual(["사라진 마카롱"]);
    expect(names("배우연출")).toEqual(["어느 폐가의 기록"]);
  });
  it("여러 단어는 모두 맞아야", () => {
    expect(names("강남 공포")).toEqual(["어느 폐가의 기록"]);
    expect(names("강남 감성")).toEqual([]);
  });
  it("이름 일치가 매장 일치보다 앞", () => {
    expect(names("후즈데어")[0]).toBe("후즈데어");
  });
  it("빈 검색어는 빈 결과", () => expect(names("   ")).toEqual([]));
});

describe("초성", () => {
  it("초성 변환", () => expect(toChosung("후즈데어 1")).toBe("ㅎㅈㄷㅇ 1"));
  it("초성 검색", () => {
    expect(names("ㅎㅈㄷㅇ")).toEqual(["후즈데어"]);
    expect(names("ㅁㅋㄹ")).toEqual(["사라진 마카롱"]);
  });
  it("norm", () => expect(norm(" LOG_IN-2 ")).toBe("login2"));
});
