"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { QuizValues } from "@/lib/quiz/slots";
import { QUIZ_TYPES } from "@/lib/quiz/types";
import { cleanName, encodeShare, shareFromValues, sharePath } from "@/lib/quiz/share";

const NAME_KEY = "escapelog:nickname";

// 결과 공유: 별명을 한 번 묻고, 기기의 공유 창을 띄운다. 안 되면 링크를 복사한다.
export default function ShareButton({ values }: { values: QuizValues }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  // 별명 미리 채우기: 지난번에 쓴 별명 → 없으면 계정 닉네임
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NAME_KEY);
      if (saved) {
        setName(saved);
        return;
      }
    } catch {
      // 저장소를 못 읽으면 빈 칸으로 둔다
    }
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) =>
        data.user
          ? supabase.from("profiles").select("nickname").eq("id", data.user.id).maybeSingle()
          : null
      )
      .then((res) => {
        const nick = res?.data?.nickname;
        if (nick) setName((cur) => cur || String(nick).slice(0, 12));
      })
      .catch(() => {});
  }, []);

  async function share() {
    const shared = shareFromValues(values, name);
    try {
      if (name.trim()) window.localStorage.setItem(NAME_KEY, cleanName(name));
    } catch {
      // 별명 기억 실패는 무시
    }
    const url = window.location.origin + sharePath(encodeShare(shared));
    const title = `${shared.name}의 방탈출 유형: ${QUIZ_TYPES[shared.typeId].title}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: `${title}. 너는 어떤 유형이야?`, url });
        setStatus("");
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // 공유 창을 닫음
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("링크를 복사했어. 친구한테 붙여 넣어 줘.");
    } catch {
      setStatus(url); // 복사도 막힌 환경이면 주소를 그대로 보여 준다
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rough mt-6 rounded-xl border-2 border-edge bg-candy px-6 py-3 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
      >
        결과 공유하기
      </button>
    );
  }

  return (
    <form
      className="mx-auto mt-6 max-w-sm text-left"
      onSubmit={(e) => {
        e.preventDefault();
        share();
      }}
    >
      <label htmlFor="share-name" className="text-sm font-bold text-cream/70">
        친구에게 보일 별명
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="share-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={12}
          placeholder="비우면 '친구'로 보여"
          autoComplete="nickname"
          className="min-w-0 flex-1 rounded-xl border-2 border-edge bg-ink px-3 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy"
        />
        <button
          type="submit"
          className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          공유
        </button>
      </div>
      <p role="status" className="mt-2 min-h-5 break-all text-sm font-bold text-cream/70">
        {status}
      </p>
    </form>
  );
}
