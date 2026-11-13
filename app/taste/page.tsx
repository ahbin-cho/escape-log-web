"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getRecords,
  getCatalog,
  computeTaste,
  recommend,
  GENRE_EMOJI,
  GENRES,
  getLegacyLocalRecords,
  getSavedQuiz,
  type EscapeRecord,
  type CandidateTheme,
} from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { typeFromRecords, TYPE_MIN_RECORDS } from "@/lib/record-type";
import { FOCUS_TAGS, QUIZ_TYPES, MASCOT, typeImage, type TypeId } from "@/lib/quiz";
import { inferRegion } from "@/lib/region";
import RecommendCard from "@/components/RecommendCard";
import InstallHint from "@/components/InstallHint";

export default function TastePage() {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);
  // 가입 전에 쓴 기록(이 기기에만 있음)으로도 유형·추천을 바로 보여 준다
  const [guest, setGuest] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [quizType, setQuizType] = useState<TypeId | null>(null);

  useEffect(() => {
    setJustSaved(new URLSearchParams(window.location.search).get("saved") === "1");
    setQuizType((getSavedQuiz()?.typeId as TypeId | undefined) ?? null);
    (async () => {
      let loggedIn = false;
      if (isSupabaseConfigured()) {
        const { data } = await createClient().auth.getUser();
        loggedIn = !!data.user;
      }
      const [r, c] = await Promise.all([loggedIn ? getRecords() : Promise.resolve(getLegacyLocalRecords()), getCatalog()]);
      setGuest(!loggedIn);
      setRecords(r);
      setCatalog(c);
      setReady(true);
    })();
  }, []);

  const taste = useMemo(() => computeTaste(records), [records]);
  const myType = useMemo(() => typeFromRecords(records), [records]);
  const recs = useMemo(() => {
    // 유형이 나오면 그 유형이 좋아하는 요소(연출·장치·스토리…) 태그도 추천에 반영
    const focusKey = myType
      ? { thrill: "staging", explore: "staging", brain: "device", story: "story" }[myType.draw]
      : null;
    const focus = [
      ...(focusKey ? FOCUS_TAGS[focusKey] ?? [] : []),
      ...(myType?.play === "team" ? FOCUS_TAGS.coop : []),
      ...(myType?.play === "savor" ? FOCUS_TAGS.cozy : []),
    ];
    return recommend(catalog, taste, records.map((r) => r.themeName), 4, focus);
  }, [catalog, records, taste, myType]);

  // 방탈 뱃지: 졸업(매장 전 테마 클리어) · 원정(주지역 밖) · 노힌트 · 인생테마
  const badges = useMemo(() => {
    const regionCount = new Map<string, number>();
    records.forEach((r) => {
      const rr = inferRegion(r);
      if (rr) regionCount.set(rr, (regionCount.get(rr) ?? 0) + 1);
    });
    let home = "";
    let max = 0;
    regionCount.forEach((c, reg) => {
      if (c > max) {
        max = c;
        home = reg;
      }
    });
    const away = new Set<string>();
    records.forEach((r) => {
      const rr = inferRegion(r);
      if (rr && rr !== home) away.add(rr);
    });

    // 졸업: 카탈로그 매장별 테마셋이 내 클리어 테마셋에 모두 포함
    const catByCafe = new Map<string, Set<string>>();
    catalog.forEach((t) => {
      const c = (t.cafe || "").trim();
      if (!catByCafe.has(c)) catByCafe.set(c, new Set());
      catByCafe.get(c)!.add((t.name || "").trim());
    });
    const clearedByCafe = new Map<string, Set<string>>();
    records
      .filter((r) => r.success)
      .forEach((r) => {
        const c = (r.cafeName || "").trim();
        if (!clearedByCafe.has(c)) clearedByCafe.set(c, new Set());
        clearedByCafe.get(c)!.add((r.themeName || "").trim());
      });
    const graduated: string[] = [];
    catByCafe.forEach((themes, cafe) => {
      if (themes.size === 0) return;
      const cleared = clearedByCafe.get(cafe);
      if (cleared && [...themes].every((t) => cleared.has(t))) graduated.push(cafe);
    });

    return {
      home,
      away: away.size,
      graduated,
      noHint: records.filter((r) => r.success && r.hintCount === 0).length,
      lifeThemes: records.filter((r) => Math.round(r.rating) === 5).length,
    };
  }, [records, catalog]);

  if (!ready) {
    return <p className="py-20 text-center text-cream/55">불러오는 중…</p>;
  }

  return (
    <div className="space-y-8">
      {justSaved && (
        <p className="rounded-xl border-2 border-mint/60 bg-mint/10 px-4 py-3 text-sm font-bold">
          ✅ 기록을 저장했어요.{" "}
          {guest && "지금은 이 기기에만 있어요. "}
          <Link href="/records" className="underline underline-offset-2">내 달력에서 보기 →</Link>
        </p>
      )}
      <InstallHint />
      {guest && records.length > 0 && (
        <div className="rough flex flex-col gap-3 rounded-2xl border-2 border-candy/60 bg-candy/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cream/80">
            <b className="font-extrabold">기록 {records.length}개가 이 기기에만 있어요.</b> 10초 가입하면 계정으로 옮겨져서
            달력·결산까지 열리고, 폰을 바꿔도 남아요.
          </p>
          <Link
            href="/login?mode=signup&guest=1&next=/taste"
            className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
          >
            가입하고 기록 지키기
          </Link>
        </div>
      )}

      {/* 기록으로 본 내 유형: 3개부터 나온다 */}
      <section className="space-y-3">
        <h1 className="text-xl font-extrabold">🔮 기록으로 본 내 유형</h1>
        {myType ? (
          <div className="rough rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={typeImage(myType.typeId)}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = MASCOT.image;
                }}
                className="h-20 w-20 shrink-0 rounded-2xl border-2 border-edge object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-candy">다녀온 {records.length}방이 말해 주는 당신은</p>
                <h2 className="mt-0.5 text-2xl">{QUIZ_TYPES[myType.typeId].title}</h2>
                <p className="mt-1 text-sm text-cream/70 [word-break:keep-all]">{QUIZ_TYPES[myType.typeId].tagline}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5 border-t-2 border-dashed border-edge/15 pt-3 text-sm text-cream/75">
              {myType.evidence.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className="text-candy">●</span>
                  {e}
                </li>
              ))}
            </ul>
            {quizType && (
              <p className="mt-3 rounded-xl bg-ink/60 px-3.5 py-2.5 text-xs font-bold text-cream/70">
                {quizType === myType.typeId
                  ? "질문으로 진단한 유형과 똑같아요. 스스로를 잘 아시네요 👏"
                  : `질문으로 진단했을 땐 '${QUIZ_TYPES[quizType]?.title ?? "다른 유형"}'였어요. 실제로 다닌 방은 조금 다른 이야기를 하네요.`}
              </p>
            )}
            {!quizType && (
              <Link href="/quiz" className="mt-3 inline-block text-xs font-bold text-candy underline underline-offset-2">
                질문으로 진단한 유형과 비교해 보기 →
              </Link>
            )}
          </div>
        ) : (
          <div className="rough rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-5">
            <p className="text-base font-extrabold">
              {records.length === 0
                ? `다녀온 방 ${TYPE_MIN_RECORDS}개만 남기면 내 유형이 나와요`
                : `${TYPE_MIN_RECORDS - records.length}개만 더 남기면 내 유형이 나와요`}
            </p>
            <p className="mt-1 text-sm text-cream/60">
              어떤 장르를 좋게 했는지, 힌트를 얼마나 쓰는지로 16가지 유형 중 하나를 알려 주고 다음 방을 골라 줘요.
            </p>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: TYPE_MIN_RECORDS }, (_, i) => (
                <span
                  key={i}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-extrabold ${
                    i < records.length ? "border-edge bg-candy text-white" : "border-edge/25 text-cream/35"
                  }`}
                >
                  {i < records.length ? "✓" : i + 1}
                </span>
              ))}
              <Link
                href="/new"
                className="rough ml-2 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
              >
                {records.length === 0 ? "첫 기록 남기기" : "다음 방 기록하기"}
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">취향 프로필</h2>
        {records.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-12 text-center">
            <p className="text-sm text-cream/60">기록이 쌓이면 취향을 분석해드립니다</p>
            <Link
              href="/new"
              className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
            >
              첫 기록 남기기
            </Link>
          </div>
        ) : (
          <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Cell
                value={taste.topGenre ? `${GENRE_EMOJI[taste.topGenre]} ${taste.topGenre}` : "-"}
                label="최애 장르"
              />
              <Cell value={`${taste.fearComfort}`} label="선호 공포도" />
              <Cell value={`${taste.difficultyFit}`} label="선호 난이도" />
              <Cell value={`${taste.count}`} label="인생방 (4+)" />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {GENRES.filter((g) => taste.genreCounts[g] > 0).map((g) => (
                <span
                  key={g}
                  className="rounded-lg border border-edge/30 bg-ink px-2.5 py-1 text-xs font-bold text-cream/70"
                >
                  {GENRE_EMOJI[g]} {g} {taste.genreCounts[g]}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {records.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">🎖️ 방탈 뱃지</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Badge emoji="🎓" value={badges.graduated.length} label="졸업 지점" />
            <Badge emoji="✈️" value={badges.away} label="원정 지역" />
            <Badge emoji="🚫" value={badges.noHint} label="노힌트 클리어" />
            <Badge emoji="🏆" value={badges.lifeThemes} label="인생테마" />
          </div>
          {badges.graduated.length > 0 && (
            <p className="text-xs font-bold text-cream/60">
              🎓 졸업: {badges.graduated.join(" · ")}
            </p>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold">{myType ? "다음엔 이 방 어때요?" : "추천"}</h2>
          <span className="text-xs text-cream/55">스포 수위는 카드마다 조절 가능</span>
        </div>
        {recs.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
            추천할 새 방이 없습니다
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((r) => (
              <RecommendCard key={r.id} rec={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Cell({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs text-cream/60">{label}</div>
    </div>
  );
}

function Badge({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  const on = value > 0;
  return (
    <div
      className={`rounded-2xl border-2 p-3 text-center ${
        on ? "border-edge bg-panel" : "border-edge/20 bg-panel opacity-50"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-lg font-extrabold text-candy">{value}</div>
      <div className="text-[11px] font-bold text-cream/60">{label}</div>
    </div>
  );
}
