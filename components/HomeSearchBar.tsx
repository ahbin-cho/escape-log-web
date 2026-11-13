"use client";

// 홈 맨 위 검색창. 누르면 헤더의 검색(바로 결과가 뜨는 창)을 연다.
// 자바스크립트가 안 돌면 /search 로 그냥 넘어가도록 form 으로 감쌌다.
function openSearch(preset?: string) {
  window.dispatchEvent(new CustomEvent("open-search", { detail: preset }));
}

export default function HomeSearchBar() {
  return (
    <form
      action="/search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        openSearch(typeof q === "string" ? q : "");
      }}
      className="flex items-center gap-2 rounded-xl bg-ink px-3.5 text-cream/70"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        name="q"
        readOnly
        onFocus={(e) => {
          e.currentTarget.blur();
          openSearch();
        }}
        onClick={() => openSearch()}
        placeholder="테마, 매장, 동네로 찾기"
        aria-label="테마 검색"
        className="min-w-0 flex-1 cursor-pointer bg-transparent py-3 text-[15px] font-medium text-cream outline-none placeholder:text-cream/60"
      />
    </form>
  );
}
