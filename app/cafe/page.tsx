import type { Metadata } from "next";
import Link from "next/link";
import { listedBrands } from "@/lib/catalog-server";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "방탈출 브랜드별 테마 모음",
  description:
    "키이스케이프, 제로월드, 넥스트에디션 등 방탈출 브랜드별로 전 지점 테마를 정리했어요. 브랜드를 골라 지점별 테마와 난이도를 비교해 보세요.",
  alternates: { canonical: "/cafe" },
  openGraph: {
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
        <h1 className="text-xl font-extrabold sm:text-2xl">
          🏠 방탈출 브랜드별 테마
        </h1>
        <p className="text-sm text-cream/70">
          브랜드를 고르면 지점별 테마를 한 번에 볼 수 있어요.
        </p>
      </header>

      {brands.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
          등록된 브랜드가 아직 없어요
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <li key={b.key}>
              <Link
                href={`/cafe/${b.key}`}
                className="flex items-baseline justify-between rounded-2xl border-2 border-edge bg-panel p-4 font-extrabold transition hover:border-candy hover:text-candy"
              >
                {b.key}
                <span className="text-sm font-bold text-cream/50">
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
