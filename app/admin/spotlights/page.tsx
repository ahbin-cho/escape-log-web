"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  factsToText,
  faqToText,
  parseFacts,
  parseFaq,
  spotlightFromRow,
  type SpotlightRow,
} from "@/lib/spotlight";

// 화제의 방 관리: 홈 "지금 화제인 방"과 /spotlight/<주소> 정리 페이지의 내용을 넣고 고친다.
// 저장하면 최대 1시간 안에 사이트에 반영된다(홈·정리 페이지가 1시간마다 다시 만들어짐).

const field =
  "w-full rounded-xl border-2 border-edge bg-ink px-3 py-2 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy";
const label = "mb-1 block text-sm font-bold text-cream/70";
const hint = "mt-1 text-xs text-cream/50";

type Form = {
  slug: string;
  label: string;
  name: string;
  title: string;
  lead: string;
  seo_title: string;
  seo_description: string;
  cafe_includes: string;
  factsText: string;
  faqText: string;
  source_name: string;
  source_url: string;
  checked_at: string;
  until: string;
  isNew: boolean;
};

const today = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + 9 * 3600_000 + n * 86400_000).toISOString().slice(0, 10);

const empty = (): Form => ({
  slug: "",
  label: "신규 오픈",
  name: "",
  title: "",
  lead: "",
  seo_title: "",
  seo_description: "",
  cafe_includes: "",
  factsText: "위치 | \n플레이 시간 | \n인원 | \n요금 | \n예약 | ",
  faqText: "",
  source_name: "",
  source_url: "",
  checked_at: today(),
  until: plusDays(30),
  isNew: true,
});

