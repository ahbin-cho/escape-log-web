"use client";

import { useEffect, useState } from "react";

// "홈 화면에 추가" 안내. 앱을 따로 만들지 않고, 사이트를 휴대폰 홈 화면에 꺼내 앱처럼 쓰게 한다.
//  · 인스타·카톡 등 앱 안 브라우저: 여기서 쓴 기록은 다른 브라우저에서 안 보이므로 "기본 브라우저로 열기"를 먼저 권한다
//  · 안드로이드 크롬: 설치 버튼(브라우저가 허용할 때) 또는 메뉴 안내
//  · 아이폰 사파리: 공유 → 홈 화면에 추가 안내
// 이미 홈 화면에서 열었거나 닫기를 누른 사람에게는 보이지 않는다.

const KEY = "escapelog:install-hint:dismissed";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Kind = "inapp" | "android" | "ios" | null;

export default function InstallHint() {
  const [kind, setKind] = useState<Kind>(null);
  const [evt, setEvt] = useState<BIPEvent | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    const ua = navigator.userAgent;
    if (/Instagram|FBAN|FBAV|KAKAOTALK|NAVER\(inapp|Line\//i.test(ua)) setKind("inapp");
    else if (/iPhone|iPad|iPod/i.test(ua)) setKind("ios");
    else if (/Android/i.test(ua)) setKind("android");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setKind((k) => k ?? "android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!kind) return null;

  const close = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // 무시
    }
    setKind(null);
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-edge/20 bg-panel px-4 py-3.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl border border-edge/15" />
      <div className="min-w-0 flex-1 text-sm">
        {kind === "inapp" ? (
          <>
            <p className="font-extrabold">지금은 앱 안에서 열린 화면이에요</p>
            <p className="mt-0.5 text-cream/65 [word-break:keep-all]">
              여기서 쓴 기록은 다른 브라우저에서 안 보여요. 오른쪽 위 <b>⋯</b> 메뉴에서{" "}
              <b>브라우저에서 열기</b>(Safari·Chrome)로 열고 쓰면 안전해요.
            </p>
          </>
        ) : (
          <>
            <p className="font-extrabold">홈 화면에 추가하면 앱처럼 써요</p>
            <p className="mt-0.5 text-cream/65 [word-break:keep-all]">
              {kind === "ios" ? (
                <>
                  아래 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b>를 누르면, 방 나오자마자 바로 열어 기록할 수 있어요.
                </>
              ) : evt ? (
                <>설치 없이 아이콘만 꺼내 두는 거라 용량도 거의 안 써요.</>
              ) : (
                <>
                  브라우저 오른쪽 위 <b>⋮</b> → <b>홈 화면에 추가</b>를 누르면, 방 나오자마자 바로 열어 기록할 수 있어요.
                </>
              )}
            </p>
            {evt && (
              <button
                onClick={async () => {
                  await evt.prompt();
                  await evt.userChoice.catch(() => null);
                  close();
                }}
                className="rough mt-2 rounded-xl border-2 border-edge bg-candy px-4 py-1.5 text-sm font-extrabold text-white shadow-cute"
              >
                홈 화면에 추가
              </button>
            )}
          </>
        )}
      </div>
      <button onClick={close} aria-label="닫기" className="shrink-0 px-1 text-lg leading-none text-cream/40">
        ×
      </button>
    </div>
  );
}
