import Link from "next/link";
import { listedConditions } from "@/lib/best";
import { getAllThemes, listedBrands } from "@/lib/catalog-server";
import { Chevron } from "@/components/LoggedOutCTA";

const CHIP =
  "inline-block whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-[13px] font-bold transition active:scale-[0.97]";
const CHIP_ROW = "no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0";

// 홈 "어떤 방 찾아요?": 조건별 추천(/best) · 브랜드(/cafe) · 팀 궁합(/match) 진입.
// 서버 컴포넌트라 링크가 HTML 에 그대로 실려 검색엔진이 따라간다.
export default async function HomeDiscover() {
  const [all, brands] = await Promise.all([getAllThemes(), listedBrands()]);
  const conditions = listedConditions(all);
  const topBrands = brands.slice(0, 12);

  return (
    <section aria-labelledby="home-discover">
      <h2 id="home-discover" className="mb-3 text-[18px]">
        🔍 어떤 방 찾아요?
      </h2>

      {conditions.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-[13px] font-bold text-cream/70">조건으로</h3>
            <Link href="/best" className="text-[13px] text-cream/70">
              전체 ›
            </Link>
          </div>
          <ul className={CHIP_ROW}>
            {conditions.map(({ condition: c, count }) => (
              <li key={c.slug} className="shrink-0">
                <Link href={`/best/${c.slug}`} className={CHIP}>
                  {c.label} <span className="font-medium text-cream/70">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topBrands.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-[13px] font-bold text-cream/70">브랜드로</h3>
            <Link href="/cafe" className="text-[13px] text-cream/70">
              전체 {brands.length}개 ›
            </Link>
          </div>
          <ul className={CHIP_ROW}>
            {topBrands.map((b) => (
              <li key={b.key} className="shrink-0">
                <Link href={`/cafe/${b.key}`} className={CHIP}>
                  {b.key} <span className="font-medium text-cream/70">{b.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/match" className="mt-4 flex items-center gap-3 border-y border-line py-3.5">
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] font-extrabold">여럿이 가요? 우리 팀 궁합부터</b>
          <span className="block text-[13px] text-cream/70 [word-break:keep-all]">
            제일 겁 많은 친구도 들어갈 수 있는 방까지 골라 줘요
          </span>
        </span>
        <Chevron className="text-cream/50" />
      </Link>
    </section>
  );
}
