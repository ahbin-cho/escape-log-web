"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCatalog, GENRE_EMOJI, type CandidateTheme } from "@/lib/store";
import type { MateTaste } from "@/lib/match";
import { encodeTeam, pickForTeam, teamProfile, teamTier } from "@/lib/team";

// 우리 팀 궁합 + 같이 갈 방 추천. 팀 링크 하나로 단톡방에서 같은 결과를 본다.
export default function TeamPicks({ members }: { members: MateTaste[] }) {
  const [catalog, setCatalog] = useState<CandidateTheme[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCatalog().then(setCatalog);
  }, []);

  const profile = useMemo(() => teamProfile(members), [members]);
  const picks = useMemo(
    () => (catalog ? pickForTeam(catalog, members) : []),
    [catalog, members]
  );
  const tier = teamTier(profile.harmony);

  const link = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/match?t=${encodeTeam(members)}`
        : "",
    [members]
  );

  async function share() {
    const text = `우리 팀 방탈출 궁합 ${profile.harmony}점 ${tier.emoji} ${tier.label}! 같이 갈 방도 골라놨어 👉`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "우리 팀 방탈출 궁합", text, url: link });
        return;
      }
    } catch {
      // 공유 창을 닫은 경우 등 → 복사로 넘어간다
    }
    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 복사도 안 되면 조용히 무시
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-cream/60">
            우리 팀 {profile.size}명 궁합
          </p>
          <p className="mt-0.5 text-xl font-extrabold">
            {tier.emoji} {tier.label}{" "}
            <span className="text-mint">{profile.harmony}점</span>
          </p>
          <p className="mt-1 text-xs text-cream/60">
            {members.map((m) => m.name).join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={share}
          className="rounded-xl border-2 border-edge bg-grape px-3 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
        >
          {copied ? "복사됨! 📋" : "📣 단톡방에 팀 결과 공유"}
        </button>
      </div>

      <ul className="flex flex-wrap gap-1.5 text-xs font-bold">
        <li className="rounded-full border border-edge/20 bg-ink px-2.5 py-1">
          👻 공포 {profile.fearCap}/5까지
          {profile.scaredest ? ` (${profile.scaredest} 기준)` : ""}
        </li>
        <li className="rounded-full border border-edge/20 bg-ink px-2.5 py-1">
          🧩 난이도 {profile.diffTarget} 근처
        </li>
        {profile.genres.slice(0, 2).map((g) => (
          <li
            key={g.genre}
            className="rounded-full border border-edge/20 bg-ink px-2.5 py-1"
          >
            {GENRE_EMOJI[g.genre]} {g.genre} {g.votes}표
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <h3 className="font-extrabold">🗝️ 우리 팀이 같이 갈 방</h3>
        {catalog === null ? (
          <p className="text-sm text-cream/55">방 고르는 중…</p>
        ) : picks.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-edge/40 p-4 text-sm text-cream/60">
            모두가 들어갈 수 있는 방을 못 찾았어. 공포 기준이 너무 낮거나 인원이
            많으면 그래. <Link href="/best/단체-방탈출" className="font-bold text-candy underline">단체 방탈출 목록</Link>도 봐봐.
          </p>
        ) : (
          <ol className="space-y-2">
            {picks.map((t, i) => (
              <li
                key={t.id}
                className="rounded-xl border-2 border-edge/40 bg-ink/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold">
                      {i + 1}. {t.name}
                    </p>
                    <p className="text-xs text-cream/60">
                      📍 {t.cafe} · {GENRE_EMOJI[t.genre as keyof typeof GENRE_EMOJI] ?? ""}{" "}
                      {t.genre} · 난이도 {t.difficulty} · 공포 {t.fearLevel}
                      {t.players ? ` · ${t.players}인` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/theme/${t.id}?from=recommend`}
                    className="shrink-0 rounded-lg border-2 border-edge bg-candy px-2.5 py-1 text-xs font-extrabold text-edge"
                  >
                    보기 →
                  </Link>
                </div>
                {t.reasons.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-xs text-cream/70">
                    {t.reasons.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
