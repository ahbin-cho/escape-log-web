"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getSavedQuiz,
  GENRES,
  GENRE_EMOJI,
  type Genre,
} from "@/lib/store";
import Mascot from "@/components/Mascot";
import {
  encodeTaste,
  decodeTaste,
  rankMates,
  type MateTaste,
} from "@/lib/match";
import { decodeTeam } from "@/lib/team";
import TeamPicks from "@/components/TeamPicks";

// 팀 링크로 들어왔는데 아직 취향이 없으면, 취향 찾기 후 돌아왔을 때 팀을 되살린다.
const PENDING_TEAM_KEY = "escapelog:pendingTeam";

export default function MatchPage() {
  const [me, setMe] = useState<MateTaste | null>(null);
  const [mates, setMates] = useState<MateTaste[]>([]);
  // 내 취향 없이 팀 링크로 들어온 경우의 팀 (팀 결과만 보여 주고 합류 유도)
  const [linkTeam, setLinkTeam] = useState<MateTaste[]>([]);
  const [ready, setReady] = useState(false);

  // 친구 수동 추가 폼
  const [name, setName] = useState("");
  const [genre, setGenre] = useState<Genre>("공포");
  const [fear, setFear] = useState(3);
  const [diff, setDiff] = useState(3);

  // 코드로 추가
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = getSavedQuiz();
    let mine: MateTaste | null = null;
    if (saved) {
      mine = {
        name: "나",
        genre: saved.taste.topGenre,
        fear: Math.round(saved.taste.fearComfort),
        diff: Math.round(saved.taste.difficultyFit),
      };
      setMe(mine);
    }
    // 공유 링크(?c=코드)로 들어왔으면 보낸 친구를 자동으로 추가
    const c = new URLSearchParams(window.location.search).get("c");
    if (c) {
      const t = decodeTaste(c);
      if (t) setMates((m) => [...m, t]);
    }
    // 팀 링크(?t=코드.코드…). 취향 찾기 하러 갔다 돌아온 경우엔 저장해 둔 팀을 쓴다.
    let teamParam = new URLSearchParams(window.location.search).get("t");
    try {
      if (!teamParam) teamParam = window.localStorage.getItem(PENDING_TEAM_KEY);
      if (teamParam && mine) window.localStorage.removeItem(PENDING_TEAM_KEY);
    } catch {
      // 저장소를 못 쓰면 링크로 들어온 경우만 처리
    }
    if (teamParam) {
      const team = decodeTeam(teamParam);
      if (mine) {
        // 팀 안에 이미 있는 "나"(같은 코드)는 빼고 나머지를 친구로 추가
        const myCode = encodeTaste(mine);
        setMates((m) => [...m, ...team.filter((x) => encodeTaste(x) !== myCode)]);
      } else {
        setLinkTeam(team);
        try {
          window.localStorage.setItem(PENDING_TEAM_KEY, teamParam);
        } catch {
          // 무시
        }
      }
    }
    setReady(true);
  }, []);

  const myCode = useMemo(() => (me ? encodeTaste(me) : ""), [me]);
  const ranked = useMemo(
    () => (me ? rankMates(me, mates) : []),
    [me, mates]
  );

  function addManual() {
    if (!name.trim()) {
      alert("친구 이름을 입력해줘!");
      return;
    }
    setMates((m) => [...m, { name: name.trim(), genre, fear, diff }]);
    setName("");
  }

  function addByCode() {
    const t = decodeTaste(code);
    if (!t) {
      alert("코드를 다시 확인해줘!");
      return;
    }
    setMates((m) => [...m, t]);
    setCode("");
  }

  const myLink = useMemo(
    () =>
      myCode && typeof window !== "undefined"
        ? `${window.location.origin}/match?c=${myCode}`
        : "",
    [myCode]
  );

  function copyMyLink() {
    if (!myLink) return;
    navigator.clipboard?.writeText(myLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!ready) {
    return <p className="py-20 text-center text-cream/55">불러오는 중…</p>;
  }

  if (!me && linkTeam.length > 0) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-extrabold sm:text-2xl">👥 우리 팀 방탈출 궁합</h1>
          <p className="text-sm text-cream/70">
            친구가 보낸 팀 결과야. 너도 취향을 찾으면 팀에 합류해서 다시 골라 줄게.
          </p>
        </header>
        <TeamPicks members={linkTeam} />
        <div className="rounded-2xl border-2 border-edge bg-panel p-6 text-center shadow-cute">
          <Mascot className="mx-auto h-16 w-16" />
          <p className="mt-2 font-bold">나도 이 팀에 끼워 줘!</p>
          <p className="mt-1 text-sm text-cream/60">
            1분이면 끝나. 끝나고 궁합 화면으로 오면 이 팀이 그대로 있어.
          </p>
          <Link
            href="/quiz"
            className="mt-4 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-edge shadow-cute"
          >
            내 취향 찾고 팀 합류하기
          </Link>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="rounded-2xl border-2 border-edge bg-panel p-8 text-center shadow-cute">
        <Mascot className="mx-auto h-20 w-20" />
        <p className="mt-3 font-bold">먼저 내 취향부터 찾아야 궁합을 보지!</p>
        <Link
          href="/quiz"
          className="mt-4 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-edge shadow-cute"
        >
          취향 찾기 하러 가기
        </Link>
      </div>
    );
  }

  const input =
    "w-full rounded-xl border-2 border-edge/40 bg-panel px-3 py-2.5 text-sm outline-none focus:border-candy";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">👻 방탈출 취향 궁합</h1>
        <p className="text-sm text-cream/70">
          친구들 취향을 넣으면 탈출귀가 궁합을 줄 세워줄게. (무료!)
        </p>
      </header>

      {/* 내 취향 + 공유 코드 */}
      <section className="rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-cream/60">내 취향</p>
            <p className="font-bold">
              {me.genre ? `${GENRE_EMOJI[me.genre]} ${me.genre}` : "장르 미정"} · 공포 {me.fear}/5 · 난이도 {me.diff}/5
            </p>
          </div>
          <button
            onClick={copyMyLink}
            className="rounded-xl border-2 border-edge bg-grape px-3 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            {copied ? "복사됨! 📋" : "🔗 궁합 링크 복사"}
          </button>
        </div>
        <p className="mt-3 break-all rounded-lg border border-edge/20 bg-ink p-2 text-xs text-cream/60">
          {myLink}
        </p>
        <p className="mt-1 text-xs text-cream/60">
          이 링크를 친구에게 보내면, 친구가 열자마자 우리 궁합이 바로 떠! (코드
          붙여넣기 필요 없음)
        </p>
      </section>

      {/* 친구 추가 */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
          <h2 className="font-extrabold">친구 직접 추가</h2>
          <input
            className={input}
            placeholder="친구 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className={input}
            value={genre}
            onChange={(e) => setGenre(e.target.value as Genre)}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {GENRE_EMOJI[g]} {g}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block font-bold text-cream/70">공포도 {fear}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={fear}
                onChange={(e) => setFear(Number(e.target.value))}
                className="candy-range w-full"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-bold text-cream/70">난이도 {diff}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={diff}
                onChange={(e) => setDiff(Number(e.target.value))}
                className="candy-range w-full"
              />
            </label>
          </div>
          <button
            onClick={addManual}
            className="w-full rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-edge shadow-cute transition active:scale-[0.97]"
          >
            추가
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
          <h2 className="font-extrabold">코드로 추가</h2>
          <p className="text-xs text-cream/60">
            친구가 보낸 취향 코드를 붙여넣어.
          </p>
          <textarea
            className={input}
            rows={4}
            placeholder="여기에 코드 붙여넣기"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={addByCode}
            className="w-full rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97] hover:border-candy"
          >
            코드로 추가
          </button>
        </div>
      </section>

      {/* 궁합 랭킹 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">🏆 궁합 랭킹</h2>
        {ranked.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-edge/50 py-10 text-center text-sm text-cream/60">
            친구를 추가하면 궁합 순위가 나와!
          </p>
        ) : (
          <ol className="space-y-2">
            {ranked.map((r, i) => (
              <li
                key={`${r.mate.name}-${i}`}
                className="flex items-center gap-3 rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute"
              >
                <span className="w-6 text-center text-lg font-extrabold text-cream/60">
                  {i + 1}
                </span>
                <span className="text-2xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {r.mate.name}{" "}
                    <span className="text-xs font-normal text-cream/60">
                      {r.mate.genre ? `${GENRE_EMOJI[r.mate.genre]} ${r.mate.genre}` : ""} · 공포 {r.mate.fear} · 난이도 {r.mate.diff}
                    </span>
                  </p>
                  <p className="truncate text-xs text-cream/70">
                    {r.tier} · {r.comment}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg border-2 border-edge bg-mint/10 px-2 py-1 text-sm font-extrabold text-mint">
                  {r.score}%
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 우리 팀 궁합: 친구가 한 명 이상이면 다 같이 갈 방을 고른다 */}
      {mates.length > 0 ? (
        <TeamPicks members={[me, ...mates]} />
      ) : (
        <p className="rounded-2xl border-2 border-dashed border-edge/50 p-4 text-center text-sm text-cream/60">
          👥 친구를 추가하면 <b>우리 팀 궁합</b>이랑 다 같이 갈 방도 골라 줄게!
        </p>
      )}

      <Link
        href="/quiz"
        className="inline-block text-sm font-bold text-cream/60 transition hover:text-cream/60"
      >
        ← 취향 다시 찾기
      </Link>
    </div>
  );
}
