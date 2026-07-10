import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";

// 로그인 유틸리티 페이지 → 색인 제외
export const metadata: Metadata = {
  title: "로그인",
  ...NOINDEX,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
