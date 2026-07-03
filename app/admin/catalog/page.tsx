"use client";

import { useEffect, useState } from "react";
import { getCatalog, GENRES, type CandidateTheme, type Genre } from "@/lib/store";
import {
  saveCatalogItem,
  deleteCatalogItem,
  emptyCatalogItem,
  type CatalogInput,
} from "@/lib/admin";

const field =
  "w-full rounded-xl border-2 border-edge bg-ink px-3 py-2 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy";
const label = "mb-1 block text-sm font-bold text-cream/70";

export default function AdminCatalog() {
  const [items, setItems] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<CatalogInput | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const c = await getCatalog();
    setItems(c);
    setReady(true);
  }

  useEffect(() => {
    reload();
  }, []);

  function startNew() {
    setEditing(emptyCatalogItem());
  }
  function startEdit(c: CandidateTheme) {
    setEditing({ ...c });
  }

  function upd<K extends keyof CatalogInput>(k: K, v: CatalogInput[K]) {
    setEditing((e) => (e ? { ...e, [k]: v } : e));
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) {
      alert("테마명을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      await saveCatalogItem(editing);
      setEditing(null);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: CandidateTheme) {
    if (!confirm(`"${c.name}"를 카탈로그에서 삭제할까요?`)) return;
    try {
      await deleteCatalogItem(c.id);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  if (!ready) {
    return <p className="py-16 text-center text-cream/60">불러오는 중…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream/70">추천 후보 테마 {items.length}개</p>
        <button
          onClick={startNew}
          className="rough rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          + 테마 추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((c) => (
          <div
            key={c.id}
            className="rough flex flex-col gap-2 rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{c.name}</p>
                <p className="text-xs text-cream/60">{c.cafe}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-ink px-2 py-0.5 text-xs font-bold">
                {c.genre} · 난{c.difficulty} · 공{c.fearLevel}
              </span>
            </div>
            {c.tags.length > 0 && (
              <p className="text-xs font-bold text-cream/60">
                {c.tags.map((t) => `#${t}`).join(" ")}
              </p>
            )}
            <p className="line-clamp-2 text-xs text-cream/70">{c.teaser}</p>
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => startEdit(c)}
                className="rounded-lg border-2 border-edge px-3 py-1 text-xs font-bold transition active:scale-[0.97]"
              >
                수정
              </button>
              <button
                onClick={() => remove(c)}
                className="rounded-lg border-2 border-red-400/60 px-3 py-1 text-xs font-bold text-red-500 transition active:scale-[0.97] hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-edge/40 p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="my-8 w-full max-w-lg space-y-3 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold">
              {editing.id ? "테마 수정" : "새 테마"}
            </h2>
            <div>
              <label className={label}>테마명 *</label>
              <input
                className={field}
                value={editing.name}
                onChange={(e) => upd("name", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>매장명</label>
              <input
                className={field}
                value={editing.cafe}
                onChange={(e) => upd("cafe", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>장르</label>
                <select
                  className={field}
                  value={editing.genre}
                  onChange={(e) => upd("genre", e.target.value as Genre)}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>난이도</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className={field}
                  value={editing.difficulty}
                  onChange={(e) => upd("difficulty", Number(e.target.value))}
                />
              </div>
              <div>
                <label className={label}>공포도</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className={field}
                  value={editing.fearLevel}
                  onChange={(e) => upd("fearLevel", Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className={label}>태그 (쉼표로 구분)</label>
              <input
                className={field}
                value={editing.tags.join(", ")}
                onChange={(e) =>
                  upd(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="귀신, 몰입, 청각연출"
              />
            </div>
            <div>
              <label className={label}>티저 (무스포)</label>
              <textarea
                rows={2}
                className={field}
                value={editing.teaser}
                onChange={(e) => upd("teaser", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>힌트 (약스포)</label>
              <textarea
                rows={2}
                className={field}
                value={editing.hint}
                onChange={(e) => upd("hint", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>스포일러 (풀스포)</label>
              <textarea
                rows={2}
                className={field}
                value={editing.spoiler}
                onChange={(e) => upd("spoiler", e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded-xl border-2 border-edge/40 px-4 py-2 text-sm font-bold text-cream/70 transition active:scale-[0.97] hover:border-edge"
              >
                취소
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rough rounded-xl border-2 border-edge bg-candy px-5 py-2 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97] disabled:opacity-50"
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
