import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "방탈출 팀 조합 진단",
  description:
    "3~6명이 각자 방탈출 취향을 진단하고 링크 하나에 모으면, 팀 이름과 방 안 역할, 다 같이 갈 방까지 골라 드려요.",
  alternates: { canonical: "/team" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "방탈출 팀 조합 진단 | 방탈로그",
    description: "우리 팀은 어떤 원정대? 방 안 역할이랑 같이 갈 방까지.",
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
