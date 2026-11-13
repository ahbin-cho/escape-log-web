"use client";

import Link from "next/link";
import { useMemo } from "react";
import DiaryView from "@/components/DiaryView";
import type { EscapeRecord } from "@/lib/store";
import { playNumbers, recordDate } from "@/lib/diary";

const PREVIEW = 3;

// 홈의 "최근 기록" 미리보기: 최근 기록 3개(다이어리와 같은 모양).
// 기록 수·성공률은 맨 위 '내 기록' 줄에 있고, 검색·장르 필터 같은 도구는 /records 에만 둔다.
export default function HomeDiary({
  records,
  ready,
}: {
  records: EscapeRecord[];
  ready: boolean;
}) {
  const numbers = useMemo(() => playNumbers(records), [records]);
  const latest = useMemo(
    () =>
      [...records]
        .sort((a, b) =>
          `${recordDate(b)}|${b.createdAt}`.localeCompare(`${recordDate(a)}|${a.createdAt}`)
        )
        .slice(0, PREVIEW),
    [records]
  );

  if (!ready) return null;

  if (records.length === 0) {
    return (
      <section aria-labelledby="home-diary" className="border-y border-line py-5">
        <h2 id="home-diary" className="text-[18px]">
          다녀온 방, 기록해 둘까요?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-cream/70 [word-break:keep-all]">
          남기면 달력이 포스터로 채워지고 몇 번째 방인지 세 줘요. 먼저 써 보고 10초 가입하면 계속 보관돼요.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/new"
            className="flex-1 rounded-xl bg-edge px-4 py-3 text-center text-sm font-extrabold text-white transition active:scale-[0.97] sm:flex-none sm:px-6"
          >
            첫 방 기록하기
          </Link>
          <Link
            href="/diary"
            className="flex-1 rounded-xl border border-line px-4 py-3 text-center text-sm font-extrabold transition active:scale-[0.97] sm:flex-none sm:px-6"
          >
            기록장 둘러보기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="home-diary">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="home-diary" className="text-[18px]">
          최근 기록
        </h2>
        <Link href="/records" className="text-[13px] text-cream/70">
          전체 {records.length}방 ›
        </Link>
      </div>

      <DiaryView records={latest} numbers={numbers} />
    </section>
  );
}
