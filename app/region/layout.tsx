import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "지역별 방탈출 지도",
  description:
    "지역(시·도)별 방탈출 테마를 한눈에. 내가 다녀온 곳과 가보고 싶은 지역의 추천 테마를 모아봐요.",
  openGraph: {
    title: "지역별 방탈출 지도 | 방탈로그",
    description: "우리 동네 방탈출부터 원정까지, 지역별로 모아보기.",
  },
};

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
