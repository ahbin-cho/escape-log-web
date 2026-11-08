import Link from "next/link";
import { getAllThemes, popularThemes } from "@/lib/catalog-server";
import { agoLabel, dailyMystery, newestThemes, teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";
import { branchOf, brandOf } from "@/lib/cafe";
import { genreEmoji } from "@/lib/store";

// 홈의 "궁금증" 영역(서버 컴포넌트, 검색엔진 HTML 에도 실림).
// - 오늘의 미스터리 방: 줄거리만 보여 주고 이름은 가려 둔다
// - 이번 주 많이 찾는 방: 실제 예약 페이지 이동 집계(적으면 숨김)
// - 새로 들어온 테마: 카탈로그 등록 최신순

const NEW_DAYS = 14; // 이 기간 안에 들어온 테마에 NEW 표시
const HOT_MIN_THEMES = 3; // 클릭이 2회 이상인 테마가 이만큼은 있어야 "인기" 영역을 보여 줌

export async function HomeMystery() {
  const now = new Date();
  const t = dailyMystery(await getAllThemes(), now);
  if (!t) return null;
  const region = regionFromText(t.cafe);

  return (
    <section
      aria-labelledby="home-mystery"
      className="rough space-y-3 rounded-2xl border-2 border-edge bg-ink p-5 shadow-cute"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="home-mystery" className="text-lg">
          👻 오늘의 미스터리 방
        </h2>
        <span className="text-xs font-bold text-cream/50">매일 자정에 바뀌어요</span>
      </div>

      <p className="text-sm font-bold text-cream/60">이 줄거리, 어느 방일까?</p>
      <blockquote className="border-l-4 border-candy pl-3 text-base leading-relaxed [word-break:keep-all]">
        “{teaserPreview(t.teaser ?? "")}”
      </blockquote>

      <ul className="flex flex-wrap gap-1.5 text-xs font-bold">
        <li className="rounded-full border border-edge/30 bg-panel px-2.5 py-1">
          {genreEmoji(t.genre)} {t.genre}
        </li>
        <li className="rounded-full border border-edge/30 bg-panel px-2.5 py-1">
          🧩 난이도 {t.difficulty}/5
        </li>
        <li className="rounded-full border border-edge/30 bg-panel px-2.5 py-1">
          👻 공포 {t.fear_level}/5
        </li>
        {region && (
          <li className="rounded-full border border-edge/30 bg-panel px-2.5 py-1">
            📍 {region}
          </li>
        )}
      </ul>

      {/* 자바스크립트 없이 열고 닫히는 정체 공개 */}
      <details className="group">
        <summary className="rough inline-flex cursor-pointer list-none items-center gap-1.5 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97] [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">정체 공개 👀</span>
          <span className="hidden group-open:inline">짜잔!</span>
        </summary>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-edge bg-panel p-4">
          <div className="min-w-0">
            <p className="text-lg font-extrabold">{t.name}</p>
            <p className="text-sm text-cream/60">{t.cafe}</p>
          </div>
          <Link
            href={`/theme/${t.id}?from=home`}
            className="shrink-0 text-sm font-extrabold text-candy underline underline-offset-4"
          >
            자세히 보기 →
          </Link>
        </div>
      </details>
    </section>
  );
}

export async function HomeNewAndHot() {
  const now = new Date();
  const [themes, hot] = await Promise.all([getAllThemes(), popularThemes(7, 10)]);
  const byId = new Map(themes.map((t) => [t.id, t]));

  const hotList = hot
    .filter((h) => h.clicks >= 2 && byId.has(h.themeId))
    .slice(0, 5)
    .map((h) => ({ theme: byId.get(h.themeId)!, clicks: h.clicks }));
  const showHot = hotList.length >= HOT_MIN_THEMES;

  const fresh = newestThemes(themes, 6);

  if (!showHot && fresh.length === 0) return null;

  return (
    <div className="space-y-8">
      {showHot && (
        <section aria-labelledby="home-hot" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 id="home-hot" className="text-xl">
              🔥 이번 주 많이 찾는 방
            </h2>
            <span className="text-xs font-bold text-cream/50">
              최근 7일 예약 페이지 이동 기준
            </span>
          </div>
          <ol className="space-y-2">
            {hotList.map(({ theme: t, clicks }, i) => (
              <li key={t.id}>
                <Link
                  href={`/theme/${t.id}?from=home`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-edge bg-panel px-4 py-3 transition hover:border-candy active:scale-[0.99]"
                >
                  <span
                    className={`w-6 shrink-0 text-center text-lg font-extrabold ${
                      i === 0 ? "text-candy" : "text-cream/50"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">
                      {genreEmoji(t.genre)} {t.name}
                    </span>
                    <span className="block truncate text-xs text-cream/60">{t.cafe}</span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-cream/55">
                    {clicks}회
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {fresh.length > 0 && (
        <section aria-labelledby="home-new" className="space-y-3">
          <h2 id="home-new" className="text-xl">
            🆕 새로 들어온 테마
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.map((t) => {
              const created = t.created_at ?? "";
              const isNew =
                created && now.getTime() - Date.parse(created) < NEW_DAYS * 86400000;
              return (
                <li key={t.id}>
                  <Link
                    href={`/theme/${t.id}?from=home`}
                    className="flex h-full flex-col gap-1 rounded-2xl border-2 border-edge bg-panel p-4 transition hover:border-candy active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      {isNew && (
                        <span className="rounded-md bg-candy px-1.5 py-0.5 text-[11px] font-extrabold text-white">
                          NEW
                        </span>
                      )}
                      <span className="text-candy">{brandOf(t.cafe)}</span>
                      {created && (
                        <span className="text-cream/45">· {agoLabel(created, now)} 등록</span>
                      )}
                    </span>
                    <span className="font-extrabold">
                      {genreEmoji(t.genre)} {t.name}
                    </span>
                    <span className="text-xs text-cream/60">
                      {branchOf(t.cafe) || t.cafe} · 난이도 {t.difficulty}/5 · 공포{" "}
                      {t.fear_level}/5
                    </span>
                    {t.teaser && (
                      <span className="mt-1 line-clamp-2 text-sm text-cream/70">
                        {t.teaser}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
