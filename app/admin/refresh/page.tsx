import RefreshButton from "./RefreshButton";

// SQL 을 넣은 뒤 화면에 바로 반영하고 싶을 때 쓰는 곳
export default function AdminRefreshPage() {
  return (
    <section className="rough space-y-4 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
      <h2 className="text-xl">🔄 사이트 지금 새로고침</h2>
      <p className="text-[15px] leading-relaxed text-cream/80 [word-break:keep-all]">
        Supabase 에서 SQL 을 넣은 뒤 이 버튼을 누르면, 홈·테마·브랜드·지역·이머시브 모음 같은 페이지를 지금 바로 새로 만들어요.
        누르지 않아도 테마 페이지는 10분, 홈·모음 페이지는 1시간 안에 저절로 바뀌어요.
      </p>
      <RefreshButton />
      <p className="text-[13px] text-cream/60">
        누른 직후 첫 화면은 새로 만드는 중이라 조금 느릴 수 있어요. 자주 누를 필요는 없어요(SQL 넣은 뒤 한 번).
      </p>
    </section>
  );
}
