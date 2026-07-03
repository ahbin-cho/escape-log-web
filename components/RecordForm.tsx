"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GENRES,
  emptyRecord,
  saveRecord,
  deleteRecord,
  type EscapeRecord,
  type Genre,
} from "@/lib/store";

type ScaleKey = "difficulty" | "fearLevel" | "rating";

const SCALE_ICON: Record<ScaleKey, [string, string]> = {
  difficulty: ["🔓", "🔒"],
  fearLevel: ["🤍", "👻"],
  rating: ["☆", "★"],
};

function Scale({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: ScaleKey;
  value: number;
  onChange: (name: ScaleKey, value: number) => void;
}) {
  const [empty, filled] = SCALE_ICON[name];
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-cream/70">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= Number(value);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(name, n === value ? 0 : n)}
              className={`flex h-10 flex-1 items-center justify-center rounded-lg border-2 text-lg transition active:scale-[0.9] ${
                active
                  ? "border-edge bg-candy/10"
                  : "border-edge/20 bg-transparent hover:border-edge/40"
              }`}
            >
              {active ? filled : empty}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const field =
  "w-full border-b-2 border-edge/30 bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-cream/45 focus:border-candy";

export default function RecordForm({
  initial,
  mode = "new",
}: {
  initial?: EscapeRecord;
  mode?: "new" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<EscapeRecord>(initial ?? emptyRecord());

  function set<K extends keyof EscapeRecord>(name: K, value: EscapeRecord[K]) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.themeName.trim()) {
      alert("테마명을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      await saveRecord({
        ...form,
        difficulty: Number(form.difficulty),
        fearLevel: Number(form.fearLevel),
        rating: Number(form.rating),
        hintCount: Number(form.hintCount) || 0,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      setSaving(false);
      if (err instanceof Error && err.message.includes("로그인")) {
        alert("기록을 저장하려면 로그인이 필요해요.");
        router.push("/login");
        return;
      }
      alert(err instanceof Error ? err.message : "저장에 실패했어요.");
    }
  }

  async function handleDelete() {
    if (!confirm("이 기록을 삭제할까요?")) return;
    try {
      await deleteRecord(form.id);
      router.push("/");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했어요.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-bold text-cream/70">테마명 *</label>
          <input
            className={field}
            value={form.themeName}
            onChange={(e) => set("themeName", e.target.value)}
            placeholder="예: 어느 폐가의 기록"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">매장명</label>
          <input
            className={field}
            value={form.cafeName}
            onChange={(e) => set("cafeName", e.target.value)}
            placeholder="예: 강남 방탈출"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">플레이 날짜</label>
          <input
            type="date"
            className={field}
            value={form.playedAt}
            onChange={(e) => set("playedAt", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">장르</label>
          <select
            className={field}
            value={form.genre}
            onChange={(e) => set("genre", e.target.value as Genre)}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-cream/70">
            <input
              type="checkbox"
              className="h-4 w-4 accent-mint"
              checked={form.success}
              onChange={(e) => set("success", e.target.checked)}
            />
            탈출 성공
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Scale label="난이도" name="difficulty" value={form.difficulty} onChange={set} />
        <Scale label="공포도" name="fearLevel" value={form.fearLevel} onChange={set} />
        <Scale label="별점" name="rating" value={form.rating} onChange={set} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">남은 시간</label>
          <input
            className={field}
            value={form.remainingTime}
            onChange={(e) => set("remainingTime", e.target.value)}
            placeholder="예: 3분 12초"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">사용 힌트 수</label>
          <input
            type="number"
            min="0"
            className={field}
            value={form.hintCount}
            onChange={(e) => set("hintCount", Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-cream/70">
          한줄 후기 <span className="font-normal text-cream/45">(스포일러 없이)</span>
        </label>
        <input
          className={field}
          value={form.oneLiner}
          onChange={(e) => set("oneLiner", e.target.value)}
          placeholder="분위기, 난이도 위주로"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-cream/70">
          메모 <span className="font-normal text-cream/45">(비공개)</span>
        </label>
        <textarea
          rows={4}
          className={field}
          value={form.memo}
          onChange={(e) => set("memo", e.target.value)}
          placeholder="상세 메모"
        />
      </div>

      <label className="rough flex cursor-pointer items-start gap-3 rounded-xl border-2 border-edge bg-panel p-4 shadow-cute">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 accent-candy"
          checked={form.isPublic}
          onChange={(e) => set("isPublic", e.target.checked)}
        />
        <span>
          <span className="block text-sm font-extrabold">🌏 공개 후기로 올리기</span>
          <span className="mt-0.5 block text-xs text-cream/60">
            켜면 <b>한줄 후기</b>만 닉네임과 함께 피드에 공개돼요. 비공개 메모는
            절대 노출되지 않아요.
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border-2 border-red-400/50 px-4 py-2 text-sm font-bold text-red-500 transition active:scale-[0.97] hover:bg-red-50"
          >
            삭제
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 rounded-xl border-2 border-edge/40 px-4 py-2 text-sm font-bold text-cream/70 transition active:scale-[0.97] hover:border-edge sm:flex-none"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rough flex-1 rounded-xl border-2 border-edge bg-candy px-6 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97] disabled:opacity-50 sm:flex-none"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
