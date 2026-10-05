"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { QuizValues, TypeId } from "@/lib/quiz/slots";
import type { SharedResult } from "@/lib/quiz/share";
import { recommendForQuiz, regionsIn } from "@/lib/quiz/recommend";
import type { Region } from "@/lib/region";
import type { CandidateTheme } from "@/lib/store";
import RecommendCard from "@/components/RecommendCard";
import TypeCard from "@/components/quiz/TypeCard";
import TypeRarity from "@/components/quiz/TypeRarity";
import ShareButton from "@/components/quiz/ShareButton";
import FriendCompat from "@/components/quiz/FriendCompat";

const REGION_KEY = "escapelog:quiz:region";
const PAGE = 4;

const CHIP =
  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-[0.97]";

export default function QuizResult({
  typeId,
  values,
  catalog,
  played,
  friend,
  onRestart,
}: {
  typeId: TypeId;
  values: QuizValues;
  catalog: CandidateTheme[]; // 못 불러왔으면 빈 배열
  played: string[];
  friend: SharedResult | null; // 공유 링크로 들어와 퀴즈를 한 경우 그 친구
  onRestart: () => void;
}) {
  const regions = useMemo(() => regionsIn(catalog), [catalog]);
  const [region, setRegion] = useState<Region | null>(null); // null = 전국
  const [limit, setLimit] = useState(PAGE);

  // 지난번에 고른 지역을 이어서 쓴다(카탈로그에 있는 지역일 때만).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REGION_KEY);
      if (saved && regions.some((r) => r.region === saved)) setRegion(saved as Region);
    } catch {
      // 저장소를 못 읽으면 전국으로 둔다
    }
  }, [regions]);

  function pickRegion(next: Region | null) {
    setRegion(next);
    setLimit(PAGE);
    try {
      if (next) window.localStorage.setItem(REGION_KEY, next);
      else window.localStorage.removeItem(REGION_KEY);
    } catch {
      // 기억 실패는 무시
    }
  }

  // 한 개 더 요청해 보고 "더 보기"를 보여 줄지 정한다.
  const { recs, brand, hasMore } = useMemo(() => {
    const r = recommendForQuiz(catalog, values, played, { region, limit: limit + 1 });
    const shown = recommendForQuiz(catalog, values, played, { region, limit });
    return { ...shown, hasMore: r.recs.length > limit };
  }, [catalog, values, played, region, limit]);

  return (
    <div className="space-y-8">
      <TypeCard
        eyebrow="너의 방탈출 유형"
        typeId={typeId}
        fear={values.fear}
        difficulty={values.difficulty}
        hint={values.hint}
        players={values.players}
        time={values.time}
      >
        <TypeRarity typeId={typeId} />
        <ShareButton values={values} />
      </TypeCard>

      {friend && (
        <FriendCompat
          friend={friend}
          me={{
            name: "나",
            genre: values.genre,
            fear: values.fear,
            diff: values.difficulty,
          }}
        />
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl">추천 테마</h2>
          {recs.length > 0 && (
            <span className="text-xs text-cream/55">스포 수위는 카드마다 조절 가능</span>
          )}
        </div>

        {regions.length > 1 && (
          <div
            role="group"
            aria-label="추천 지역"
            className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
          >
            <button
              onClick={() => pickRegion(null)}
              aria-pressed={region === null}
              className={`${CHIP} ${
                region === null ? "bg-edge text-panel" : "text-cream/70 hover:bg-edge/10 hover:text-cream"
              }`}
            >
              전국
            </button>
            {regions.map((r) => (
              <button
                key={r.region}
                onClick={() => pickRegion(r.region)}
                aria-pressed={region === r.region}
                className={`${CHIP} ${
                  region === r.region
                    ? "bg-edge text-panel"
                    : "text-cream/70 hover:bg-edge/10 hover:text-cream"
                }`}
              >
                {r.region}
              </button>
            ))}
          </div>
        )}

        {brand && (
          <p className="text-sm font-bold text-cream/70">
            아래 추천 중엔{" "}
            <span className="font-extrabold text-candy">{brand.name}</span> 방이
            제일 많아.
          </p>
        )}
        <p className="sr-only" role="status">
          {region ?? "전국"} 추천 {recs.length}개
        </p>

        {recs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((r) => (
              <RecommendCard key={r.id} rec={r} reasons={r.reasons} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel px-4 py-10 text-center text-sm text-cream/60 [word-break:keep-all]">
            {catalog.length === 0
              ? "추천 테마를 불러오지 못했어. 잠시 뒤에 다시 진단해 줘."
              : `${region ?? "전국"}에는 네 조건에 맞는 방이 아직 없어. 다른 지역을 골라 봐.`}
          </p>
        )}

        {hasMore && (
          <div className="pt-1 text-center">
            <button
              onClick={() => setLimit(limit + PAGE)}
              className="rough rounded-xl border-2 border-edge bg-panel px-5 py-2.5 text-sm font-extrabold shadow-cute transition active:scale-[0.97]"
            >
              다른 방 더 보기
            </button>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          다시 진단
        </button>
        <Link
          href="/region"
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          지역별 테마
        </Link>
        <Link
          href="/taste"
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          취향 페이지로
        </Link>
      </div>
    </div>
  );
}
