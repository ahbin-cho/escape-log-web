"use client";
import { shortDate } from "@/lib/ui";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getMyThemeRecords,
  getThemeOldestReviews,
  getThemePublicReviews,
  type EscapeRecord,
  type PublicReview,
} from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isSameTheme, pickFirstReview, summarizeReviews } from "@/lib/reviews";
import { RATING_EMOJI, RATING_LABELS, ratingLabel } from "@/lib/terms";
import { CHIP, CHIP_ON } from "@/lib/ui";

function hintText(n: number): string {
  if (n < 0) return "힌트 무제한";
  if (n === 0) return "노힌트";
  return `힌트 ${n}`;
}

// 테마 상세 하단: 내 기록 + 모두의 후기(공개 후기만, 스포 메모는 애초에 안 읽음).
export default function ThemeReviews({
  themeId,
  themeName,
  cafe,
}: {
  themeId: string;
  themeName: string;
  cafe: string;
}) {
  const [mine, setMine] = useState<EscapeRecord[]>([]);
  const [all, setAll] = useState<PublicReview[]>([]);
  const [first, setFirst] = useState<PublicReview | null>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<"all" | "success" | "fail">("all");
  const [opened, setOpened] = useState<Set<string>>(new Set()); // 눌러서 연 스포일러 후기

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    Promise.all([
      getMyThemeRecords(themeName),
      getThemePublicReviews(themeName),
      getThemeOldestReviews(themeName),
    ]).then(
      ([m, a, o]) => {
        const theme = { name: themeName, cafe };
        setMine(m.filter((r) => isSameTheme(r, theme)));
        setAll(a.filter((r) => isSameTheme(r, theme)));
        setFirst(pickFirstReview(o.filter((r) => !r.isSample && isSameTheme(r, theme))));
        setReady(true);
      },
      () => setReady(true)
    );
  }, [themeName, cafe]);

  // 예시 후기는 보여 주되 통계·첫 후기 배지에는 넣지 않는다
  const real = useMemo(() => all.filter((r) => !r.isSample), [all]);
  const summary = useMemo(() => summarizeReviews(real), [real]);
  const shown = useMemo(
    () => all.filter((r) => (filter === "all" ? true : filter === "success" ? r.success : !r.success)),
    [all, filter]
  );
  const recordHref = `/new?theme=${themeId}`;

  return (
    <section className="space-y-6" aria-labelledby="theme-reviews">
      {/* 내 기록 */}
      {mine.length > 0 && (
        <div>
          <h2 className="text-lg font-extrabold">내 기록</h2>
          <ul className="mt-2.5 divide-y divide-line border-y border-line">
            {mine.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/edit/${r.id}`}
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-3 text-sm font-bold"
                >
                  <span className="text-cream/60">{r.playedAt || "날짜 없음"}</span>
                  <span className={r.success ? "text-cream" : "text-cream/60"}>
                    {r.success ? `탈출${r.remainingTime ? ` · ${r.remainingTime} 남김` : ""}` : "실패"}
                  </span>
                  <span className="text-cream/60">{hintText(r.hintCount)}</span>
                  {ratingLabel(r.rating) && (
                    <span className="text-[#A85A14]">{ratingLabel(r.rating)}</span>
                  )}
                  <span className="ml-auto text-xs text-cream/60">수정</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 다녀온 사람들의 기록: 요약 숫자 + 한 줄 목록(글만. 사진은 쓴 사람이 따로 공개한 것만) */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="theme-reviews" className="text-lg font-extrabold">
            다녀온 사람들의 한 줄 {summary ? <span className="text-cream/60">{summary.count}</span> : null}
          </h2>
          <Link href="/feed" className="text-[13px] text-cream/60 hover:text-cream">
            전체 후기
          </Link>
        </div>

        {summary && (
          <div className="rounded-xl border-2 border-edge bg-panel p-3.5 shadow-cute">
            <p className="text-[13px] font-extrabold">
              다녀온 사람 <span className="text-[#A85A14]">{summary.count}명</span>의 기록 요약
            </p>
            <dl className="mt-2.5 grid grid-cols-4 gap-1 text-center">
              {[
                [`${summary.successRate}%`, "탈출 성공"],
                [summary.avgHint === null ? "—" : `${summary.avgHint}개`, "평균 힌트"],
                [String(summary.avgDifficulty), "체감 난이도"],
                [String(summary.avgFear), "체감 공포"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dd className="font-display text-[22px] leading-tight">{v}</dd>
                  <dt className="text-[11px] text-cream/60">{k}</dt>
                </div>
              ))}
            </dl>
            <ul className="mt-3 space-y-1">
              {[4, 3, 2, 1, 0].map((i) => (
                <li key={i} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-[68px] shrink-0 whitespace-nowrap">
                    {RATING_EMOJI[i]} {RATING_LABELS[i]}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-candy" style={{ width: `${(summary.ratingDist[i] / summary.count) * 100}%` }} />
                  </span>
                  <span className="w-5 shrink-0 text-right text-cream/60">{summary.ratingDist[i]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {first && (
          <p className="text-sm font-bold">
            이 방의 첫 후기는 <span className="text-[#A85A14]">{first.nickname}</span>님
            {mine.some((r) => r.id === first.id) ? " (바로 나!)" : ""}
          </p>
        )}

        {ready && all.length > 0 && real.length === 0 && (
          <p className="rounded-xl bg-[#FFF3E6] px-3.5 py-2.5 text-sm font-bold">
            아직 진짜 후기가 없어요. 지금 남기면 첫 후기 배지가 붙어요.
          </p>
        )}

        {all.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "최신순"],
                ["success", "성공만"],
                ["fail", "실패만"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={filter === k ? CHIP_ON : CHIP} aria-pressed={filter === k}>
                {label}
              </button>
            ))}
          </div>
        )}

        {!ready ? (
          <p className="text-sm text-cream/60">후기 불러오는 중…</p>
        ) : all.length === 0 ? (
          <div className="rounded-[14px] bg-ink px-4 py-5 text-center">
            <p className="text-sm font-extrabold">아직 아무도 후기를 안 남긴 방이에요</p>
            <p className="mt-1 text-sm text-cream/60">
              지금 기록을 남기면 <b className="text-cream">첫 후기 배지</b>가 붙어요.
              스포 없이 한 줄이면 충분해요.
            </p>
          </div>
        ) : shown.length === 0 ? (
          <p className="py-3 text-sm text-cream/60">조건에 맞는 후기가 아직 없어요.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {shown.map((r) => {
              const hide = !!r.spoiler && !opened.has(r.id);
              return (
                <li key={r.id} className="flex gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    {r.oneLiner &&
                      (hide ? (
                        <button
                          type="button"
                          onClick={() => setOpened((s) => new Set(s).add(r.id))}
                          className="block w-full text-left"
                          aria-label="스포일러가 있는 후기 보기"
                        >
                          <span className="block select-none text-[15px] font-extrabold blur-[5px]" aria-hidden>
                            “{r.oneLiner}”
                          </span>
                          <span className="mt-0.5 block text-xs font-bold text-[#A85A14]">스포일러가 있어요 · 눌러서 보기</span>
                        </button>
                      ) : (
                        <p className="text-[15px] font-extrabold leading-snug">“{r.oneLiner}”</p>
                      ))}
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-cream/60">
                      {ratingLabel(r.rating) && <span className="font-bold text-[#A85A14]">{ratingLabel(r.rating)}</span>}
                      <span>{r.success ? "탈출 성공" : "탈출 실패"}</span>
                      <span>{hintText(r.hintCount)}</span>
                      {r.partySize > 0 && <span>{r.partySize}명</span>}
                      {r.playedAt && <span>{shortDate(r.playedAt)}</span>}
                      <span className="font-bold text-cream/80">— {r.nickname}</span>
                      {r.isSample && (
                        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-extrabold text-cream/60">예시</span>
                      )}
                      {first?.id === r.id && (
                        <span className="rounded-md bg-[#FFF3E6] px-1.5 py-0.5 text-[11px] font-extrabold text-[#A85A14]">첫 후기</span>
                      )}
                    </p>
                  </div>
                  {r.photoUrl && (
                    <span className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.photoUrl} alt="" loading="lazy" className="h-16 w-16 rounded-lg object-cover" />
                      {(r.photoUrls?.length ?? 0) > 1 && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1 text-[10px] font-extrabold text-white">
                          +{(r.photoUrls?.length ?? 1) - 1}
                        </span>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href={recordHref}
          className="block rounded-xl border border-line bg-white px-4 py-3 text-center text-sm font-extrabold transition hover:bg-ink active:scale-[0.99]"
        >
          {mine.length > 0
            ? "이 방 또 기록하기"
            : real.length === 0
              ? "첫 후기 남기기"
              : "다녀왔다면 이 방 기록하기"}
        </Link>
      </div>
    </section>
  );
}
