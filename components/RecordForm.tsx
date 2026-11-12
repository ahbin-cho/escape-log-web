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
  saveGuestRecord,
  type EscapeRecord,
  type Genre,
  type CandidateTheme,
} from "@/lib/store";
import { REGIONS, regionFromText } from "@/lib/region";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { trackAttributionEvent } from "@/lib/track";
import { fearLabel, RATING_LABELS, RATING_EMOJI } from "@/lib/terms";

// ── 작은 입력 부품: 굵은 테두리·이모지 대신 면(面)과 주황 포인트 하나로 ──
const card = "rounded-2xl border border-edge/10 bg-panel p-4 sm:p-5";
const field =
  "w-full rounded-xl border border-edge/10 bg-ink/60 px-3.5 py-3 text-[15px] outline-none transition placeholder:text-cream/35 focus:border-candy focus:bg-panel";
const labelCls = "mb-1.5 block text-[13px] font-bold text-cream/60";

function SectionTitle({ step, title, sub }: { step: string; title: string; sub?: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <span className="text-[11px] font-extrabold tracking-[0.2em] text-candy">{step}</span>
      <h2 className="text-base font-extrabold">{title}</h2>
      {sub && <span className="text-xs text-cream/45">{sub}</span>}
    </div>
  );
}

// 별점: 단계마다 자기 아이콘(흙길 🟤 → 인생테마 🏆). 고른 칸만 크게, 나머지는 흐리게
function RatingPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="별점">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n === value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(on ? 0 : n)}
            className={`flex flex-col items-center gap-1 rounded-2xl py-3 transition active:scale-95 ${
              on ? "bg-candy/15 ring-2 ring-candy" : "bg-edge/[0.04] hover:bg-edge/[0.07]"
            }`}
          >
            <span
              className={`text-[28px] leading-none transition ${
                on ? "scale-110" : value && n > value ? "opacity-30 grayscale" : "opacity-80"
              }`}
            >
              {RATING_EMOJI[n - 1]}
            </span>
            <span className={`text-[11px] font-extrabold ${on ? "text-candy" : "text-cream/45"}`}>
              {RATING_LABELS[n - 1]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// 난이도·공포도: 기존 아이콘(🔒·👻)이 차오른다. 안 찬 칸은 흐린 흑백
function IconMeter({
  label,
  icon,
  value,
  onChange,
  caption,
}: {
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
  caption: string;
}) {
  return (
    <div className="rounded-2xl bg-edge/[0.04] p-3.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-bold text-cream/60">{label}</span>
        <span className="text-[13px] font-extrabold text-candy">{caption}</span>
      </div>
      <div className="flex justify-between" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = n <= value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`${label} ${n}`}
              onClick={() => onChange(n === value ? 0 : n)}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-[22px] transition active:scale-90 ${
                on ? "bg-panel shadow-sm" : "opacity-25 grayscale hover:opacity-40"
              } ${n === value ? "scale-110" : ""}`}
            >
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const DIFFICULTY_WORDS = ["술술", "무난", "적당", "빡셈", "극악"];

function Stepper({
  value,
  onChange,
  unit,
  min = 0,
  max = 99,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  unit: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full bg-edge/[0.06] text-lg font-bold transition active:scale-90 disabled:opacity-30";
  return (
    <div className={`flex items-center gap-3 ${disabled ? "opacity-40" : ""}`}>
      <button type="button" className={btn} disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="줄이기">
        −
      </button>
      <span className="min-w-[3.5rem] text-center text-lg font-extrabold tabular-nums">
        {value}
        <span className="ml-0.5 text-xs font-bold text-cream/45">{unit}</span>
      </span>
      <button type="button" className={btn} disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="늘리기">
        +
      </button>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-candy" : "bg-edge/15"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export default function RecordForm({
  initial,
  mode = "new",
}: {
  initial?: EscapeRecord;
  mode?: "new" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<EscapeRecord>(
    initial ?? { ...emptyRecord(), playedAt: todayKst() },
  );

  function set<K extends keyof EscapeRecord>(name: K, value: EscapeRecord[K]) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  // 힌트 수: 숫자만 입력(빈칸 허용), 옆의 "무한" 체크 시 -1 로 저장.
  const [hintUnlimited, setHintUnlimited] = useState(
    (initial?.hintCount ?? 0) < 0,
  );
  const [hintCount, setHintCount] = useState(
    initial && initial.hintCount > 0 ? initial.hintCount : 0,
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // 비회원이면 저장 시 이 기기에 임시 저장 → 가입 화면으로. null = 확인 중
  const [guest, setGuest] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setGuest(false);
      return;
    }
    createClient()
      .auth.getUser()
      .then(({ data }) => setGuest(!data.user));
  }, []);

  // ── 카탈로그에서 브랜드/테마 골라 자동입력 (선택) ──
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [themeQuery, setThemeQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  // 목록에서 고른 테마(고르면 요약 카드로 보여 주고, 직접 입력 칸은 접는다)
  const [picked, setPicked] = useState<CandidateTheme | null>(null);
  const [manual, setManual] = useState(mode === "edit");
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

  // 테마 상세의 "이 방 기록하기"(/new?theme=<id>)로 들어오면 그 테마로 채워 둔다
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (mode !== "new" || prefilled || catalog.length === 0) return;
    setPrefilled(true);
    const id = new URLSearchParams(window.location.search).get("theme");
    if (id) applyTheme(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, mode, prefilled]);

  function applyTheme(id: string) {
    const t = catalog.find((c) => c.id === id);
    if (!t) return;
    setPicked(t);
    setManual(false);
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
    const record = {
      ...form,
      difficulty: Number(form.difficulty),
      fearLevel: Number(form.fearLevel),
      rating: Number(form.rating),
      hintCount: hintUnlimited ? -1 : hintCount,
    };
    if (guest && mode === "new") {
      // 비회원: 이 기기에 먼저 저장하고, 가입하면 계정으로 옮긴다
      saveGuestRecord(record);
      if (mode === "new") trackAttributionEvent("record_saved");
      router.push("/login?mode=signup&guest=1&next=/records");
      return;
    }
    try {
      await saveRecord(record);
      if (mode === "new") trackAttributionEvent("record_saved");
      router.push("/");
      router.refresh();
    } catch (err) {
      setSaving(false);
      if (err instanceof Error && err.message.includes("로그인")) {
        saveGuestRecord(record);
        router.push("/login?mode=signup&guest=1&next=/records");
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

  const showManual = manual || !picked || catalog.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-28">
      {guest && mode === "new" && (
        <p className="rounded-2xl bg-candy/10 px-4 py-3 text-[13px] leading-relaxed text-cream/75">
          로그인 없이 먼저 써 보세요. 저장하면 이 기기에 보관되고, <b>10초 가입</b>하면 계정으로 옮겨 드려요.
        </p>
      )}

      {/* 01 어떤 방 */}
      <section className={card}>
        <SectionTitle step="01" title="어떤 방이었어요?" />

        {mode === "new" && catalog.length > 0 && !picked && (
          <div className="space-y-2.5">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/35">⌕</span>
              <input
                value={themeQuery}
                onChange={(e) => {
                  setThemeQuery(e.target.value);
                  setPickerOpen(true);
                }}
                onFocus={() => setPickerOpen(true)}
                placeholder="테마나 매장 이름으로 찾기"
                className={`${field} pl-9`}
              />
            </div>
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5">
              {["", ...brands].map((b) => (
                <button
                  key={b || "all"}
                  type="button"
                  onClick={() => {
                    setBrandFilter(b);
                    setPickerOpen(true);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-[0.97] ${
                    brandFilter === b ? "bg-edge text-white" : "bg-edge/[0.06] text-cream/60"
                  }`}
                >
                  {b || "전체"}
                </button>
              ))}
            </div>
            {pickerOpen && (
              <div className="max-h-64 overflow-y-auto rounded-xl border border-edge/10 bg-panel">
                {results.length === 0 ? (
                  <p className="p-4 text-[13px] text-cream/50">찾는 방이 없어요. 아래에 직접 적어 주세요.</p>
                ) : (
                  results.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        applyTheme(t.id);
                        setThemeQuery("");
                        setPickerOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 border-b border-edge/[0.06] px-4 py-3 text-left last:border-0 hover:bg-candy/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{t.name}</span>
                        <span className="block truncate text-xs text-cream/50">{t.cafe}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-edge/[0.06] px-2 py-0.5 text-[11px] font-bold text-cream/55">
                        {t.genre}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {picked && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-edge px-4 py-3.5 text-white">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold">{form.themeName}</p>
              <p className="truncate text-xs text-white/60">
                {form.cafeName} · {form.genre}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setManual(false);
              }}
              className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"
            >
              바꾸기
            </button>
          </div>
        )}

        {showManual ? (
          <>
          {mode === "new" && catalog.length > 0 && !picked && (
            <div className="mt-5 flex items-center gap-3 text-[11px] font-bold text-cream/35">
              <span className="h-px flex-1 bg-edge/10" />
              목록에 없으면 직접 적기
              <span className="h-px flex-1 bg-edge/10" />
            </div>
          )}
          <div className={`grid gap-3 sm:grid-cols-2 ${picked || (mode === "new" && catalog.length > 0) ? "mt-4" : ""}`}>
            <div className="sm:col-span-2">
              <label className={labelCls}>테마명 *</label>
              <input className={field} value={form.themeName} onChange={(e) => set("themeName", e.target.value)} placeholder="예: 어느 폐가의 기록" />
            </div>
            <div>
              <label className={labelCls}>매장명</label>
              <input className={field} value={form.cafeName} onChange={(e) => set("cafeName", e.target.value)} placeholder="예: 강남 방탈출" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>장르</label>
                <select className={field} value={form.genre} onChange={(e) => set("genre", e.target.value as Genre)}>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>지역</label>
                <select className={field} value={form.region} onChange={(e) => set("region", e.target.value)}>
                  <option value="">자동</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          </>
        ) : (
          <button type="button" onClick={() => setManual(true)} className="mt-2 text-xs font-bold text-cream/45 underline underline-offset-2">
            정보 직접 고치기
          </button>
        )}
      </section>

      {/* 02 결과 */}
      <section className={card}>
        <SectionTitle step="02" title="결과는요?" />
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-edge/[0.06] p-1">
          {[
            { v: true, t: "탈출 성공" },
            { v: false, t: "아쉽게 실패" },
          ].map((o) => (
            <button
              key={o.t}
              type="button"
              aria-pressed={form.success === o.v}
              onClick={() => set("success", o.v)}
              className={`rounded-lg py-3 text-sm font-extrabold transition ${
                form.success === o.v ? (o.v ? "bg-mint text-white shadow-sm" : "bg-panel text-cream shadow-sm") : "text-cream/45"
              }`}
            >
              {o.t}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>다녀온 날</label>
            <input type="date" className={field} value={form.playedAt} onChange={(e) => set("playedAt", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>남은 시간</label>
            <input className={field} value={form.remainingTime} onChange={(e) => set("remainingTime", e.target.value)} placeholder={form.success ? "예: 3분 12초" : "실패면 비워 둬도 돼요"} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-bold text-cream/60">사용한 힌트</span>
              <label className="flex items-center gap-2 text-xs font-bold text-cream/50">
                무제한
                <Toggle checked={hintUnlimited} onChange={setHintUnlimited} label="힌트 무제한" />
              </label>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-ink/60 px-2 py-1.5">
              <Stepper value={hintCount} onChange={setHintCount} unit="개" disabled={hintUnlimited} />
              {!hintUnlimited && hintCount === 0 && form.success && (
                <span className="mr-2 rounded-full bg-candy/15 px-2.5 py-1 text-[11px] font-extrabold text-candy">노힌트!</span>
              )}
            </div>
          </div>
          <div>
            <span className={labelCls}>함께한 인원</span>
            <div className="rounded-xl bg-ink/60 px-2 py-1.5">
              <Stepper value={form.partySize} onChange={(v) => set("partySize", v)} unit="명" max={20} />
            </div>
          </div>
        </div>
      </section>

      {/* 03 평가 */}
      <section className={card}>
        <SectionTitle step="03" title="어땠어요?" />
        <p className="mb-2 text-[13px] font-bold text-cream/60">이 방은 어떤 길이었나요?</p>
        <RatingPicker value={form.rating} onChange={(v) => set("rating", v)} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <IconMeter
            label="난이도"
            icon="🔒"
            value={form.difficulty}
            onChange={(v) => set("difficulty", v)}
            caption={form.difficulty ? `${DIFFICULTY_WORDS[form.difficulty - 1]} · ${form.difficulty}/5` : ""}
          />
          <IconMeter
            label="공포도"
            icon="👻"
            value={form.fearLevel}
            onChange={(v) => set("fearLevel", v)}
            caption={fearLabel(form.fearLevel)}
          />
        </div>
        <div className="mt-4">
          <span className={labelCls}>
            테마 유형 <span className="font-normal text-cream/40">선택</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {["장치", "자물쇠", "문제", "혼합"].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={form.themeType === t}
                onClick={() => set("themeType", form.themeType === t ? "" : t)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition active:scale-[0.97] ${
                  form.themeType === t ? "bg-edge text-white" : "bg-edge/[0.06] text-cream/60"
                }`}
              >
                {t}방
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 04 남기기 */}
      <section className={card}>
        <SectionTitle step="04" title="한마디 남기기" />
        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              한줄 후기 <span className="font-normal text-cream/40">스포 없이</span>
            </label>
            <input className={field} value={form.oneLiner} onChange={(e) => set("oneLiner", e.target.value)} placeholder="분위기, 난이도 위주로" />
          </div>
          <div>
            <label className={labelCls}>
              메모 <span className="font-normal text-cream/40">나만 보기 · 스포 OK</span>
            </label>
            <textarea rows={3} className={`${field} resize-none`} value={form.memo} onChange={(e) => set("memo", e.target.value)} placeholder="기억하고 싶은 장면, 같이 간 사람 이야기" />
          </div>
          <div>
            <span className={labelCls}>
              인증샷 <span className="font-normal text-cream/40">선택</span>
            </span>
            {guest ? (
              <p className="rounded-xl bg-ink/60 px-3.5 py-3 text-[13px] text-cream/50">인증샷은 가입한 뒤에 올릴 수 있어요. 기록은 지금 저장돼요.</p>
            ) : (
              <div className="flex items-center gap-3">
                <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-edge/20 bg-ink/60 text-2xl text-cream/30">
                  {form.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoUrl} alt="첨부 사진" className="h-full w-full object-cover" />
                  ) : (
                    "+"
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                </label>
                <div className="text-xs text-cream/50">
                  {uploading ? (
                    <p className="font-bold text-candy">올리는 중…</p>
                  ) : form.photoUrl ? (
                    <button type="button" onClick={() => set("photoUrl", "")} className="font-bold text-red-500 underline">
                      사진 빼기
                    </button>
                  ) : (
                    <p>눌러서 사진 고르기</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl bg-ink/60 px-4 py-3.5">
            <div>
              <p className="text-sm font-extrabold">공개 후기로 올리기</p>
              <p className="mt-0.5 text-xs leading-relaxed text-cream/50">
                한줄 후기·사진이 닉네임과 함께 피드에 보여요. 메모는 절대 공개되지 않아요. 첫 후기면 🥇 배지가 붙어요.
              </p>
            </div>
            <Toggle checked={form.isPublic} onChange={(v) => set("isPublic", v)} label="공개 후기로 올리기" />
          </div>
        </div>
      </section>

      {mode === "edit" && (
        <button type="button" onClick={handleDelete} className="w-full py-2 text-sm font-bold text-red-500/80 underline underline-offset-2">
          이 기록 삭제
        </button>
      )}

      {/* 저장 바: 화면 아래에 붙어 있다 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-edge/10 bg-ink/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl px-4 py-3.5 text-sm font-bold text-cream/55 transition active:scale-[0.97]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-edge py-3.5 text-[15px] font-extrabold text-white transition active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "저장 중…" : guest && mode === "new" ? "저장하고 기록 지키기" : "기록 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
