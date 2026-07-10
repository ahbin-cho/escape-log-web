import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

// 로그인 후 내 기록 수정 페이지 → 색인 제외
export const metadata: Metadata = {
  title: "기록 수정",
  ...NOINDEX,
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