export default function AdminSpotlights() {
  const [rows, setRows] = useState<SpotlightRow[]>([]);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [matched, setMatched] = useState<number | null>(null);

  async function reload() {
    const { data, error } = await createClient()
      .from("spotlights")
      .select("*")
      .order("created_at", { ascending: false });
    setMissing(!!error);
    setRows((data as SpotlightRow[]) ?? []);
    setReady(true);
  }
  useEffect(() => {
    reload();
  }, []);

  // 매장 이름으로 묶이는 테마가 몇 개인지 바로 보여 준다(0개면 홈에 안 나온다)
  useEffect(() => {
    const key = form?.cafe_includes.trim();
    if (!key) {
      setMatched(null);
      return;
    }
    const t = setTimeout(async () => {
      const { count } = await createClient()
        .from("catalog")
        .select("id", { count: "exact", head: true })
        .ilike("cafe", `%${key}%`);
      setMatched(count ?? 0);
    }, 400);
    return () => clearTimeout(t);
  }, [form?.cafe_includes]);

  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  function edit(r: SpotlightRow) {
    const s = spotlightFromRow(r);
    setForm({
      slug: r.slug,
      label: r.label,
      name: r.name,
      title: r.title,
      lead: r.lead,
      seo_title: r.seo_title,
      seo_description: r.seo_description,
      cafe_includes: r.cafe_includes,
      factsText: factsToText(s.facts),
      faqText: faqToText(s.faq),
      source_name: r.source_name,
      source_url: r.source_url,
      checked_at: r.checked_at,
      until: r.until,
      isNew: false,
    });
  }

  async function save() {
    if (!form) return;
    if (!/^[a-z0-9-]{2,60}$/.test(form.slug)) return alert("주소는 영어 소문자·숫자·-(하이픈)만 쓸 수 있어요. 예: maplestory-escape");
    if (!form.name.trim() || !form.title.trim()) return alert("이름과 제목을 적어 주세요.");
    setSaving(true);
    const { isNew: _isNew, factsText, faqText, ...rest } = form;
    void _isNew;
    const { error } = await createClient()
      .from("spotlights")
      .upsert({ ...rest, facts: parseFacts(factsText), faq: parseFaq(faqText) });
    setSaving(false);
    if (error) return alert(`저장 실패: ${error.message}`);
    setForm(null);
    reload();
  }

  async function remove(slug: string) {
    if (!confirm("이 항목을 지울까요? 홈과 정리 페이지에서 사라져요.")) return;
    const { error } = await createClient().from("spotlights").delete().eq("slug", slug);
    if (error) return alert(`삭제 실패: ${error.message}`);
    reload();
  }

  async function hide(slug: string) {
    const { error } = await createClient().from("spotlights").update({ until: plusDays(-1) }).eq("slug", slug);
    if (error) return alert(`실패: ${error.message}`);
    reload();
  }

  if (!ready) return <p className="py-10 text-center text-cream/55">불러오는 중…</p>;

  if (missing) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-candy/60 bg-candy/5 p-5 text-sm leading-relaxed">
        <p className="font-extrabold">화제의 방 표가 아직 없어요.</p>
        <p className="mt-1 text-cream/70">
          저장소의 <code>docs/sql/spotlights.sql</code> 을 Supabase SQL Editor 에서 한 번 실행하면 이 화면을 쓸 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream/60">
          홈 “지금 화제인 방”에는 노출 기간이 남은 것 중 맨 위 하나가 나와요. 저장 후 최대 1시간 안에 반영돼요.
        </p>
        <button onClick={() => setForm(empty())} className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-edge shadow-cute">
          + 새로 올리기
        </button>
      </div>

      <ul className="space-y-2">
        {rows.length === 0 && <li className="rounded-2xl border-2 border-dashed border-edge/30 py-8 text-center text-sm text-cream/55">아직 없어요</li>}
        {rows.map((r) => {
          const live = r.until >= today();
          return (
            <li key={r.slug} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-edge bg-panel px-4 py-3">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${live ? "bg-mint text-white" : "bg-edge/10 text-cream/50"}`}>
                {live ? "노출 중" : "종료"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{r.name}</span>
                <span className="block truncate text-xs text-cream/55">
                  {r.title} · ~{r.until} ·{" "}
                  <a href={`/spotlight/${r.slug}`} target="_blank" className="underline">
                    /spotlight/{r.slug}
                  </a>
                </span>
              </span>
              <button onClick={() => edit(r)} className="text-sm font-bold underline">
                고치기
              </button>
              {live && (
                <button onClick={() => hide(r.slug)} className="text-sm font-bold text-cream/60 underline">
                  홈에서 내리기
                </button>
              )}
              <button onClick={() => remove(r.slug)} className="text-sm font-bold text-red-500 underline">
                삭제
              </button>
            </li>
          );
        })}
      </ul>

      {form && (
        <div className="space-y-4 rounded-2xl border-2 border-edge bg-panel p-5">
          <h2 className="text-lg">{form.isNew ? "새 화제의 방" : `고치기 · ${form.slug}`}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>이름 *</label>
              <input className={field} value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="메이플스토리 이스케이프" />
            </div>
            <div>
              <label className={label}>꼬리표</label>
              <input className={field} value={form.label} onChange={(e) => upd("label", e.target.value)} placeholder="신규 오픈 / 예약 오픈 / 이벤트" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>제목 * (궁금하게 한 문장)</label>
              <input className={field} value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="결말이 비어 있는 책 다섯 권이 발견됐다" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>소개 (한두 문장)</label>
              <textarea rows={3} className={field} value={form.lead} onChange={(e) => upd("lead", e.target.value)} />
            </div>
            <div>
              <label className={label}>주소 * (영어)</label>
              <input className={field} value={form.slug} disabled={!form.isNew} onChange={(e) => upd("slug", e.target.value.toLowerCase())} placeholder="maplestory-escape" />
              <p className={hint}>bangtallog.com/spotlight/{form.slug || "…"}</p>
            </div>
            <div>
              <label className={label}>묶을 매장 이름</label>
              <input className={field} value={form.cafe_includes} onChange={(e) => upd("cafe_includes", e.target.value)} placeholder="메이플스토리 이스케이프" />
              <p className={hint}>
                매장명에 이 글자가 들어간 테마를 보여 줘요.{" "}
                {matched !== null && (
                  <b className={matched ? "text-mint" : "text-red-500"}>
                    {matched ? `테마 ${matched}개가 묶여요` : "묶이는 테마가 없어요(홈에 안 나와요). 카탈로그에 먼저 넣어 주세요"}
                  </b>
                )}
              </p>
            </div>
            <div>
              <label className={label}>홈 노출 마지막 날</label>
              <input type="date" className={field} value={form.until} onChange={(e) => upd("until", e.target.value)} />
            </div>
            <div>
              <label className={label}>정보 확인한 날</label>
              <input type="date" className={field} value={form.checked_at} onChange={(e) => upd("checked_at", e.target.value)} />
            </div>
            <div>
              <label className={label}>출처 이름</label>
              <input className={field} value={form.source_name} onChange={(e) => upd("source_name", e.target.value)} placeholder="○○ 공식 사이트" />
            </div>
            <div>
              <label className={label}>출처 주소</label>
              <input className={field} value={form.source_url} onChange={(e) => upd("source_url", e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>가기 전에 알아 둘 것 (한 줄에 하나)</label>
              <textarea rows={7} className={field} value={form.factsText} onChange={(e) => upd("factsText", e.target.value)} />
              <p className={hint}>형식: 항목 | 내용 | 덧붙임(없어도 됨) · 예: 요금 | 1인 29,000원</p>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>자주 묻는 질문 (한 줄에 하나)</label>
              <textarea rows={5} className={field} value={form.faqText} onChange={(e) => upd("faqText", e.target.value)} />
              <p className={hint}>형식: 질문 | 답 · 검색 결과에 질문·답으로 보일 수 있어요</p>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>검색용 제목 (비우면 “이름 + 테마·예약·가격·인원 정리”)</label>
              <input className={field} value={form.seo_title} onChange={(e) => upd("seo_title", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>검색용 설명 (비우면 소개 문장)</label>
              <textarea rows={2} className={field} value={form.seo_description} onChange={(e) => upd("seo_description", e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-cream/55">공식 사이트·공지에서 확인한 내용만 적어 주세요.</p>
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
