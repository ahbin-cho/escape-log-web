// 홈 상단 배너. 내용을 바꾸려면 이 배열만 고치고 재배포.
// 매장 홍보처럼 대가를 받는 배너는 ad: true 로 두면 "광고" 표시가 붙는다(표시 의무).
// 취향 찾기·친구 궁합처럼 홈의 다른 버튼과 겹치는 내부 메뉴는 넣지 않는다.
export type Banner = {
  id: string;
  art: string; // public/ 아래 일러스트 경로(배경 투명 PNG)
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "candy" | "grape" | "mint";
  ad?: boolean;
};

export const BANNERS: Banner[] = [
  {
    id: "region-seoul",
    art: "/footprint.png",
    title: "서울 방탈출, 한 페이지에",
    body: "강남·홍대·건대 매장 테마를 브랜드별로 모았어요.",
    cta: "서울 테마 보기",
    href: "/region/서울",
    tone: "candy",
  },
  {
    id: "brands",
    art: "/house.png",
    title: "브랜드별 전 지점 테마",
    body: "키이스케이프, 제로월드, 지구별… 지점별 난이도까지 비교.",
    cta: "브랜드 고르기",
    href: "/cafe",
    tone: "grape",
  },
];
