import { describe, expect, it } from "vitest";
import { md, openStatus, parseOpenRule, shortRule } from "./booking-open";

// 2026-11-13(금) 한국 시간 15:00 = UTC 06:00
const FRI_3PM = new Date("2026-11-13T06:00:00Z");
// 2026-11-13(금) 한국 시간 09:00
const FRI_9AM = new Date("2026-11-13T00:00:00Z");

describe("parseOpenRule", () => {
  it("여러 표기", () => {
    expect(parseOpenRule("7일 전 자정")).toEqual({ kind: "daily", days: 7, minutes: 0, approx: false });
    expect(parseOpenRule("6일 전")).toEqual({ kind: "daily", days: 6, minutes: null, approx: false });
    expect(parseOpenRule("14일 전 오전 11시 30분")).toMatchObject({ days: 14, minutes: 11 * 60 + 30 });
    expect(parseOpenRule("13일 전 오후 6시")).toMatchObject({ days: 13, minutes: 18 * 60 });
    expect(parseOpenRule("7일 전 밤 10시")).toMatchObject({ days: 7, minutes: 22 * 60 });
    expect(parseOpenRule("14일 전 낮 12시")).toMatchObject({ days: 14, minutes: 12 * 60 });
    expect(parseOpenRule("6일 전 00시")).toMatchObject({ days: 6 });
    expect(parseOpenRule("약 4주 전")).toEqual({ kind: "daily", days: 28, minutes: null, approx: true });
    expect(parseOpenRule("매주 월요일 오전 10시 (다음 주 7일치)")).toEqual({ kind: "weekly", weekday: 1, minutes: 600, span: 7 });
    expect(parseOpenRule("")).toEqual({ kind: "unknown" });
    expect(parseOpenRule("전화 문의")).toEqual({ kind: "unknown" });
  });
});

describe("openStatus", () => {
  it("자정 오픈: 오늘+N 까지, 다음은 오늘 밤 12시", () => {
    const s = openStatus("7일 전 자정", FRI_3PM)!;
    expect(md(s.lastBookable!)).toBe("11/20(금)");
    expect(md(s.next!.date)).toBe("11/21(토)");
    expect(s.next!.when).toBe("오늘 밤 12시");
  });
  it("오후 6시 오픈: 아직 안 열렸으면 하루 덜, 다음은 오늘 오후 6시", () => {
    const s = openStatus("13일 전 오후 6시", FRI_3PM)!;
    expect(md(s.lastBookable!)).toBe("11/25(수)");
    expect(s.next!.when).toBe("오늘 오후 6시");
  });
  it("이미 열린 시각이 지났으면 다음은 내일", () => {
    const s = openStatus("14일 전 오전 11시", FRI_3PM)!;
    expect(md(s.lastBookable!)).toBe("11/27(금)");
    expect(s.next!.when).toBe("내일 오전 11시");
  });
  it("시각 모름: 날짜만 대략", () => {
    const s = openStatus("6일 전", FRI_9AM)!;
    expect(md(s.lastBookable!)).toBe("11/19(목)");
    expect(s.next).toBeNull();
    expect(s.approx).toBe(true);
  });
  it("매주 월요일 오전 10시 다음 주 7일치", () => {
    const s = openStatus("매주 월요일 오전 10시 (다음 주 7일치)", FRI_3PM)!; // 최근 오픈 11/9(월)
    expect(md(s.lastBookable!)).toBe("11/22(일)");
    expect(s.next!.when).toBe("11/16(월) 오전 10시");
  });
  it("몇 달 앞까지 열려 있음", () => {
    expect(parseOpenRule("몇 달 앞까지 열려 있음")).toEqual({ kind: "wide" });
    const s = openStatus("몇 달 앞까지 열려 있음", FRI_3PM)!;
    expect(s.wide).toBe(true);
    expect(s.lastBookable).toBeNull();
    expect(shortRule("몇 달 앞까지 열려 있음")).toBe("예약 넉넉");
  });
  it("규칙이 없으면 null", () => {
    expect(openStatus("", FRI_3PM)).toBeNull();
  });
  it("짧은 글", () => {
    expect(shortRule("7일 전 자정")).toBe("7일 전 오픈");
    expect(shortRule("약 4주 전")).toBe("약 4주 전 오픈");
    expect(shortRule("")).toBe("");
  });
});
