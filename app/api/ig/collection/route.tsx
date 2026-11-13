import { getAllThemes } from "@/lib/catalog-server";
import { areaThemes, pickCollection, storyLine } from "@/lib/collection";
import type { ThemeRow } from "@/lib/catalog-server";
import { fearLabel } from "@/lib/terms";
import { Cover, Dots, ED, Em, FootNote, FootPill, Ghost, Hand, Headline, Line, Paper, Sheet, Sticker, Sub, Wig, jpegResponse } from "@/lib/og-card";

// 지역 모음 캐러셀: ?area=수원&page=1..N (1=표지, 마지막=전체 보기, 사이=조건별 고르기)
// 정보성 소개(대가 없음). 매장 공식 소개 기준 데이터만 쓴다.
// 디자인 D: 종이 바탕 · 먹색 글자 · 주황 포인트 하나 · 얇은 선. 테마마다 장르 색 표지(매장 포스터는 쓰지 않는다).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCE = "정보는 각 매장 공식 소개 기준";

// 섹션별 꼬리표(스티커 색만 다르게: 노랑·주황·흰색)
const THEME: Record<string, { tone: "y" | "o" | "w"; label: string; hand: string }> = {
  fear: { tone: "o", label: "공포 MAX", hand: "심장 약한 분은 다음 장으로!" },
  calm: { tone: "w", label: "무섭지 않아요", hand: "겁쟁이도 마음 놓고!" },
  first: { tone: "y", label: "입문 추천", hand: "첫 방은 여기서 골라 봐요!" },
  story: { tone: "w", label: "스토리 맛집", hand: "줄거리부터 읽어 봐요!" },
};

const chip = (x: string) => (
  <div key={x} style={{ display: "flex", marginLeft: 8, backgroundColor: ED.white, border: `2px solid ${ED.ink}`, borderRadius: 999, padding: "3px 14px", fontSize: 21, fontWeight: 800 }}>{x}</div>
);
const small = (x: string) => <div style={{ display: "flex", fontSize: 21, fontWeight: 800, color: ED.mute, marginRight: 8 }}>{x}</div>;

