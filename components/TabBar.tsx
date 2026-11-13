"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 휴대폰 아래 탭 메뉴(앱처럼). 넓은 화면에서는 위 메뉴를 쓰므로 숨긴다.
// 기록 작성·수정 화면은 아래에 저장 바가 있어서 숨긴다.

type Tab = { href: string; label: string; match: (p: string) => boolean; icon: React.ReactNode };

const svg = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
    {d}
  </svg>
);

const TABS: Tab[] = [
  {
    href: "/",
    label: "홈",
    match: (p) => p === "/",
    icon: svg(<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  },
  {
    href: "/search",
    label: "찾기",
    match: (p) => /^\/(search|theme|cafe|region|best|spotlight)/.test(p),
    icon: svg(
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
  },
  {
    href: "/records",
    label: "기록",
    match: (p) => /^\/(records|diary)/.test(p),
    icon: svg(
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  },
  {
    href: "/quiz",
    label: "취향",
    match: (p) => /^\/(quiz|taste|match|team|mini)/.test(p),
    icon: svg(<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />),
  },
  {
    href: "/feed",
    label: "후기",
    match: (p) => p.startsWith("/feed"),
    icon: svg(<path d="M4 5h16v11H9l-5 4z" />),
  },
];

export default function TabBar() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/new" || pathname.startsWith("/edit/") || pathname.startsWith("/admin")) return null;
  return (
    <>
      {/* 탭 메뉴에 내용이 가리지 않게 자리 확보 */}
      <div className="h-[72px] sm:hidden" aria-hidden />
      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t-[2px] border-[#1D1D1D] bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        {TABS.map((t) => {
          const on = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-extrabold transition-colors ${
                on ? "text-cream" : "text-cream/45"
              }`}
            >
              {t.icon}
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
