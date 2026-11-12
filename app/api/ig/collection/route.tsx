import { getAllThemes } from "@/lib/catalog-server";
import { areaThemes, pickCollection } from "@/lib/collection";
import { jpegResponse } from "@/lib/og-card";

// 지역 모음 캐러셀: ?area=수원&page=1..N (1=표지, 마지막=전체 보기, 사이=조건별 고르기)
// 정보성 소개(대가 없음). 매장 공식 소개 기준 데이터만 쓴다.
// 사이트 느낌: 크림 바탕 · 굵은 먹색 테두리 · 오프셋 그림자 · 제목은 사이트 글꼴(Aggro) · 섹션마다 색
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INK = "#1D1D1D";
const CREAM = "#F5F0E6";
const PAPER = "#FFFCF6";
const ORANGE = "#E49A4A";
const DIM = "#6E6458";

// 섹션별 색(배경 띠 · 번호 · 꼬리표)
const THEME: Record<string, { bg: string; tint: string; mark: string; label: string }> = {
  fear: { bg: "#F6D5CC", tint: "#FBE8E2", mark: "#D9573B", label: "공포 MAX" },
  calm: { bg: "#D3ECDD", tint: "#E8F5EE", mark: "#4E9A72", label: "무섭지 않아요" },
  first: { bg: "#FBE3A6", tint: "#FDF0CF", mark: "#D48A1C", label: "입문 추천" },
  story: { bg: "#E2DAF5", tint: "#F0ECFA", mark: "#7A68C2", label: "스토리 맛집" },
};

const pips = (n: number, color: string) =>
  [1, 2, 3, 4, 5].map((i) => (
    <div
      key={i}
      style={{
        display: "flex",
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: 5,
        border: `2.5px solid ${INK}`,
        backgroundColor: i <= n ? color : "transparent",
      }}
    />
  ));

