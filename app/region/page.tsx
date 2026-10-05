import Link from "next/link";
import RegionExplorer from "@/components/RegionExplorer";
import { listedRegions } from "@/lib/catalog-server";

export default async function RegionPage() {
  const regions = await listedRegions();

  return (
    <div className="space-y-8">
      <RegionExplorer />

      {/* 시·도별 정적 페이지로 가는 링크 (크롤러용 진입 경로) */}
      {regions.length > 0 && (
        <nav className="space-y-3 border-t-2 border-edge/15 pt-6">
          <h2 className="text-lg font-extrabold">📍 시·도별 방탈출 모아보기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {regions.map((r) => (
              <li key={r.key}>
                <Link
                  href={`/region/${r.key}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {r.key} 방탈출 <span className="text-cream/45">{r.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
