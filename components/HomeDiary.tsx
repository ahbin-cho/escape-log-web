"use client";

import Link from "next/link";
import { useMemo } from "react";
import DiaryView from "@/components/DiaryView";
import type { EscapeRecord } from "@/lib/store";
import { nextMilestone, playNumbers, recordDate } from "@/lib/diary";

const PREVIEW = 3;

// 홈의 "내 다이어리" 미리보기: 요약 한 줄 + 최근 기록 3개(다이어리와 같은 모양).
// 검색·장르 필터 같은 도구는 /records 에만 둔다.
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
      <section className="rough flex flex-col gap-3 rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg">📓 내 방탈출 다이어리</h2>
          <p className="mt-1 text-sm text-cream/65">
            다녀온 방을 남기면 몇 번째 방인지 세 주고, 연말엔 결산까지 만들어 줘요.
            먼저 써 보고, 10초 가입하면 계속 보관돼요.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/diary"
            className="rounded-xl px-3 py-2.5 text-sm font-bold text-cream/70 hover:text-candy"
          >
            둘러보기
          </Link>
          <Link
            href="/new"
            className="rough rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.97]"
          >
            ✍️ 첫 방 기록하기
          </Link>
        </div>
      </section>
    );
  }

  const success = records.filter((r) => r.success).length;
  const rate = Math.round((success / records.length) * 100);
  const milestone = nextMilestone(records.length);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl">📓 내 다이어리</h2>
        <Link href="/records" className="text-xs font-bold text-candy">
          전체 {records.length}방 보기 →
        </Link>
      </div>

      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm font-bold text-cream/70">
        <span>
          <b className="text-lg font-extrabold text-candy tabular-nums">{records.length}</b>방
        </span>
        <span>
          탈출 <b className="font-extrabold text-cream tabular-nums">{rate}%</b>
        </span>
        {milestone && (
          <span>
            🎯 {milestone.next}번째 방까지 <b className="text-candy">{milestone.left}</b>방
          </span>
        )}
      </p>

      <DiaryView records={latest} numbers={numbers} />

      <div className="flex gap-2">
        <Link
          href="/new"
          className="rough flex-1 rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-center text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.97]"
        >
          + 기록 추가
        </Link>
        <Link
          href="/records"
          className="rough flex-1 rounded-xl border-2 border-edge bg-panel px-4 py-2.5 text-center text-sm font-extrabold transition hover:border-candy active:scale-[0.97]"
        >
          다이어리 열기
        </Link>
      </div>
    </section>
  );
}
