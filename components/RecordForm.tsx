"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GENRES,
  emptyRecord,
  saveRecord,
  deleteRecord,
  uploadRecordPhoto,
  getCatalog,
  type EscapeRecord,
  type Genre,
  type CandidateTheme,
} from "@/lib/store";
import { REGIONS, regionFromText } from "@/lib/region";

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
      <label className="mb-1.5 block text-sm font-bold text-cream/70">
        {label}
      </label>
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

  // 힌트 수: 숫자만 입력(빈칸 허용), 옆의 "무한" 체크 시 -1 로 저장.
  const [hintUnlimited, setHintUnlimited] = useState(
    (initial?.hintCount ?? 0) < 0,
  );
  const [hintRaw, setHintRaw] = useState(
    initial && initial.hintCount > 0 ? String(initial.hintCount) : "",
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ── 카탈로그에서 브랜드/테마 골라 자동입력 (선택) ──
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [themeQuery, setThemeQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (mode === "new") getCatalog().then(setCatalog);
  }, [mode]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    catalog.forEach((t) => {
      const b = (t.cafe || "").split(" ")[0];
      if (b) s.add(b);
    });
    return [...s];
  }, [catalog]);

  const results = useMemo(() => {
    const q = themeQuery.trim().toLowerCase();
    return catalog
      .filter(
        (t) => !brandFilter || (t.cafe || "").split(" ")[0] === brandFilter,
      )
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          (t.cafe || "").toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [catalog, brandFilter, themeQuery]);

  function applyTheme(id: string) {
    const t = catalog.find((c) => c.id === id);
    if (!t) return;
    const genre = (GENRES as string[]).includes(t.genre)
      ? (t.genre as Genre)
      : "기타";
    setForm((f) => ({
      ...f,
      themeName: t.name,
      cafeName: t.cafe,
      genre,
      difficulty: t.difficulty || f.difficulty,
      fearLevel: t.fearLevel || f.fearLevel,
      region: regionFromText(t.cafe) ?? f.region,
    }));
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadRecordPhoto(file);
      set("photoUrl", url);
    } catch (err) {
      alert(
        err instanceof Error
          ? `사진 업로드 실패: ${err.message}`
          : "사진 업로드 실패",
      );
    } finally {
      setUploading(false);
    }
  }

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
        hintCount: hintUnlimited ? -1 : hintRaw === "" ? 0 : Number(hintRaw),
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
      {mode === "new" && catalog.length > 0 && (
        <div className="space-y-2 rounded-xl border-2 border-edge bg-ink p-3">
          <p className="text-sm font-bold text-cream/70">
            🔎 가진 테마에서 불러오기{" "}
            {/* <span className="font-normal text-cream/55">
              (선택 · 고르면 자동 입력돼요. 없으면 아래에 직접 입력)
            </span> */}
          </p>
          {/* 브랜드 칩: 가로 스크롤 대신 여러 줄로 wrap */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setBrandFilter("")}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition active:scale-[0.97] ${
                brandFilter === ""
                  ? "border-candy bg-candy/10 text-candy"
                  : "border-edge/20 bg-panel text-cream/60"
              }`}
            >
              전체
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrandFilter(b)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition active:scale-[0.97] ${
                  brandFilter === b
                    ? "border-candy bg-candy/10 text-candy"
                    : "border-edge/20 bg-panel text-cream/60"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <input
            value={themeQuery}
            onChange={(e) => {
              setThemeQuery(e.target.value);
              setPickerOpen(true);
            }}
            onFocus={() => setPickerOpen(true)}
            placeholder="테마 이름 검색"
            className={field}
          />
          {pickerOpen && (
            <div className="max-h-56 overflow-y-auto rounded-lg border-2 border-edge/30 bg-panel">
              {results.length === 0 ? (
                <p className="p-3 text-xs text-cream/55">검색 결과가 없어요</p>
              ) : (
                results.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      applyTheme(t.id);
                      setThemeQuery(t.name);
                      setPickerOpen(false);
                    }}
                    className="flex w-full items-baseline justify-between gap-2 border-b border-edge/10 px-3 py-2 text-left last:border-0 hover:bg-candy/5"
                  >
                    <span className="truncate text-sm font-bold">{t.name}</span>
                    <span className="shrink-0 text-[11px] font-bold text-cream/55">
                      {t.cafe}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            테마명 *
          </label>
          <input
            className={field}
            value={form.themeName}
            onChange={(e) => set("themeName", e.target.value)}
            placeholder="예: 어느 폐가의 기록"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            매장명
          </label>
          <input
            className={field}
            value={form.cafeName}
            onChange={(e) => set("cafeName", e.target.value)}
            placeholder="예: 강남 방탈출"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            지역 (시/도){" "}
            <span className="font-normal text-cream/55">(선택)</span>
          </label>
          <select
            className={field}
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          >
            <option value="">자동 (매장명으로 추측)</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            플레이 날짜
          </label>
          <input
            type="date"
            className={field}
            value={form.playedAt}
            onChange={(e) => set("playedAt", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            장르
          </label>
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

        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            함께한 인원 <span className="font-normal text-cream/55">(명)</span>
          </label>
          <input
            inputMode="numeric"
            className={field}
            value={form.partySize ? String(form.partySize) : ""}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              set("partySize", v === "" ? 0 : Number(v));
            }}
            placeholder="예: 3"
          />
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
        <Scale
          label="난이도"
          name="difficulty"
          value={form.difficulty}
          onChange={set}
        />
        <Scale
          label="공포도"
          name="fearLevel"
          value={form.fearLevel}
          onChange={set}
        />
        <Scale label="별점" name="rating" value={form.rating} onChange={set} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            남은 시간
          </label>
          <input
            className={field}
            value={form.remainingTime}
            onChange={(e) => set("remainingTime", e.target.value)}
            placeholder="예: 3분 12초"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            사용 힌트 수
          </label>
          <div className="flex items-center gap-3">
            <input
              inputMode="numeric"
              className={`${field} flex-1`}
              value={hintUnlimited ? "" : hintRaw}
              onChange={(e) =>
                setHintRaw(e.target.value.replace(/[^0-9]/g, ""))
              }
              disabled={hintUnlimited}
              placeholder={hintUnlimited ? "무한" : "예: 2"}
            />
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-bold text-cream/70">
              <input
                type="checkbox"
                className="h-4 w-4 accent-mint"
                checked={hintUnlimited}
                onChange={(e) => setHintUnlimited(e.target.checked)}
              />
              무한
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-cream/70">
          한줄 후기{" "}
          <span className="font-normal text-cream/45">(스포일러 없이)</span>
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

      <div>
        <label className="mb-1.5 block text-sm font-bold text-cream/70">
          사진{" "}
          <span className="font-normal text-cream/55">
            (인증샷 한 장, 선택)
          </span>
        </label>
        <div className="flex items-center gap-3">
          {form.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.photoUrl}
              alt="첨부 사진"
              className="h-24 w-24 shrink-0 rounded-xl border-2 border-edge object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-edge/40 text-2xl">
              📷
            </div>
          )}
          <div className="space-y-1.5">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
              className="block w-full text-xs font-bold file:mr-2 file:rounded-lg file:border-2 file:border-edge file:bg-panel file:px-3 file:py-1.5 file:text-xs file:font-bold"
            />
            {uploading && (
              <p className="text-xs font-bold text-candy">업로드 중…</p>
            )}
            {form.photoUrl && (
              <button
                type="button"
                onClick={() => set("photoUrl", "")}
                className="text-xs font-bold text-red-500 underline"
              >
                사진 제거
              </button>
            )}
          </div>
        </div>
      </div>

      <label className="rough flex cursor-pointer items-start gap-3 rounded-xl border-2 border-edge bg-panel p-4 shadow-cute">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 accent-candy"
          checked={form.isPublic}
          onChange={(e) => set("isPublic", e.target.checked)}
        />
        <span>
          <span className="block text-sm font-extrabold">
            🌏 공개 후기로 올리기
          </span>
          <span className="mt-0.5 block text-xs text-cream/60">
            켜면 <b>한줄 후기·사진</b>이 닉네임과 함께 피드에 공개돼요. 비공개
            메모는 절대 노출되지 않아요.
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
