import Link from "next/link";
import { getAllThemes, popularThemes } from "@/lib/catalog-server";
import { cleanTeaser, dailyMystery, freshPicks, teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";
import { PosterCard, PosterRow } from "@/components/HomeSpotlight";

// 홈의 "궁금증" 영역(서버 컴포넌트, 검색엔진 HTML 에도 실림).
// - 새로 들어온 테마: 최신 등록 묶음에서 브랜드를 섞어 고른 포스터 줄
// - 이번 주 많이 찾는 방: 실제 예약 페이지 이동 집계(적으면 숨김)
// - 오늘의 미스터리 방: 줄거리만 보여 주고 이름은 가려 둔다

const HOT_MIN_THEMES = 3; // 클릭이 2회 이상인 테마가 이만큼은 있어야 "인기" 영역을 보여 줌

export async function HomeMystery() {
  const t = dailyMystery(await getAllThemes(), new Date());
  if (!t) return null;
  const region = regionFromText(t.cafe);

  // 한 줄로 접어 두고, 누르면 정체가 열린다(자바스크립트 없이 동작)
  return (
    <section aria-labelledby="home-mystery">
      <h2 id="home-mystery" className="mb-3 text-[18px]">
        오늘의 미스터리 방
      </h2>
      <details className="group rounded-[14px] border border-line px-4 py-3.5">
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-cream/70">
              {t.genre}
              {region ? ` · ${region}` : ""} · 줄거리만 보고 맞혀 보기
            </span>
            <span className="mt-1 line-clamp-2 text-sm leading-relaxed [word-break:keep-all]">
              “{teaserPreview(cleanTeaser(t.teaser ?? ""), 80)}”
            </span>
          </span>
          <span className="shrink-0 rounded-xl border border-line px-3 py-2 text-[13px] font-extrabold group-open:hidden">
            정체 보기
          </span>
        </summary>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold">{t.name}</p>
            <p className="truncate text-xs text-cream/70">
              {t.cafe} · 난이도 {t.difficulty}/5 · 공포 {t.fear_level}/5
            </p>
          </div>
          <Link href={`/theme/${t.id}?from=home`} className="shrink-0 text-[13px] font-extrabold text-candy">
            자세히 ›
          </Link>
        </div>
      </details>
    </section>
  );
}

export async function HomeNewAndHot() {
  const [themes, hot] = await Promise.all([getAllThemes(), popularThemes(7, 10)]);
  const byId = new Map(themes.map((t) => [t.id, t]));

  const hotList = hot
    .filter((h) => h.clicks >= 2 && byId.has(h.themeId))
    .slice(0, 5)
    .map((h) => ({ theme: byId.get(h.themeId)!, clicks: h.clicks }));
  const showHot = hotList.length >= HOT_MIN_THEMES;

  const fresh = freshPicks(themes, 8);

  if (!showHot && fresh.length === 0) return null;

  return (
    <>
      {fresh.length > 0 && (
        <section aria-labelledby="home-new">
          <h2 id="home-new" className="mb-3 text-[18px]">
            새로 들어온 테마
          </h2>
          <PosterRow>
            {fresh.map((t) => (
              <PosterCard
                key={t.id}
                href={`/theme/${t.id}?from=home`}
                src={t.poster_url}
                name={t.name}
                genre={t.genre}
                sub={t.cafe}
              />
            ))}
          </PosterRow>
        </section>
      )}

      {showHot && (
        <section aria-labelledby="home-hot">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h2 id="home-hot" className="text-[18px]">
              이번 주 많이 찾는 방
            </h2>
            <span className="text-xs text-cream/70">최근 7일 예약 페이지 이동 기준</span>
          </div>
          <ol className="divide-y divide-line">
            {hotList.map(({ theme: t, clicks }, i) => (
              <li key={t.id}>
                <Link href={`/theme/${t.id}?from=home`} className="flex items-center gap-3 py-3">
                  <span
                    className={`w-5 shrink-0 text-center text-[15px] font-extrabold tabular-nums ${
                      i === 0 ? "text-candy" : "text-cream/70"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-extrabold">{t.name}</span>
                    <span className="block truncate text-xs text-cream/70">
                      {t.cafe} · {t.genre}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-cream/70">{clicks}회</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
