import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "방탈출 취향 궁합",
  description:
    "친구와 방탈출 취향 궁합을 무료로 확인해보세요. 링크 하나만 보내면 바로 결과가 떠요.",
  alternates: { canonical: "/match" },
  openGraph: {
    title: "방탈출 취향 궁합 | 방탈로그",
    description: "우리 방탈출 궁합은 몇 점? 링크 열면 바로 확인.",
  },
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
