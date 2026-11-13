import Link from "next/link";
import { activeSpotlights } from "@/lib/spotlight";
import { spotlightThemes } from "@/lib/spotlight-server";
import { kstDate } from "@/lib/home-picks";

// 홈 "지금 화제인 방": 새로 생겼거나 이슈가 된 매장을 잡지 지면처럼 한 판으로 보여 준다.
// 서버 컴포넌트라 제목·테마 링크가 HTML 에 실려 검색엔진이 따라간다.
// DB 에 테마가 아직 없으면 그 스포트라이트는 건너뛴다.
export default async function HomeSpotlight() {
  const list = activeSpotlights(kstDate(new Date()));
  for (const s of list) {
    const themes = await spotlightThemes(s.cafeIncludes);
    if (themes.length === 0) continue;
    return (
      <section aria-labelledby="home-spotlight" className="overflow-hidden rounded-2xl bg-edge text-ink">
        <div className="px-5 pb-4 pt-5 sm:px-7 sm:pt-7">
          <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] text-candy">
            <span className="h-px w-6 bg-candy" />
            지금 화제인 방 · {s.label}
          </p>
          <h2 id="home-spotlight" className="mt-3 text-2xl leading-snug sm:text-3xl [word-break:keep-all]">
            {s.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65 [word-break:keep-all]">
            <b className="font-extrabold text-ink">{s.name}</b> · {s.lead}
          </p>
        </div>

        <ul className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1 sm:px-7">
          {themes.map((t, i) => (
            <li key={t.id} className="w-[132px] shrink-0 sm:w-[150px]">
              <Link href={`/theme/${t.id}?from=spotlight`} className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-ink/10 ring-1 ring-ink/15">
                  <span className="absolute inset-0 flex items-end p-2.5 text-[13px] font-extrabold leading-tight text-ink/80 [word-break:keep-all]">
                    {t.name}
                  </span>
                  {t.poster_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.poster_url}
                      alt={`${t.name} 포스터`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded bg-edge/85 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="mt-2 block truncate text-[13px] font-extrabold">{t.name}</span>
                <span className="block text-[11px] font-bold text-ink/50">
                  {t.genre} · 난이도 {t.difficulty}/5
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-ink/15 px-5 py-3.5 sm:px-7">
          <span className="text-[11px] font-bold text-ink/45">공식 정보 기준 · {s.checkedAt.replaceAll("-", ".")} 확인</span>
          <Link href={`/spotlight/${s.slug}`} className="text-sm font-extrabold text-candy">
            인원·요금·예약 정리 보기 →
          </Link>
        </div>
      </section>
    );
  }
  return null;
}
