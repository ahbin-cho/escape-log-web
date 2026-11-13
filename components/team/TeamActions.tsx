"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedQuiz } from "@/lib/store";
import type { QuizValues } from "@/lib/quiz/slots";
import { TEAM_MAX, TEAM_MIN, quizForTeamPath, teamPath } from "@/lib/quiz/team";
import JoinTeamForm from "@/components/team/JoinTeamForm";

// 팀 링크 공유 + 팀원 추가. 주소가 곧 팀이라, 한 명이 붙을 때마다 링크가 새로 생긴다.
export default function TeamActions({
  team,
  size,
  title,
}: {
  team: string; // m 값
  size: number;
  title: string; // 공유 문구에 쓸 팀 이름(결과 전이면 빈 문자열)
}) {
  const [mine, setMine] = useState<QuizValues | null>(null);
  const [open, setOpen] = useState(size < TEAM_MIN); // 결과가 열리기 전엔 추가 방법을 바로 보여 준다
  const [status, setStatus] = useState("");
  const full = size >= TEAM_MAX;

  useEffect(() => {
    const saved = getSavedQuiz();
    if (saved?.values && saved.typeId) setMine(saved.values);
  }, []);

  async function share() {
    const url = window.location.origin + teamPath(team);
    const text =
      size >= TEAM_MIN
        ? `우리 팀은 '${title}'. 방 안 역할이랑 같이 갈 방까지 나왔어.`
        : `방탈출 팀 조합 진단 같이 하자. 3명부터 결과가 열려.`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "방탈출 팀 조합 진단", text, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("링크를 복사했어요. 단톡방에 붙여 넣어 주세요.");
    } catch {
      setStatus(url);
    }
  }

  return (
    <section
      id="add"
      className="rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute sm:p-8"
    >
      {size > 0 && (
        <>
          <h2 className="text-xl">팀 링크</h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/70 [word-break:keep-all]">
            팀원이 한 명 붙을 때마다 링크가 새로 만들어져요. 가장 마지막에 올라온 링크가
            최신 팀이에요. 한 명씩 차례로 추가하면 엇갈리지 않아요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={share}
              className="rough rounded-xl border-2 border-edge bg-candy text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.98] px-5 py-3"
            >
              팀 링크 공유하기
            </button>
            {!full && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="rough rounded-xl border-2 border-edge bg-panel text-sm font-extrabold transition active:scale-[0.98] px-5 py-3"
              >
                팀원 추가하기
              </button>
            )}
          </div>
          <p role="status" className="mt-2 min-h-5 break-all text-sm font-bold text-cream/70">
            {status}
          </p>
        </>
      )}

      {open && !full && (
        <div className={size > 0 ? "mt-4 border-t border-edge/10 pt-6" : ""}>
          {size === 0 && <h2 className="text-xl">팀 만들기</h2>}
          <p className="text-sm leading-relaxed text-cream/70 [word-break:keep-all]">
            {size === 0
              ? "먼저 내 결과로 팀을 만들고, 생긴 링크를 단톡방에 보내 주세요."
              : "취향 진단을 마친 사람이 직접 자기 결과를 붙여요. 이 링크를 받은 팀원도 여기서 똑같이 하면 돼요."}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {mine ? (
              <div className="rounded-xl border border-edge/15 bg-ink/60 p-4">
                <p className="mb-3 text-sm font-extrabold">이 기기에 있는 내 결과로</p>
                <JoinTeamForm
                  values={mine}
                  team={team}
                  submitLabel={size === 0 ? "팀 만들기" : "추가"}
                />
              </div>
            ) : null}
            <div className="flex flex-col justify-between rounded-xl border border-edge/15 bg-ink/60 p-4">
              <div>
                <p className="text-sm font-extrabold">
                  {mine ? "새로 진단하고 추가" : "취향 진단하고 추가"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-cream/70 [word-break:keep-all]">
                  질문 몇 개면 끝나요. 결과 화면 맨 위의 ‘팀에 추가하기’를 누르면 이 팀으로
                  돌아와요.
                </p>
              </div>
              <Link
                href={quizForTeamPath(team)}
                className="mt-4 inline-block self-start rough rounded-xl border-2 border-edge bg-candy text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.98] px-4 py-2.5"
              >
                취향 진단 시작
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
