"use client";

// 홈 맨 위 큰 검색창. 누르면 헤더의 검색(바로 결과가 뜨는 창)을 연다.
// 자바스크립트가 안 돌면 /search 로 그냥 넘어가도록 form 으로 감쌌다.
const QUICK = ["강남", "홍대", "안 무서운", "공포", "감성", "키이스케이프"];

function openSearch(preset?: string) {
  window.dispatchEvent(new CustomEvent("open-search", { detail: preset }));
}

export default function HomeSearchBar() {
  return (
    <div className="space-y-2.5">
      <form
        action="/search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          openSearch(typeof q === "string" ? q : "");
        }}
        className="rough flex items-center gap-2 rounded-2xl border-2 border-edge bg-panel px-4 py-1 shadow-cute"
      >
        <span className="text-xl" aria-hidden>
          🔍
        </span>
        <input
          name="q"
          readOnly
          onFocus={(e) => {
            e.currentTarget.blur();
            openSearch();
          }}
          onClick={() => openSearch()}
          placeholder="테마·매장·동네로 찾기"
          aria-label="테마 검색"
          className="min-w-0 flex-1 cursor-pointer bg-transparent py-3 text-[15px] font-bold outline-none placeholder:text-cream/45"
        />
        <button
          type="submit"
          className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-3.5 py-1.5 text-sm font-extrabold text-white"
        >
          검색
        </button>
      </form>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        <span className="shrink-0 self-center text-xs font-bold text-cream/45">많이 찾는</span>
        {QUICK.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => openSearch(k)}
            className="shrink-0 rounded-full border-2 border-edge/20 bg-panel px-3 py-1 text-xs font-bold text-cream/70 transition hover:border-edge active:scale-[0.97]"
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
