import type { Metadata } from "next";
import Link from "next/link";
import { listedBrands } from "@/lib/catalog-server";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "방탈출 브랜드별 테마 모음",
  description:
    "키이스케이프, 제로월드, 넥스트에디션 등 방탈출 브랜드별로 전 지점 테마를 정리했어요. 브랜드를 골라 지점별 테마와 난이도를 비교해 보세요.",
  alternates: { canonical: "/cafe" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: `방탈출 브랜드별 테마 모음 | ${SITE_NAME}`,
    description: "방탈출 브랜드별 전 지점 테마 정리.",
    url: `${SITE_URL}/cafe`,
  },
};

export default async function CafeIndexPage() {
  const brands = await listedBrands();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-[22px] font-extrabold leading-tight">
          방탈출 브랜드별 테마
        </h1>
        <p className="text-sm text-cream/60">
          브랜드를 고르면 지점별 테마를 한 번에 볼 수 있어요.
        </p>
      </header>

      {brands.length === 0 ? (
        <p className="rounded-[14px] bg-ink py-10 text-center text-sm text-cream/60">
          등록된 브랜드가 아직 없어요
        </p>
      ) : (
        <ul className="border-t border-line sm:columns-2 sm:gap-x-10 lg:columns-3">
          {brands.map((b) => (
            <li key={b.key} className="break-inside-avoid border-b border-line">
              <Link
                href={`/cafe/${b.key}`}
                className="flex items-baseline justify-between py-3.5 text-[15px] font-extrabold hover:underline"
              >
                {b.key}
                <span className="text-[13px] font-normal text-cream/60">
                  테마 {b.count}개
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
