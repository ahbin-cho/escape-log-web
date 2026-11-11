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

// 지금은 비워 둠(배열이 비면 홈에 배너 영역이 안 그려진다).
// 서울·브랜드 진입은 홈 "지역별 테마" 제목 옆 링크로 옮김.
export const BANNERS: Banner[] = [];
