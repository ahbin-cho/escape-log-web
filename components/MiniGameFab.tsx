"use client";

import { useState } from "react";

export default function MiniGameFab() {
  const [hover, setHover] = useState(false);

  return (
    <a
      href="https://yunj8649.github.io/minicheon/"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-6 right-[calc(50%-40rem)] z-30 flex flex-col items-center gap-3 active:scale-95"
      title="미니게임천국"
    >
      {/* 말풍선 */}
      <div
        className={`rough relative rounded-xl border-2 border-edge bg-panel px-3 py-1.5 shadow-cute transition-all ${
          hover ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <span className="whitespace-nowrap text-xs font-extrabold tracking-tight">
          🕹️ 레트로 미니게임
        </span>
        {/* 말풍선 꼬리 (아래) */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-edge" />
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-panel" />
      </div>
      {/* 원형 플로팅 버튼 */}
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-edge bg-candy text-2xl shadow-cute transition-transform sm:h-16 sm:w-16 sm:text-3xl ${
          hover ? "scale-110" : "animate-bounce-slow"
        }`}
      >
        👾
      </div>
    </a>
  );
}
