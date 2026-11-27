import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "방탈출 취향 찾기 — 내 방탈출 유형 진단·맞춤 테마 추천",
  description:
    "질문에 답하면 나의 방탈출 유형을 진단하고, 딱 맞는 테마를 추천받아요. 공포를 얼마나 견디는지, 문제파인지 이야기파인지에 맞춰 전국 방탈출 테마 중에서 골라 드려요.",
  alternates: { canonical: "/quiz" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "내 방탈출 취향은? | 방탈깍노트",
    description: "질문 몇 개로 방탈 유형 진단 + 맞춤 테마 추천.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
