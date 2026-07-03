"use client";

import { useEffect, useState } from "react";
import { getCatalog, GENRES, type CandidateTheme, type Genre } from "@/lib/store";
import {
  saveCatalogItem,
  deleteCatalogItem,
  emptyCatalogItem,
  uploadPoster,
  type CatalogInput,
} from "@/lib/admin";

const field =
  "w-full rounded-xl border-2 border-edge bg-ink px-3 py-2 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy";
const label = "mb-1 block text-sm font-bold text-cream/70";

// "키이스케이프 우주라이크" → { brand: '키이스케이프', branch: '우주라이크' }
function splitCafe(cafe = "") {
  const [brand, ...rest] = cafe.split(" ");
  return { brand, branch: rest.join(" ") };
}

export default function AdminCatalog() {
  const [items, setItems] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<CatalogInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handlePoster(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPoster(file);
      upd("posterUrl", url);
    } catch (e) {
      alert(
        e instanceof Error
          ? `포스터 업로드 실패: ${e.message}`
          : "포스터 업로드 실패"
      );
    } finally {
      setUploading(false);
    }
  }

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
            <div className="flex items-start gap-3">
              {c.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.posterUrl}
                  alt={c.name}
                  className="h-20 w-16 shrink-0 rounded-lg border-2 border-edge object-cover"
                />
              )}
              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  {splitCafe(c.cafe).brand && (
                    <span className="mb-1 inline-block rounded-md border-2 border-edge bg-candy px-2 py-0.5 text-[11px] font-extrabold text-white">
                      {splitCafe(c.cafe).brand}
                    </span>
                  )}
                  <p className="truncate font-extrabold">{c.name}</p>
                  {splitCafe(c.cafe).branch && (
                    <p className="truncate text-xs font-bold text-cream/60">
                      📍 {splitCafe(c.cafe).branch}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs font-bold text-cream/55">
                    {c.timeLimit ? `${c.timeLimit}분` : ""}
                    {c.players ? ` · ${c.players}인` : ""}
                    {c.price ? ` · ${c.price.toLocaleString()}원` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-ink px-2 py-0.5 text-xs font-bold">
                  {c.genre} · 난{c.difficulty} · 공{c.fearLevel}
                </span>
              </div>
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
              <label className={label}>포스터</label>
              <div className="flex items-center gap-3">
                {editing.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editing.posterUrl}
                    alt="포스터 미리보기"
                    className="h-24 w-[4.5rem] shrink-0 rounded-lg border-2 border-edge object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-[4.5rem] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-edge/40 text-2xl">
                    🖼️
                  </div>
                )}
                <div className="space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePoster(e.target.files?.[0])}
                    className="block w-full text-xs font-bold file:mr-2 file:rounded-lg file:border-2 file:border-edge file:bg-panel file:px-3 file:py-1.5 file:text-xs file:font-bold"
                  />
                  {uploading && (
                    <p className="text-xs font-bold text-candy">업로드 중…</p>
                  )}
                  {editing.posterUrl && (
                    <button
                      type="button"
                      onClick={() => upd("posterUrl", "")}
                      className="text-xs font-bold text-red-500 underline"
                    >
                      포스터 제거
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                  inputMode="numeric"
                  className={field}
                  value={String(editing.difficulty)}
                  onChange={(e) =>
                    upd("difficulty", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
                  }
                />
              </div>
              <div>
                <label className={label}>공포도</label>
                <input
                  inputMode="numeric"
                  className={field}
                  value={String(editing.fearLevel)}
                  onChange={(e) =>
                    upd("fearLevel", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
                  }
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
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>제한시간(분)</label>
                <input
                  inputMode="numeric"
                  className={field}
                  value={editing.timeLimit ? String(editing.timeLimit) : ""}
                  onChange={(e) =>
                    upd("timeLimit", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
                  }
                />
              </div>
              <div>
                <label className={label}>인원</label>
                <input
                  className={field}
                  value={editing.players ?? ""}
                  onChange={(e) => upd("players", e.target.value)}
                  placeholder="예: 2~4"
                />
              </div>
              <div>
                <label className={label}>가격(1인)</label>
                <input
                  inputMode="numeric"
                  className={field}
                  value={editing.price ? String(editing.price) : ""}
                  onChange={(e) =>
                    upd("price", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)
                  }
                  placeholder="원"
                />
              </div>
            </div>
            <div>
              <label className={label}>예약/상세 링크</label>
              <input
                className={field}
                value={editing.reservationUrl ?? ""}
                onChange={(e) => upd("reservationUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={label}>줄거리 / 소개 (무스포)</label>
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
