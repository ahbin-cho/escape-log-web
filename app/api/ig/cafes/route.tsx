import { getAllThemes } from "@/lib/catalog-server";
import { pickYearEndCafes } from "@/lib/cafe-picks";
import { Cover, Dots, ED, Em, FootNote, FootPill, Ghost, Hand, Headline, Line, Paper, Sheet, Sticker, Sub, Wig, jpegResponse, toneOf } from "@/lib/og-card";

// 매장 탐방 캐러셀: ?page=1..N (1=표지, 마지막=마무리, 사이=매장 한 곳씩)
// "연말 모임용 서울 방탈출 카페" — 우리 카탈로그 데이터로 고르고 계산한 정보만 쓴다.
// 디자인 D: 종이 바탕 · 주황 포인트 · 장르 색 표지(매장 사진·포스터는 쓰지 않는다).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pageLabel = (page: number, total: number) => `${page} / ${total}`;
const SOURCE = "방탈로그 테마 데이터 기준";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cafes = pickYearEndCafes(await getAllThemes(), 6);
  if (cafes.length === 0) return new Response("고를 매장이 없어요", { status: 404 });
  const total = cafes.length + 2;
  const page = Math.min(total, Math.max(1, Number(url.searchParams.get("page")) || 1));
  const origin = url.origin;

  // ── 1장: 표지 ──
  if (page === 1) {
    return jpegResponse(
      <Paper label={pageLabel(1, total)} footLeft={<FootPill>넘겨 봐요</FootPill>}>
        <div style={{ display: "flex", marginTop: 70 }}>
          <Sticker tone="y" rotate={-5}>{`서울 방탈출 카페 ${cafes.length}곳`}</Sticker>
        </div>
        <Headline size={116} top={34}>
          <Line>연말 모임,</Line>
          <Line>
            <Em>방탈출 어디서</Em>
          </Line>
          <Line>할까?</Line>
        </Headline>
        <Wig width={400} top={12} />
        <Sub top={40} size={36}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex" }}>겁 많은 친구도 같이 갈 수 있게,</div>
            <div style={{ display: "flex", color: ED.ink, fontWeight: 800 }}>무섭지 않은 테마가 많은 곳만 골랐어요.</div>
          </div>
        </Sub>
        <div style={{ display: "flex", marginTop: 26, fontSize: 24, fontWeight: 500, color: ED.mute, lineHeight: 1.5, wordBreak: "keep-all" }}>
          고른 기준: 서울 · 테마 3개 이상 · 공포도 2 이하 테마가 60% 넘는 곳 · 브랜드당 1곳
        </div>
        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
          <Hand size={66} rotate={-5} style={{ marginBottom: 50, marginLeft: 6 }}>무서운 건 빼고 골랐어요!</Hand>
          <Ghost origin={origin} say="겁쟁이도 환영!" size={180} />
        </div>
      </Paper>,
      3600
    );
  }

  // ── 마지막 장 ──
  if (page === total) {
    return jpegResponse(
      <Paper label={pageLabel(page, total)} footLeft={<FootPill>프로필 링크에서 시작</FootPill>}>
        <Headline size={104} top={90}>
          <Line>다녀온 다음엔,</Line>
          <Line>
            <Em>기록까지</Em>
          </Line>
        </Headline>
        <Wig width={340} top={10} />
        <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
          {["매장별 테마 전체 · 줄거리 · 후기", "우리 팀 궁합으로 다 같이 갈 방 고르기", "다녀온 방은 다이어리로, 연말 결산까지"].map((x, i) => (
            <div key={x} style={{ display: "flex", alignItems: "center", padding: "26px 0", borderTop: i ? `2px solid ${ED.faint}` : "none", fontSize: 38, fontWeight: 800 }}>
              <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, backgroundColor: ED.accent, marginRight: 22 }} />
              {x}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 26, fontWeight: 500, color: ED.mute }}>예약·영업시간은 각 매장 예약 페이지에서 확인해 주세요.</div>
        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
          <Hand size={66} rotate={-5} style={{ marginBottom: 50, marginLeft: 6 }}>다녀온 날, 한 줄만!</Hand>
          <Ghost origin={origin} say="내가 기억해 줄게!" size={180} />
        </div>
      </Paper>,
      3600
    );
  }

  // ── 사이 장: 매장 한 곳 ──
  const c = cafes[page - 2];
  const branch = c.cafe.slice(c.brand.length).trim();
  const brandLen = [...c.brand].length;
  const top3 = c.genres.slice(0, 3);
  return jpegResponse(
    <Paper label={pageLabel(page, total)} footLeft={<FootNote>{SOURCE}</FootNote>}>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 560 }}>
          <Sticker tone="o" rotate={-6}>{`${page - 1}번째 카페`}</Sticker>
          <div style={{ display: "flex", marginTop: 34, fontSize: brandLen > 8 ? 64 : brandLen > 6 ? 76 : 92, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15, wordBreak: "keep-all" }}>{c.brand}</div>
          <Wig width={210} top={10} />
          <div style={{ display: "flex", marginTop: 16, fontSize: 40, fontWeight: 800, color: ED.dim }}>{branch || " "}</div>
        </div>
        {/* 이 매장에 많은 장르 표지(많은 순 3장, 숫자는 그 장르 테마 수) */}
        <div style={{ display: "flex", position: "relative", width: 360, height: 300, marginTop: 6 }}>
          {top3.map((g, i) => (
            <Cover
              key={g.genre}
              genre={g.genre}
              title={`${g.n}개`}
              width={150}
              titleSize={40}
              rotate={[-8, 3, 11][i]}
              style={{ position: "absolute", left: [0, 100, 200][i], top: [26, 6, 40][i] }}
            />
          ))}
        </div>
      </div>

      {/* 장르 구성 막대 */}
      <div style={{ display: "flex", marginTop: 44, height: 22, borderRadius: 11, overflow: "hidden" }}>
        {c.genres.map((g) => (
          <div key={g.genre} style={{ display: "flex", width: `${(g.n / c.count) * 100}%`, backgroundColor: toneOf(g.genre).accent }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 14, fontSize: 26, fontWeight: 800 }}>
        {c.genres.map((g) => (
          <div key={g.genre} style={{ display: "flex", alignItems: "center", marginRight: 22, marginBottom: 6 }}>
            <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, marginRight: 8, backgroundColor: toneOf(g.genre).accent }} />
            {`${g.genre} ${g.n}`}
          </div>
        ))}
      </div>

      <Sheet style={{ flexDirection: "row", marginTop: 32, padding: "26px 0" }}>
        {[
          ["테마", <div key="v" style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>{`${c.count}개`}</div>],
          ["평균 난이도", <Dots key="v" n={c.avgDifficulty} size={22} />],
          ["평균 공포도", <Dots key="v" n={c.avgFear} size={22} color={ED.accent} />],
        ].map(([k, v], i) => (
          <div key={k as string} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 30px", borderLeft: i ? `2px solid ${ED.faint}` : "none" }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: ED.mute }}>{k}</div>
            <div style={{ display: "flex", alignItems: "center", height: 50, marginTop: 8 }}>{v}</div>
          </div>
        ))}
      </Sheet>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 40 }}>
        <Sticker tone="y" rotate={-3} size={26}>이런 모임에</Sticker>
        <div style={{ display: "flex", marginTop: 18, fontSize: 40, fontWeight: 800, lineHeight: 1.35, wordBreak: "keep-all" }}>{c.forWhom}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 30, paddingTop: 26, borderTop: `2px solid ${ED.faint}` }}>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: ED.mute }}>덜 무서운 테마부터</div>
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 8, fontSize: 32, fontWeight: 800, lineHeight: 1.4 }}>
          {c.picks.map((x, i) => (
            <div key={x} style={{ display: "flex", maxWidth: 936, marginRight: 10, wordBreak: "keep-all" }}>{i < c.picks.length - 1 ? `${x} ·` : x}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <Hand size={58} rotate={-4} style={{ marginBottom: 30, marginLeft: 6 }}>덜 무서운 방이 많아요!</Hand>
        <Ghost origin={origin} size={130} />
      </div>
    </Paper>,
    3600
  );
}
