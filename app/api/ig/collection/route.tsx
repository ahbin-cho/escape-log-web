import { getAllThemes } from "@/lib/catalog-server";
import { areaThemes, pickCollection } from "@/lib/collection";
import { ED, jpegResponse } from "@/lib/og-card";

// 지역 모음 캐러셀: ?area=수원&page=1..N (1=표지, 마지막=전체 보기, 사이=조건별 고르기)
// 정보성 소개(대가 없음). 매장 공식 소개 기준 데이터만 쓴다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dots = (n: number) => `${"●".repeat(n)}${"○".repeat(Math.max(0, 5 - n))}`;

function Shell({ label, page, total, origin, children }: { label: string; page: number; total: number; origin: string; children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "96px 92px 84px", backgroundColor: ED.bg, color: ED.ink, fontFamily: "Pretendard" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800, letterSpacing: "0.2em" }}>
        <div>{label}</div>
        <div style={{ color: ED.dim }}>{`${String(page).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}</div>
      </div>
      <div style={{ marginTop: 26, height: 3, backgroundColor: ED.ink, display: "flex" }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 26, fontWeight: 500, color: ED.dim }}>정보는 각 매장 공식 소개 기준 · bangtallog.com</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${origin}/mascot.png`} alt="" width={100} height={100} />
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const area = (url.searchParams.get("area") || "수원").slice(0, 10);
  const themes = areaThemes(await getAllThemes(), area);
  const sections = pickCollection(themes);
  const total = sections.length + 2;
  const page = Math.min(total, Math.max(1, Number(url.searchParams.get("page")) || 1));
  const label = `${area} 방탈출`;
  const brands = new Set(themes.map((t) => t.cafe.split(" ")[0])).size;

  if (page === 1) {
    return jpegResponse(
      <Shell label={label} page={1} total={total} origin={url.origin}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 120, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.05em" }}>
            <div>{`${area} 방탈출,`}</div>
            <div style={{ color: ED.accent }}>어디 갈지</div>
            <div>고민이라면</div>
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 38, fontWeight: 500, color: ED.dim, wordBreak: "keep-all" }}>
            {`테마 ${themes.length}개 · 브랜드 ${brands}곳을 조건별로 골라 봤어요. 옆으로 넘겨 보세요 →`}
          </div>
        </div>
      </Shell>,
      3600
    );
  }

  if (page === total) {
    return jpegResponse(
      <Shell label={label} page={page} total={total} origin={url.origin}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.05em" }}>
            <div>{`${area} 테마 ${themes.length}개,`}</div>
            <div style={{ color: ED.accent }}>전부 보고 싶다면</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 56 }}>
            {[`검색창에 "${area}"`, "줄거리 · 난이도 · 공포도 · 후기", "내 취향에 맞는 방 추천까지"].map((x) => (
              <div key={x} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
                <div style={{ display: "flex", width: 18, height: 18, borderRadius: 9, backgroundColor: ED.accent }} />
                {x}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 64, fontSize: 44, fontWeight: 800 }}>프로필 링크 → bangtallog.com</div>
        </div>
      </Shell>,
      3600
    );
  }

  const s = sections[page - 2];
  return jpegResponse(
    <Shell label={label} page={page} total={total} origin={url.origin}>
      <div style={{ display: "flex", marginTop: 70, fontSize: 84, fontWeight: 800, letterSpacing: "-0.045em" }}>{s.title}</div>
      <div style={{ display: "flex", marginTop: 14, fontSize: 32, fontWeight: 500, color: ED.dim }}>{s.sub}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 44 }}>
        {s.themes.map((t) => (
          <div key={t.id} style={{ display: "flex", flexDirection: "column", padding: "24px 30px", borderRadius: 24, border: `3px solid ${ED.ink}`, backgroundColor: "#FFFCF6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", maxWidth: 620 }}>{t.name}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: ED.accent }}>{t.genre}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 26, fontWeight: 500, color: ED.dim }}>
              <div>{t.cafe}</div>
              <div>{`난이도 ${dots(t.difficulty)}  공포 ${dots(t.fear_level)}`}</div>
            </div>
          </div>
        ))}
      </div>
    </Shell>,
    3600
  );
}
