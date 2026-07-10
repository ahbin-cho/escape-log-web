import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

// 로그인 후 보는 내 기록 페이지 → 색인 제외
export const metadata: Metadata = {
  title: "내 방탈출 기록",
  ...NOINDEX,
};

export default function RecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