// 섹션 목적에 맞는 정보만 카드 아랫줄에: 공포=얼마나 무서운지, 처음=난이도·시간·인원, 이야기=줄거리 한 줄
function Detail({ t, k }: { t: ThemeRow; k: string }) {
  const cafe = <div style={{ display: "flex", fontSize: 23, fontWeight: 500, color: ED.dim }}>{t.cafe}</div>;
  if (k === "story") {
    const line = storyLine(t);
    return (
      <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
        {line ? <div style={{ display: "flex", fontSize: 25, fontWeight: 500, color: ED.ink }}>{`“${line}”`}</div> : null}
        <div style={{ display: "flex", marginTop: 4 }}>{cafe}</div>
      </div>
    );
  }
  const right =
    k === "fear" ? (
      <div style={{ display: "flex", alignItems: "center" }}>
        {small("공포")}
        <Dots n={t.fear_level} size={15} color={ED.accent} />
        {chip(fearLabel(t.fear_level) || "공포")}
      </div>
    ) : k === "first" ? (
      <div style={{ display: "flex" }}>
        {[`난이도 ${t.difficulty}/5`, t.time_limit ? `${t.time_limit}분` : "", t.players ? `${t.players.replace(/명|인/g, "")}인` : ""].filter(Boolean).map(chip)}
      </div>
    ) : (
      // calm: 무섭지 않다는 걸 먼저, 난이도는 옆에
      <div style={{ display: "flex", alignItems: "center" }}>
        {small("난이도")}
        <Dots n={t.difficulty} size={15} />
        {chip("무공포")}
      </div>
    );
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
      {cafe}
      {right}
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
  const label = `${page} / ${total}`;
  const origin = url.origin;

  // ── 1장: 표지 ──
  if (page === 1) {
    return jpegResponse(
      <Paper label={label} footLeft={<FootPill>넘겨 봐요</FootPill>}>
        <div style={{ display: "flex", marginTop: 64 }}>
          <Sticker tone="y" rotate={-5}>{`테마 ${themes.length}개 · 브랜드 ${brands}곳에서 골랐어요`}</Sticker>
        </div>
        <Headline size={[...area].length > 3 ? 100 : 116} top={34}>
          <Line>{`${area} 방탈출,`}</Line>
          <Line>
            <Em>어디 갈지</Em>
          </Line>
          <Line>고민이라면?</Line>
        </Headline>
        <Wig width={400} top={12} />
        {/* 안에 뭐가 있는지 미리 보여 주는 스티커들 */}
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 54 }}>
          {sections.map((s, i) => (
            <Sticker key={s.key} tone={(THEME[s.key] ?? THEME.first).tone} rotate={[-3, 2, 3, -2][i % 4]} size={32} style={{ marginRight: 20, marginBottom: 26 }}>
              {s.title}
            </Sticker>
          ))}
        </div>
        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
          <Hand size={66} rotate={-5} style={{ marginBottom: 50, marginLeft: 6 }}>조건별로 골라 놨어요!</Hand>
          <Ghost origin={origin} say="같이 골라 보자!" size={180} />
        </div>
      </Paper>,
      3600
    );
  }

  // ── 마지막 장: 전체 보러 가기 ──
  if (page === total) {
    return jpegResponse(
      <Paper label={label} footLeft={<FootPill>프로필 링크에서 보기</FootPill>}>
        <Headline size={96} top={90}>
          <Line>{`${area} 테마 ${themes.length}개,`}</Line>
          <Line>
            <Em>전부 보고 싶다면</Em>
          </Line>
        </Headline>
        <Wig width={520} top={10} />
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
          {[`검색창에 "${area}"`, "줄거리 · 난이도 · 공포도 · 후기", "내 취향에 딱 맞는 방 추천까지"].map((x, i) => (
            <div key={x} style={{ display: "flex", alignItems: "center", padding: "26px 0", borderTop: i ? `2px solid ${ED.faint}` : "none", fontSize: 40, fontWeight: 800 }}>
              <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, backgroundColor: ED.accent, marginRight: 22 }} />
              {x}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 26, fontWeight: 500, color: ED.mute }}>{`${SOURCE}예요. 방문 전 매장 예약 페이지에서 확인해 주세요.`}</div>
        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
          <Hand size={66} rotate={-5} style={{ marginBottom: 50, marginLeft: 6 }}>다녀오면 기록도 남겨요!</Hand>
          <Ghost origin={origin} say="내가 기억해 줄게!" size={180} />
        </div>
      </Paper>,
      3600
    );
  }

  // ── 사이 장: 조건별 고르기 ──
  const s = sections[page - 2];
  const c = THEME[s.key] ?? THEME.first;
  return jpegResponse(
    <Paper label={label} footLeft={<FootNote>{SOURCE}</FootNote>}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 40 }}>
        <Sticker tone={c.tone} rotate={-5} size={28}>{c.label}</Sticker>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: ED.mute, marginTop: 10 }}>{`${area} 방탈출`}</div>
      </div>
      <Headline size={88} top={26}>
        <Line>{s.title}</Line>
      </Headline>
      <Wig width={300} top={6} />
      <Sub top={16} size={30}>{s.sub}</Sub>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
        {s.themes.map((t, i) => (
          <Sheet key={t.id} style={{ flexDirection: "row", alignItems: "center", padding: "18px 26px 18px 20px", marginTop: i ? 18 : 0, transform: `rotate(${[-0.6, 0.5, -0.4, 0.6][i % 4]}deg)` }}>
            <Cover genre={t.genre} title="" width={74} style={{ boxShadow: "0 6px 12px rgba(60,45,20,0.18)" }} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: 24 }}>
              <div style={{ display: "flex", fontSize: [...t.name].length > 18 ? 30 : 36, fontWeight: 800, lineHeight: 1.2, wordBreak: "keep-all" }}>{t.name}</div>
              <Detail t={t} k={s.key} />
            </div>
          </Sheet>
        ))}
      </div>
      <div style={{ display: "flex", flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
        <Hand size={50} rotate={-3}>{c.hand}</Hand>
      </div>
    </Paper>,
    3600
  );
}
