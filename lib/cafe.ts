// 매장명(cafe) = "브랜드 지점" 형태. 첫 단어가 브랜드, 나머지가 지점.
// 클라이언트·서버 양쪽에서 쓰는 순수 함수.
export function brandOf(cafe: string): string {
  return (cafe || "").trim().split(" ")[0];
}

export function branchOf(cafe: string): string {
  return (cafe || "").trim().split(" ").slice(1).join(" ");
}
