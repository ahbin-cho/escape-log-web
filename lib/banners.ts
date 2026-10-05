// 홈 상단 배너. 내용을 바꾸려면 이 배열만 고치고 재배포.
// 매장 홍보처럼 대가를 받는 배너는 ad: true 로 두면 "광고" 표시가 붙는다(표시 의무).
export type Banner = {
  id: string;
  emoji: string;
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
    emoji: "📍",
    title: "서울 방탈출, 한 페이지에",
    body: "강남·홍대·건대 매장 테마를 브랜드별로 모았어요.",
    cta: "서울 테마 보기",
    href: "/region/서울",
    tone: "candy",
  },
  {
    id: "brands",
    emoji: "🏠",
    title: "브랜드별 전 지점 테마",
    body: "키이스케이프, 제로월드, 지구별… 지점별 난이도까지 비교.",
    cta: "브랜드 고르기",
    href: "/cafe",
    tone: "grape",
  },
  {
    id: "quiz",
    emoji: "🔮",
    title: "다음 방, 뭐 갈지 모르겠다면",
    body: "질문 몇 개로 취향을 진단하고 딱 맞는 테마를 추천받아요.",
    cta: "취향 찾기",
    href: "/quiz",
    tone: "mint",
  },
  {
    id: "match",
    emoji: "💞",
    title: "같이 갈 친구랑 궁합은?",
    body: "서로의 방탈 취향을 비교하고 둘 다 좋아할 방을 찾아요.",
    cta: "친구 궁합 보기",
    href: "/match",
    tone: "candy",
  },
];
