"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getSavedQuiz,
  GENRES,
  GENRE_EMOJI,
  type Genre,
} from "@/lib/store";
import {
  encodeTaste,
  decodeTaste,
  rankMates,
  type MateTaste,
} from "@/lib/match";

export default function MatchPage() {
  const [me, setMe] = useState<MateTaste | null>(null);
  const [mates, setMates] = useState<MateTaste[]>([]);
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
    if (saved) {
      setMe({
        name: "나",
        genre: saved.taste.topGenre,
        fear: Math.round(saved.taste.fearComfort),
        diff: Math.round(saved.taste.difficultyFit),
      });
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

  function copyMyCode() {
    if (!myCode) return;
    navigator.clipboard?.writeText(myCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!ready) {
    return <p className="py-20 text-center text-cream/30">불러오는 중…</p>;
  }

  if (!me) {
    return (
      <div className="rounded-2xl border-2 border-edge bg-panel p-8 text-center shadow-cute">
        <p className="text-3xl">👻</p>
        <p className="mt-3 font-bold">먼저 내 취향부터 찾아야 궁합을 보지!</p>
        <Link
          href="/quiz"
          className="mt-4 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute"
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
        <h1 className="text-2xl font-extrabold">👻 방탈출 취향 궁합</h1>
        <p className="text-sm text-cream/50">
          친구들 취향을 넣으면 탈출귀가 궁합을 줄 세워줄게. (무료!)
        </p>
      </header>

      {/* 내 취향 + 공유 코드 */}
      <section className="rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-cream/40">내 취향</p>
            <p className="font-bold">
              {me.genre ? `${GENRE_EMOJI[me.genre]} ${me.genre}` : "장르 미정"} · 공포 {me.fear}/5 · 난이도 {me.diff}/5
            </p>
          </div>
          <button
            onClick={copyMyCode}
            className="rounded-xl border-2 border-edge bg-grape px-3 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            {copied ? "복사됨!" : "내 코드 복사"}
          </button>
        </div>
        <p className="mt-3 break-all rounded-lg border border-edge/20 bg-ink p-2 text-xs text-cream/40">
          {myCode}
        </p>
        <p className="mt-1 text-xs text-cream/40">
          이 코드를 친구에게 보내면, 친구가 아래 “코드로 추가”에 넣어 궁합을 볼 수 있어.
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
              <span className="mb-1 block font-bold text-cream/50">공포도 {fear}</span>
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
              <span className="mb-1 block font-bold text-cream/50">난이도 {diff}</span>
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
            className="w-full rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            추가
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
          <h2 className="font-extrabold">코드로 추가</h2>
          <p className="text-xs text-cream/40">
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
          <p className="rounded-2xl border-2 border-dashed border-edge/50 py-10 text-center text-sm text-cream/40">
            친구를 추가하면 궁합 순위가 나와!
          </p>
        ) : (
          <ol className="space-y-2">
            {ranked.map((r, i) => (
              <li
                key={`${r.mate.name}-${i}`}
                className="flex items-center gap-3 rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute"
              >
                <span className="w-6 text-center text-lg font-extrabold text-cream/40">
                  {i + 1}
                </span>
                <span className="text-2xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {r.mate.name}{" "}
                    <span className="text-xs font-normal text-cream/40">
                      {r.mate.genre ? `${GENRE_EMOJI[r.mate.genre]} ${r.mate.genre}` : ""} · 공포 {r.mate.fear} · 난이도 {r.mate.diff}
                    </span>
                  </p>
                  <p className="truncate text-xs text-cream/50">
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

      <Link
        href="/quiz"
        className="inline-block text-sm font-bold text-cream/40 transition hover:text-cream/60"
      >
        ← 취향 다시 찾기
      </Link>
    </div>
  );
}
