import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "모두의 후기",
  description:
    "방탈러들이 공개한 방탈출 후기 모음. 어떤 테마가 인생테마인지 실제 후기로 확인해요.",
  alternates: { canonical: "/feed" },
  openGraph: {
    title: "모두의 방탈출 후기 | 방탈로그",
    description: "방탈러들의 생생한 방탈출 후기 모음.",
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
