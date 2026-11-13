"use client";

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
import { ratingLabel } from "@/lib/terms";

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

      {/* 모두의 후기 */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="theme-reviews" className="text-lg font-extrabold">
            모두의 후기 {summary ? <span className="text-cream/60">{summary.count}</span> : null}
          </h2>
          <Link href="/feed" className="text-[13px] text-cream/60 hover:text-cream">
            전체 후기
          </Link>
        </div>

        {first && (
          <p className="text-sm font-bold">
            이 방의 첫 후기는 <span className="text-[#A85A14]">{first.nickname}</span>님
            {mine.some((r) => r.id === first.id) ? " (바로 나!)" : ""}
          </p>
        )}

        {summary && (
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-cream/70">
            <span>탈출 성공률 {summary.successRate}%</span>
            <span>평균 별점 {summary.avgRating}</span>
            {summary.noHint > 0 && <span>노힌트 {summary.noHint}명</span>}
          </p>
        )}

        {ready && all.length > 0 && real.length === 0 && (
          <p className="rounded-xl bg-[#FFF3E6] px-3.5 py-2.5 text-sm font-bold">
            아직 진짜 후기가 없어요. 지금 남기면 첫 후기 배지가 붙어요.
          </p>
        )}

        {!ready ? (
          <p className="text-sm text-cream/60">후기 불러오는 중…</p>
        ) : all.length === 0 ? (
          <div className="rounded-[14px] bg-ink px-4 py-5 text-center">
            <p className="text-sm font-extrabold">아직 아무도 후기를 안 남긴 방이에요</p>
            <p className="mt-1 text-sm text-cream/60">
              지금 공개 후기를 남기면 <b className="text-cream">첫 후기 배지</b>가 붙어요.
              스포 없이 한 줄이면 충분해요.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {all.map((r) => (
              <li key={r.id} className="flex gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="font-extrabold">{r.nickname}</span>
                    {r.isSample && (
                      <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-extrabold text-cream/60">
                        예시
                      </span>
                    )}
                    {first?.id === r.id && (
                      <span className="rounded-md bg-[#FFF3E6] px-1.5 py-0.5 text-[11px] font-extrabold text-[#A85A14]">
                        첫 후기
                      </span>
                    )}
                    <span className={r.success ? "text-cream" : "text-cream/60"}>
                      {r.success ? "탈출" : "실패"}
                    </span>
                    <span className="text-cream/60">{hintText(r.hintCount)}</span>
                    {ratingLabel(r.rating) && (
                      <span className="text-[#A85A14]">
                        {ratingLabel(r.rating)}
                      </span>
                    )}
                    {r.playedAt && <span className="font-normal text-cream/60">{r.playedAt}</span>}
                  </p>
                  {r.oneLiner && <p className="mt-1 text-sm text-cream/85">“{r.oneLiner}”</p>}
                </div>
                {r.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                )}
              </li>
            ))}
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
