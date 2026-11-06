import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "방탈출 취향 궁합 · 우리 팀 궁합",
  description:
    "친구와 방탈출 취향 궁합을 무료로 확인해보세요. 3~6명 팀 궁합과 다 같이 갈 방 추천까지, 링크 하나만 보내면 바로 결과가 떠요.",
  alternates: { canonical: "/match" },
  openGraph: {
    title: "방탈출 취향 궁합 | 방탈로그",
    description: "우리 팀 방탈출 궁합은 몇 점? 같이 갈 방까지 골라 줄게.",
  },
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
