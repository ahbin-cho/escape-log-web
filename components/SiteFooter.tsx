import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t-2 border-edge bg-ink">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="space-y-1.5">
            <p
              className="text-lg tracking-tight"
              style={{ fontFamily: "'SBAggroB', sans-serif" }}
            >
              방탈로그
            </p>
            <p className="max-w-xs text-sm text-cream/60">
              방탈출 기록·취향 진단·추천, 그리고 친구 궁합까지. 방탈러를 위한
              아카이브.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-cream/70">
            <Link href="/quiz" className="hover:text-candy">
              취향 찾기
            </Link>
            <Link href="/feed" className="hover:text-candy">
              모두의 후기
            </Link>
            <Link href="/region" className="hover:text-candy">
              지역 지도
            </Link>
            <Link href="/match" className="hover:text-candy">
              친구 궁합
            </Link>
            <Link href="/new" className="hover:text-candy">
              기록 추가
            </Link>
          </nav>
        </div>

        <div className="mt-6 space-y-1 border-t border-edge/15 pt-4 text-xs text-cream/45">
          <p>© {year} 방탈로그. 개인 방탈출 아카이브 서비스.</p>
          <p>
            테마·매장 정보는 각 방탈출 브랜드의 공식 정보를 참고했으며, 실제와
            다를 수 있어요.
          </p>
        </div>
      </div>
    </footer>
  );
}
