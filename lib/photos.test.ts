import { describe, expect, it } from "vitest";
import { fitSize, normalizePhotos, storagePath, MAX_PHOTOS } from "./photos";

describe("photos", () => {
  it("긴 변만 1600 으로, 작은 건 그대로", () => {
    expect(fitSize(4032, 3024)).toEqual({ w: 1600, h: 1200 });
    expect(fitSize(3024, 4032)).toEqual({ w: 1200, h: 1600 });
    expect(fitSize(800, 600)).toEqual({ w: 800, h: 600 });
  });
  it("대표가 앞, 중복·빈칸 빼고, 최대 장수까지", () => {
    expect(normalizePhotos("a", ["a", "", "b"])).toEqual(["a", "b"]);
    expect(normalizePhotos("", null)).toEqual([]);
    expect(normalizePhotos(null, ["x"])).toEqual(["x"]);
    expect(normalizePhotos("a", ["b", "c", "d", "e", "f"])).toHaveLength(MAX_PHOTOS);
  });
  it("우리 버킷 주소만 경로로", () => {
    expect(storagePath("https://x.supabase.co/storage/v1/object/public/photos/uid/ab.webp")).toBe("uid/ab.webp");
    expect(storagePath("https://x.supabase.co/storage/v1/object/public/posters/p.jpg")).toBeNull();
    expect(storagePath("https://example.com/a.jpg")).toBeNull();
  });
});
