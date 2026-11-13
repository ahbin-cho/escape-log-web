import Link from "next/link";
import RegionExplorer from "@/components/RegionExplorer";
import { CHIP } from "@/lib/ui";
import { listedRegions } from "@/lib/catalog-server";

// DB 에 새 지역이 생기면 배포 없이 1시간 안에 목록에 나타난다.
export const revalidate = 3600;

export default async function RegionPage() {
  const regions = await listedRegions();

  return (
    <div className="space-y-8">
      <RegionExplorer />

      {/* 시·도별 정적 페이지로 가는 링크 (크롤러용 진입 경로) */}
      {regions.length > 0 && (
        <nav className="space-y-3 border-t border-line pt-6">
          <h2 className="text-lg font-extrabold">시·도별 방탈출 모아보기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {regions.map((r) => (
              <li key={r.key}>
                <Link
                  href={`/region/${r.key}`}
                  className={CHIP}
                >
                  {r.key} 방탈출 <span className="text-cream/60">{r.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
