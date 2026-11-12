import { describe, expect, it } from "vitest";
import { emptyRecord, type EscapeRecord } from "./store";
import { typeFromRecords, TYPE_MIN_RECORDS } from "./record-type";

const r = (p: Partial<EscapeRecord>): EscapeRecord => ({ ...emptyRecord(), themeName: "t", ...p });

describe("기록으로 보는 유형", () => {
  it("기록이 모자라면 유형을 말하지 않는다", () => {
    expect(typeFromRecords([r({}), r({})])).toBeNull();
    expect(TYPE_MIN_RECORDS).toBe(3);
  });

  it("공포를 좋게 많이 했고 노힌트가 많으면 '침착한 퇴마사'(thrill-analyze)", () => {
    const t = typeFromRecords([
      r({ genre: "공포", rating: 5, success: true, hintCount: 0 }),
      r({ genre: "공포", rating: 4, success: true, hintCount: 0 }),
      r({ genre: "추리", rating: 3, success: true, hintCount: 2 }),
    ])!;
    expect(t.typeId).toBe("thrill-analyze");
    expect(t.evidence[0]).toContain("3방 중 2방");
    expect(t.evidence.join(" ")).toContain("노힌트 탈출이 2번");
  });

  it("별점이 낮은 장르는 덜 센다(많이 했어도 싫었으면 그 유형이 아니다)", () => {
    const t = typeFromRecords([
      r({ genre: "공포", rating: 1 }),
      r({ genre: "공포", rating: 2 }),
      r({ genre: "감성", rating: 5 }),
    ])!;
    expect(t.draw).toBe("story");
  });

  it("여럿이 다니면 team, 후기를 꼬박꼬박 남기면 savor", () => {
    const team = typeFromRecords([
      r({ genre: "모험", rating: 4, partySize: 5, hintCount: 1 }),
      r({ genre: "SF", rating: 4, partySize: 6, hintCount: 1 }),
      r({ genre: "판타지", rating: 3, partySize: 4, hintCount: 2 }),
    ])!;
    expect(team.typeId).toBe("explore-team");
    const savor = typeFromRecords([
      r({ genre: "감성", rating: 5, oneLiner: "울었다", hintCount: 1, partySize: 2 }),
      r({ genre: "감성", rating: 4, memo: "엔딩", hintCount: 2, partySize: 2 }),
      r({ genre: "코믹", rating: 4, oneLiner: "웃김", hintCount: 1, partySize: 2 }),
    ])!;
    expect(savor.typeId).toBe("story-savor");
  });

  it("시간을 많이 남기거나 힌트를 팍팍 쓰면 rush", () => {
    const t = typeFromRecords([
      r({ genre: "추리", rating: 4, success: true, hintCount: 3, remainingTime: "20분 3초" }),
      r({ genre: "추리", rating: 4, success: true, hintCount: 4, remainingTime: "18분" }),
      r({ genre: "아케이드", rating: 3, success: true, hintCount: 3, remainingTime: "2분" }),
    ])!;
    expect(t.typeId).toBe("brain-rush");
  });
});
