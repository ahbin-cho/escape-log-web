import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "모두의 후기 — 방탈출 후기·인생테마 모음",
  description:
    "방탈러들이 공개한 방탈출 후기 모음. 어떤 테마가 인생테마인지 실제 후기로 확인해요. 탈출 성공 여부·남은 시간·힌트 수·별점까지 한눈에 볼 수 있어요.",
  alternates: { canonical: "/feed" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "모두의 방탈출 후기 | 방탈깍노트",
    description: "방탈러들의 생생한 방탈출 후기 모음.",
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
