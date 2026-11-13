"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizValues } from "@/lib/quiz/slots";
import { cleanName, encodeShare, shareFromValues } from "@/lib/quiz/share";
import { TEAM_MAX, addToTeam, parseTeam, teamPath } from "@/lib/quiz/team";

const NAME_KEY = "escapelog:nickname"; // 결과 공유 버튼과 같은 별명을 쓴다

// 내 진단 결과를 팀 주소에 붙이고 팀 결과로 간다(서버 저장 없음).
export default function JoinTeamForm({
  values,
  team,
  submitLabel = "팀에 추가하기",
}: {
  values: QuizValues;
  team: string; // 지금 팀 주소의 m 값(비어 있으면 새 팀)
  submitLabel?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const full = parseTeam(team).length >= TEAM_MAX;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      // 저장소를 못 읽으면 빈 칸
    }
  }, []);

  if (full) {
    return (
      <p className="text-sm text-cream/70">
        이 팀은 이미 {TEAM_MAX}명이 다 찼어요.
      </p>
    );
  }

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
          if (name.trim()) window.localStorage.setItem(NAME_KEY, cleanName(name));
        } catch {
          // 별명 기억 실패는 무시
        }
        const code = encodeShare(shareFromValues(values, name));
        router.push(teamPath(addToTeam(team, code)));
      }}
    >
      <label htmlFor="team-name" className="text-xs font-bold text-cream/70">
        팀원에게 보일 이름
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={12}
          placeholder="비우면 '친구'로 보여요"
          autoComplete="nickname"
          className="min-w-0 flex-1 rounded-xl border-2 border-edge bg-panel px-3 py-2.5 text-sm font-bold outline-none transition placeholder:font-normal placeholder:text-cream/70 focus:border-edge"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rough rounded-xl border-2 border-edge bg-candy text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.98] px-4 py-2.5 disabled:opacity-60"
        >
          {busy ? "추가하는 중…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
