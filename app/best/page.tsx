import type { Metadata } from "next";
import Link from "next/link";
import { listedConditions } from "@/lib/best";
import { getAllThemes } from "@/lib/catalog-server";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "조건별 방탈출 추천 — 안 무서운·입문·2인·단체",
  description:
    "안 무서운 방탈출, 초보 입문, 2인 데이트, 단체 5인 이상, 공포, 고난도까지. 조건에 맞는 방탈출 테마만 골라 지역별로 정리했어요.",
  alternates: { canonical: "/best" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: `조건별 방탈출 추천 | ${SITE_NAME}`,
    description: "안 무서운·입문·2인·단체·공포·고난도 방탈출을 조건별로.",
    url: `${SITE_URL}/best`,
  },
};

export default async function BestIndexPage() {
  const list = listedConditions(await getAllThemes());

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-[22px] font-extrabold leading-tight">
          조건별 방탈출 추천
        </h1>
        <p className="text-sm text-cream/60">
          누구랑, 얼마나 무섭게, 얼마나 어렵게? 조건을 고르면 맞는 테마만
          지역별로 보여 줘요.
        </p>
      </header>

      {list.length === 0 ? (
        <p className="rounded-[14px] bg-ink py-10 text-center text-sm text-cream/60">
          아직 정리된 목록이 없어요
        </p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {list.map(({ condition: c, count }) => (
            <li key={c.slug}>
              <Link
                href={`/best/${c.slug}`}
                className="group block py-3.5"
              >
                <span className="flex items-baseline justify-between gap-3 text-[15px] font-extrabold">
                  <span className="group-hover:underline">{c.title}</span>
                  <span className="shrink-0 text-[13px] font-normal text-cream/60">테마 {count}개</span>
                </span>
                <span className="mt-0.5 block text-[13px] font-normal text-cream/60">{c.criteria}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
