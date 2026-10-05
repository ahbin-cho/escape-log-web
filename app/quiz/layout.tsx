import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "방탈출 취향 찾기",
  description:
    "질문에 답하면 나의 방탈출 유형을 진단하고, 딱 맞는 테마를 추천받아요. 내 방탈 유형은?",
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "내 방탈출 취향은? | 방탈로그",
    description: "질문 몇 개로 방탈 유형 진단 + 맞춤 테마 추천.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
