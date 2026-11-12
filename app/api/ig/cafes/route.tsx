import { getAllThemes } from "@/lib/catalog-server";
import { pickYearEndCafes } from "@/lib/cafe-picks";
import { ED, jpegResponse } from "@/lib/og-card";

// 매장 탐방 캐러셀: ?page=1..N (1=표지, 마지막=마무리, 사이=매장 한 곳씩)
// "연말 모임용 서울 방탈출 카페" — 우리 카탈로그 데이터로 고르고 계산한 정보만 쓴다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENRE_COLOR: Record<string, string> = {
  공포: "#8E0B1C", 스릴러: "#4A4A4A", 추리: "#2F4B7C", 감성: "#C76B98", 판타지: "#7A5CC2",
  모험: "#3E8E5A", 코믹: "#E2A23A", 아케이드: "#2BA7C9", SF: "#1F6F8B", 기타: "#9C9890",
};
const dots = (x: number) => {
  const n = Math.round(x);
  return `${"●".repeat(n)}${"○".repeat(Math.max(0, 5 - n))}`;
};

function Shell({ page, total, origin, children }: { page: number; total: number; origin: string; children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "96px 92px 84px", backgroundColor: ED.bg, color: ED.ink, fontFamily: "Pretendard" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800, letterSpacing: "0.2em" }}>
        <div>연말 모임 방탈출</div>
        <div style={{ color: ED.dim }}>{`${String(page).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}</div>
      </div>
      <div style={{ marginTop: 26, height: 3, backgroundColor: ED.ink, display: "flex" }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 24, fontWeight: 500, color: ED.dim }}>방탈로그 테마 데이터 기준 · bangtallog.com</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${origin}/mascot.png`} alt="" width={96} height={96} />
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cafes = pickYearEndCafes(await getAllThemes(), 6);
  if (cafes.length === 0) return new Response("고를 매장이 없어요", { status: 404 });
  const total = cafes.length + 2;
  const page = Math.min(total, Math.max(1, Number(url.searchParams.get("page")) || 1));
  const origin = url.origin;

  if (page === 1) {
    return jpegResponse(
      <Shell page={1} total={total} origin={origin}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 112, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.05em" }}>
            <div>연말 모임,</div>
            <div style={{ color: ED.accent }}>방탈출 어디서</div>
            <div>할까?</div>
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 38, fontWeight: 500, color: ED.dim, lineHeight: 1.5, wordBreak: "keep-all" }}>
            {`겁 많은 친구도 같이 갈 수 있게, 무섭지 않은 테마가 많은 서울 방탈출 카페 ${cafes.length}곳을 골랐어요.`}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, fontWeight: 800, color: ED.dim }}>
            고른 기준: 서울 · 테마 3개 이상 · 공포도 2 이하 테마가 60% 넘는 곳 · 브랜드당 1곳
          </div>
        </div>
      </Shell>,
      3600
    );
  }

  if (page === total) {
    return jpegResponse(
      <Shell page={page} total={total} origin={origin}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.05em" }}>
            <div>다녀온 다음엔,</div>
            <div style={{ color: ED.accent }}>기록까지</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 56 }}>
            {["매장별 테마 전체 · 줄거리 · 후기", "우리 팀 궁합으로 다 같이 갈 방 고르기", "다녀온 방은 다이어리로, 연말 결산까지"].map((x) => (
              <div key={x} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 38, fontWeight: 800 }}>
                <div style={{ display: "flex", width: 18, height: 18, borderRadius: 9, backgroundColor: ED.accent }} />
                {x}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 64, fontSize: 44, fontWeight: 800 }}>프로필 링크 → bangtallog.com</div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 26, fontWeight: 500, color: ED.dim }}>예약·영업시간은 각 매장 예약 페이지에서 확인해 주세요.</div>
        </div>
      </Shell>,
      3600
    );
  }

  const c = cafes[page - 2];
  const branch = c.cafe.slice(c.brand.length).trim();
  return jpegResponse(
    <Shell page={page} total={total} origin={origin}>
      <div style={{ display: "flex", marginTop: 64, fontSize: 40, fontWeight: 800, color: ED.accent }}>{String(page - 1).padStart(2, "0")}</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.1 }}>{c.brand}</div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: ED.dim, marginTop: 6 }}>{branch || " "}</div>
      </div>

      {/* 장르 구성 막대 */}
      <div style={{ display: "flex", marginTop: 44, height: 30, borderRadius: 15, overflow: "hidden", border: `3px solid ${ED.ink}` }}>
        {c.genres.map((g) => (
          <div key={g.genre} style={{ display: "flex", width: `${(g.n / c.count) * 100}%`, backgroundColor: GENRE_COLOR[g.genre] ?? "#9C9890" }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14, fontSize: 26, fontWeight: 800 }}>
        {c.genres.map((g) => (
          <div key={g.genre} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, backgroundColor: GENRE_COLOR[g.genre] ?? "#9C9890" }} />
            {`${g.genre} ${g.n}`}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 34 }}>
        {[
          ["테마", `${c.count}개`],
          ["평균 난이도", dots(c.avgDifficulty)],
          ["평균 공포도", dots(c.avgFear)],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "20px 24px", borderRadius: 20, border: `3px solid ${ED.ink}`, backgroundColor: "#FFFCF6" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: ED.dim }}>{k}</div>
            <div style={{ marginTop: 6, fontSize: 36, fontWeight: 800 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 30, padding: "24px 30px", borderRadius: 20, backgroundColor: ED.ink, color: ED.bg }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: ED.accent, letterSpacing: "0.1em" }}>이런 모임에</div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 36, fontWeight: 800, wordBreak: "keep-all" }}>{c.forWhom}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: ED.dim }}>덜 무서운 테마부터</div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 34, fontWeight: 800, wordBreak: "keep-all" }}>{c.picks.join(" · ")}</div>
      </div>
    </Shell>,
    3600
  );
}
