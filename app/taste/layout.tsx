import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

// 개인 취향 진단 결과 페이지 → 색인 제외
export const metadata: Metadata = {
  title: "내 방탈출 취향",
  ...NOINDEX,
};

export default function TasteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
