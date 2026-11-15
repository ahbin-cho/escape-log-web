"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_COLS, SITE_KINDS, safePath, type SiteItemRow, type SiteKind } from "@/lib/site-items";

// 사이트 문구·목록 관리: 홈 '많이 찾는' 칩, 홈 배너. 저장하면 바로(새로고침 시) 사이트에 보여요.

const field =
  "w-full rounded-xl border-2 border-edge bg-ink px-3 py-2 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy";
const label = "mb-1 block text-sm font-bold text-cream/70";
const hint = "mt-1 text-xs text-cream/50";

type Form = Omit<SiteItemRow, "id" | "until"> & { id: number | null; until: string };

const kst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

const blank = (kind: SiteKind, sort: number): Form => ({
  id: null,
  kind,
  label: "",
  body: "",
  cta: kind === "banner" ? "보러 가기" : "",
  href: "",
  art: kind === "banner" ? "/mascot.png" : "",
  tone: "candy",
  ad: false,
  sort,
  active: true,
  until: "",
});

export default function AdminSite() {
  const [rows, setRows] = useState<SiteItemRow[]>([]);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const { data, error } = await createClient().from("site_items").select(SITE_COLS).order("sort").order("id");
    setMissing(!!error);
    setRows((data as unknown as SiteItemRow[]) ?? []);
    setReady(true);
  }
  useEffect(() => {
    reload();
  }, []);

  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function save() {
    if (!form) return;
    if (!form.label.trim()) return alert(form.kind === "chip" ? "칩 글자를 적어 주세요." : "배너 제목을 적어 주세요.");
    if (form.href.trim() && !safePath(form.href)) return alert("주소는 사이트 안 주소만 돼요. /로 시작해 주세요. 예: /region/수원");
    if (form.kind === "banner" && !safePath(form.href)) return alert("배너는 누르면 갈 주소가 꼭 있어야 해요. 예: /immersive");
    if (form.kind === "banner" && !safePath(form.art)) return alert("배너 그림 주소를 /로 시작하게 적어 주세요. 예: /mascot.png");
    setSaving(true);
    const { id, until, ...rest } = form;
    const payload = { ...rest, label: rest.label.trim(), href: rest.href.trim(), until: until || null };
    const db = createClient().from("site_items");
    const { error } = id === null ? await db.insert(payload) : await db.update(payload).eq("id", id);
    setSaving(false);
    if (error) return alert(`저장 실패: ${error.message}`);
    setForm(null);
    reload();
  }

  async function patch(id: number, v: Partial<SiteItemRow>) {
    const { error } = await createClient().from("site_items").update(v).eq("id", id);
    if (error) return alert(`실패: ${error.message}`);
    reload();
  }

  async function remove(id: number) {
    if (!confirm("이 줄을 지울까요? (잠깐 숨기려면 '숨기기'를 누르세요)")) return;
    const { error } = await createClient().from("site_items").delete().eq("id", id);
    if (error) return alert(`삭제 실패: ${error.message}`);
    reload();
  }

  // 위·아래로 한 칸: 이웃과 순서 숫자를 맞바꾼다
  async function move(list: SiteItemRow[], i: number, d: -1 | 1) {
    const a = list[i];
    const b = list[i + d];
    if (!a || !b) return;
    const sa = a.sort === b.sort ? b.sort + d : b.sort;
    const db = createClient().from("site_items");
    await db.update({ sort: sa }).eq("id", a.id);
    await createClient().from("site_items").update({ sort: a.sort }).eq("id", b.id);
    reload();
  }

  if (!ready) return <p className="py-10 text-center text-cream/55">불러오는 중…</p>;

  if (missing) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-candy/60 bg-candy/5 p-5 text-sm leading-relaxed">
        <p className="font-extrabold">사이트 문구 표가 아직 없어요.</p>
        <p className="mt-1 text-cream/70">
          저장소의 <code>docs/sql/2026-11-15_batch.sql</code> 을 Supabase SQL Editor 에서 한 번 실행하면 이 화면을 쓸 수 있어요.
        </p>
      </div>
    );
  }

  const today = kst();
  return (
    <div className="space-y-8">
      {SITE_KINDS.map(({ kind, name, help }) => {
        const list = rows.filter((r) => r.kind === kind);
        return (
          <section key={kind} className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg">{name}</h2>
                <p className="text-sm text-cream/60">{help}</p>
              </div>
              <button
                onClick={() => setForm(blank(kind, (list.at(-1)?.sort ?? 0) + 1))}
                className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-edge shadow-cute"
              >
                + 추가
              </button>
            </div>
            <ul className="space-y-2">
              {list.length === 0 && (
                <li className="rounded-2xl border-2 border-dashed border-edge/30 py-6 text-center text-sm text-cream/55">
                  {kind === "chip" ? "비어 있어요 → 사이트는 기본 칩(강남·홍대…)을 보여 줘요" : "비어 있어요 → 홈에 배너가 안 나와요"}
                </li>
              )}
              {list.map((r, i) => {
                const live = r.active && (!r.until || r.until >= today);
                return (
                  <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-edge bg-panel px-3 py-2.5">
                    <span className="flex flex-col">
                      <button aria-label="위로" onClick={() => move(list, i, -1)} disabled={i === 0} className="px-1 text-xs disabled:opacity-20">▲</button>
                      <button aria-label="아래로" onClick={() => move(list, i, 1)} disabled={i === list.length - 1} className="px-1 text-xs disabled:opacity-20">▼</button>
                    </span>
                    <span className={`rounded-full border-2 border-edge px-2 py-0.5 text-[11px] font-extrabold ${live ? "bg-mint text-[#1D1D1D]" : "bg-ink text-cream/50"}`}>
                      {live ? "보이는 중" : r.active ? "기간 끝" : "숨김"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{r.label}</span>
                      <span className="block truncate text-xs text-cream/55">
                        {r.href ? `→ ${r.href}` : "→ 검색창에 이 글자"}
                        {r.until ? ` · ~${r.until}` : ""}
                      </span>
                    </span>
                    <button onClick={() => setForm({ ...r, until: r.until ?? "" })} className="text-sm font-bold underline">
                      고치기
                    </button>
                    <button onClick={() => patch(r.id, { active: !r.active })} className="text-sm font-bold text-cream/60 underline">
                      {r.active ? "숨기기" : "다시 보이기"}
                    </button>
                    <button onClick={() => remove(r.id)} className="text-sm font-bold text-red-500 underline">
                      삭제
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {form && (
        <div className="space-y-4 rounded-2xl border-2 border-edge bg-panel p-5">
          <h2 className="text-lg">
            {form.kind === "chip" ? "많이 찾는 칩" : "홈 배너"} · {form.id === null ? "추가" : "고치기"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>{form.kind === "chip" ? "칩 글자 *" : "배너 제목 *"}</label>
              <input className={field} value={form.label} onChange={(e) => upd("label", e.target.value)} placeholder={form.kind === "chip" ? "수원 방탈출" : "배우가 있는 방, 모아 봤어요"} />
            </div>
            {form.kind === "banner" && (
              <>
                <div className="sm:col-span-2">
                  <label className={label}>설명 (한두 문장)</label>
                  <textarea rows={2} className={field} value={form.body} onChange={(e) => upd("body", e.target.value)} />
                </div>
                <div>
                  <label className={label}>버튼 글자</label>
                  <input className={field} value={form.cta} onChange={(e) => upd("cta", e.target.value)} />
                </div>
                <div>
                  <label className={label}>그림 주소 *</label>
                  <input className={field} value={form.art} onChange={(e) => upd("art", e.target.value)} placeholder="/mascot.png" />
                  <p className={hint}>사이트에 올라간 그림만(배경 투명 PNG). 모르면 /mascot.png</p>
                </div>
                <div>
                  <label className={label}>색</label>
                  <select className={field} value={form.tone} onChange={(e) => upd("tone", e.target.value)}>
                    <option value="candy">주황</option>
                    <option value="grape">보라</option>
                    <option value="mint">민트</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 self-end pb-2 text-sm font-bold">
                  <input type="checkbox" checked={form.ad} onChange={(e) => upd("ad", e.target.checked)} />
                  돈을 받고 싣는 배너(“광고” 표시가 붙어요)
                </label>
              </>
            )}
            <div>
              <label className={label}>누르면 갈 주소{form.kind === "banner" ? " *" : ""}</label>
              <input className={field} value={form.href} onChange={(e) => upd("href", e.target.value)} placeholder="/region/수원" />
              <p className={hint}>
                사이트 안 주소만(/로 시작). 예: /region/수원 · /immersive · /cafe/키이스케이프
                {form.kind === "chip" ? " · 비우면 그 글자로 검색창이 열려요" : ""}
              </p>
            </div>
            <div>
              <label className={label}>이 날까지만 보이기 (비우면 계속)</label>
              <input type="date" className={field} value={form.until} onChange={(e) => upd("until", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setForm(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-cream/60">
              취소
            </button>
            <button onClick={save} disabled={saving} className="rough rounded-xl border-2 border-edge bg-candy px-5 py-2 text-sm font-extrabold text-edge shadow-cute disabled:opacity-50">
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
