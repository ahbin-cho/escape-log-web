"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedQuiz } from "@/lib/store";
import { encodeTaste, rankMates, type MateTaste } from "@/lib/match";
import { encodeShare, shareToMate, type SharedResult } from "@/lib/quiz/share";

// 공유한 친구와 나의 궁합. 내 결과가 없으면 퀴즈로 보낸다.
// me 를 넘기면 그 값을 쓰고(방금 끝낸 퀴즈), 안 넘기면 저장된 내 결과를 읽는다.
export default function FriendCompat({
  friend,
  me,
}: {
  friend: SharedResult;
  me?: MateTaste;
}) {
  const [mine, setMine] = useState<MateTaste | null | undefined>(me);

  useEffect(() => {
    if (me) return;
    const saved = getSavedQuiz();
    setMine(
      saved
        ? {
            name: "나",
            genre: saved.taste.topGenre,
            fear: Math.round(saved.taste.fearComfort),
            diff: Math.round(saved.taste.difficultyFit),
          }
        : null
    );
  }, [me]);

  if (mine === undefined) return null; // 저장된 결과를 읽기 전

  if (mine === null) {
    return (
      <section className="rounded-2xl border-2 border-edge bg-candy/10 p-6 text-center">
        <h2 className="text-xl">{friend.name}랑 나는 잘 맞을까?</h2>
        <p className="mt-2 text-sm text-cream/70">
          너도 진단하면 둘의 궁합이 바로 나와.
        </p>
        <Link
          href={`/quiz?from=${encodeShare(friend)}`}
          className="rough mt-4 inline-block rounded-xl border-2 border-edge bg-candy px-6 py-3 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          나도 해보고 궁합 보기
        </Link>
      </section>
    );
  }

  const mate = shareToMate(friend);
  const [result] = rankMates(mine, [mate]);
  return (
    <section className="rounded-2xl border-2 border-edge bg-candy/10 p-6 text-center">
      <h2 className="text-xl">{friend.name}랑 나의 궁합</h2>
      <p className="mt-3 text-4xl font-extrabold tabular-nums text-candy">
        {result.score}
        <span className="text-xl">점</span>
      </p>
      <p className="mt-1 font-extrabold">{result.tier}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-cream/70 [word-break:keep-all]">
        {result.comment}
      </p>
      <Link
        href={`/match?c=${encodeTaste(mate)}`}
        className="mt-4 inline-block text-sm font-extrabold underline decoration-2 underline-offset-4 hover:text-candy"
      >
        다른 친구들과도 비교하기
      </Link>
    </section>
  );
}