function Frame({
  area,
  page,
  total,
  origin,
  band,
  bandH = 470,
  children,
}: {
  area: string;
  page: number;
  total: number;
  origin: string;
  band?: string;
  bandH?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: CREAM, color: INK, fontFamily: "Pretendard", position: "relative" }}>
      {/* 윗부분 색 띠: 섹션마다 다른 색 */}
      {band && <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: bandH, backgroundColor: band, borderBottom: `4px solid ${INK}`, display: "flex" }} />}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "72px 80px 64px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: PAPER, border: `3px solid ${INK}`, borderRadius: 999, padding: "8px 22px", fontSize: 26, fontWeight: 800 }}>
            <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, backgroundColor: ORANGE }} />
            {`${area} 방탈출`}
          </div>
          <div style={{ display: "flex", backgroundColor: INK, color: PAPER, borderRadius: 999, padding: "8px 20px", fontSize: 24, fontWeight: 800 }}>{`${page} / ${total}`}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Aggro", fontSize: 30 }}>방탈로그</div>
            <div style={{ fontSize: 21, fontWeight: 500, color: DIM, marginTop: 4 }}>정보는 각 매장 공식 소개 기준 · bangtallog.com</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${origin}/mascot.png`} alt="" width={104} height={104} />
        </div>
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
  const brands = new Set(themes.map((t) => t.cafe.split(" ")[0])).size;

  // ── 1장: 표지 ──
  if (page === 1) {
    return jpegResponse(
      <Frame area={area} page={1} total={total} origin={url.origin} band="#FBE3A6" bandH={735}>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 92 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#B5651D" }}>{`테마 ${themes.length}개 · 브랜드 ${brands}곳에서 골랐어요`}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontFamily: "Aggro", fontSize: 118, lineHeight: 1.12 }}>
            <div style={{ display: "flex" }}>{`${area} 방탈출,`}</div>
            <div style={{ display: "flex", color: ORANGE, textShadow: `6px 6px 0 ${INK}` }}>어디 갈지</div>
            <div style={{ display: "flex" }}>고민이라면?</div>
          </div>
        </div>
        {/* 안에 뭐가 있는지 미리 보여 주는 칸들 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 96 }}>
          {sections.map((s, i) => {
            const c = THEME[s.key] ?? THEME.first;
            return (
              <div
                key={s.key}
                style={{ display: "flex", alignItems: "center", gap: 14, width: 450, backgroundColor: PAPER, border: `3px solid ${INK}`, borderRadius: 20, padding: "18px 22px", boxShadow: `5px 5px 0 ${INK}` }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 23, backgroundColor: c.bg, border: `3px solid ${INK}`, fontSize: 24, fontWeight: 800 }}>{i + 2}</div>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>{s.title}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 28, fontWeight: 800, color: DIM }}>옆으로 넘겨 보세요 →</div>
      </Frame>,
      3600
    );
  }

  // ── 마지막 장: 전체 보러 가기 ──
  if (page === total) {
    return jpegResponse(
      <Frame area={area} page={page} total={total} origin={url.origin} band="#FBE3A6" bandH={560}>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 100, fontFamily: "Aggro", fontSize: 100, lineHeight: 1.15 }}>
          <div style={{ display: "flex" }}>{`${area} 테마 ${themes.length}개,`}</div>
          <div style={{ display: "flex", color: ORANGE, textShadow: `6px 6px 0 ${INK}` }}>전부 보고 싶다면</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 110, backgroundColor: PAPER, border: `4px solid ${INK}`, borderRadius: 28, boxShadow: `8px 8px 0 ${INK}`, padding: "34px 40px", gap: 20 }}>
          {[
            ["1", `검색창에 "${area}"`],
            ["2", "줄거리 · 난이도 · 공포도 · 후기"],
            ["3", "내 취향에 딱 맞는 방 추천까지"],
          ].map(([n, x]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 800 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 24, backgroundColor: ORANGE, color: PAPER, border: `3px solid ${INK}`, fontSize: 24 }}>{n}</div>
              {x}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 44 }}>
          <div style={{ display: "flex", backgroundColor: ORANGE, color: PAPER, border: `4px solid ${INK}`, borderRadius: 20, boxShadow: `6px 6px 0 ${INK}`, padding: "18px 34px", fontSize: 38, fontWeight: 800 }}>
            프로필 링크 → bangtallog.com
          </div>
        </div>
      </Frame>,
      3600
    );
  }

  // ── 사이 장: 조건별 고르기 ──
  const s = sections[page - 2];
  const c = THEME[s.key] ?? THEME.first;
  return jpegResponse(
    <Frame area={area} page={page} total={total} origin={url.origin} band={c.bg}>
      <div style={{ display: "flex", marginTop: 56 }}>
        <div style={{ display: "flex", backgroundColor: c.mark, color: PAPER, border: `3px solid ${INK}`, borderRadius: 14, padding: "6px 18px", fontSize: 26, fontWeight: 800 }}>{c.label}</div>
      </div>
      <div style={{ display: "flex", marginTop: 20, fontFamily: "Aggro", fontSize: 96 }}>{s.title}</div>
      <div style={{ display: "flex", marginTop: 12, fontSize: 30, fontWeight: 800, color: DIM }}>{s.sub}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 80 }}>
        {s.themes.map((t, i) => (
          <div
            key={t.id}
            style={{ display: "flex", alignItems: "center", gap: 24, padding: "28px 30px", borderRadius: 24, border: `4px solid ${INK}`, backgroundColor: PAPER, boxShadow: `6px 6px 0 ${INK}` }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 32, backgroundColor: c.tint, border: `3px solid ${INK}`, fontFamily: "Aggro", fontSize: 32, color: c.mark }}>{i + 1}</div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", fontFamily: "Aggro", fontSize: 36, maxWidth: 560 }}>{t.name}</div>
                <div style={{ display: "flex", backgroundColor: c.tint, border: `2.5px solid ${INK}`, borderRadius: 999, padding: "3px 14px", fontSize: 22, fontWeight: 800 }}>{t.genre}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: DIM }}>{t.cafe}</div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 21, fontWeight: 800, color: DIM }}>
                  난이도{pips(t.difficulty, ORANGE)}
                  <div style={{ display: "flex", width: 18 }} />
                  공포{pips(t.fear_level, "#D9573B")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Frame>,
    3600
  );
}
