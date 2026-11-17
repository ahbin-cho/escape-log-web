import Link from "next/link";
import Poster from "@/components/Poster";
import { getAllThemes } from "@/lib/catalog-server";
import { getPublicFeed } from "@/lib/store";
import { publicClient } from "@/lib/supabase/public";
import { rankHot } from "@/lib/hot";
import { posterSrc } from "@/lib/ui";

// "요즘 많이 다녀온 방": 공개 후기를 테마별로 센 순위(홈·모두의 후기 위쪽). 사진 없이 포스터와 숫자만.
// 서버 컴포넌트라 HTML 에 그대로 실린다. 순위가 3개도 안 되면 아무것도 그리지 않는다.
export default async function HotThemes() {
  let rows: ReturnType<typeof rankHot>["rows"] = [];
  let recent = true;
  try {
    const [reviews, themes] = await Promise.all([getPublicFeed(500, publicClient()), getAllThemes()]);
    ({ rows, recent } = rankHot(reviews, themes, new Date()));
  } catch {
    rows = [];
  }
  if (rows.length < 3) return null;

  return (
    <section className="space-y-3" aria-labelledby="hot-themes">
      <div>
        <h2 id="hot-themes" className="text-xl">
          🔥 {recent ? "요즘 많이 다녀온 방" : "많이 다녀온 방"}
        </h2>
        <p className="mt-0.5 text-[13px] text-cream/60">
          {recent ? "최근 30일 동안" : "지금까지"} 탈깍노트에 기록이 많이 쌓인 순서예요.
        </p>
      </div>
      <ol className="divide-y divide-line rounded-xl border-2 border-edge bg-panel px-3 shadow-cute">
        {rows.map((r, i) => {
          const body = (
            <>
              <span className="w-6 shrink-0 font-display text-[22px] text-[#D9772B]">{i + 1}</span>
              <span className="block w-11 shrink-0">
                <Poster src={posterSrc(r.theme?.poster_url)} name={r.name} genre={r.theme?.genre} rounded="rounded-md" compact />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold">{r.name}</span>
                <span className="block truncate text-xs text-cream/60">{r.cafe}</span>
                <span className="block text-xs text-cream/60">탈출 성공 {r.successRate}%</span>
              </span>
              <span className="shrink-0 text-sm font-extrabold text-[#D9772B]">{r.count}명</span>
            </>
          );
          return (
            <li key={r.key}>
              {r.theme ? (
                <Link href={`/theme/${r.theme.id}?from=hot`} className="flex items-center gap-3 py-2.5">
                  {body}
                </Link>
              ) : (
                <div className="flex items-center gap-3 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
