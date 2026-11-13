import { Cover, Dots, ED, FootPill, Ghost, Hand, Headline, Em, Line, Paper, Sheet, Sticker, Wig } from "@/lib/og-card";

// ─────────────────────────────────────────────────────────────
// 디자인 D 줄거리 카드: "오늘의 미스터리 방"(이름 숨김)과 "이 방의 이야기"(이름 공개).
// 종이 바탕 · 먹색 글자 · 주황 포인트 하나. 매장 포스터는 쓰지 않고 장르 색 표지를 그린다.
// 줄거리·장르·난이도·공포도·지역은 모두 DB 값 그대로.
// ─────────────────────────────────────────────────────────────

export function paperStoryCard(p: {
  teaser: string;
  genre: string;
  difficulty: number;
  fear: number;
  region: string | null;
  date: string; // 오른쪽 위(날짜 또는 "이 방의 이야기")
  origin: string;
  reveal?: { name: string; cafe: string }; // 이름을 공개하는 카드
}) {
  // 크롤링 원문에 섞인 HTML 문자 표기·특수 공백만 풀어 준다(내용은 그대로)
  const teaser = p.teaser
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/[\s\u00a0\u3000]+/g, " ")
    .trim();
  const len = [...teaser].length;
  const teaserSize = len > 100 ? 38 : len > 70 ? 46 : len > 40 ? 52 : 58;
  const nameLen = p.reveal ? [...p.reveal.name].length : 0;
  const nameSize = nameLen > 22 ? 56 : nameLen > 14 ? 66 : nameLen > 8 ? 80 : 96;

  // 긴 이름 + 긴 줄거리가 겹치면 아래 장식을 줄여 자리를 만든다
  const tight = len > 100 && nameLen > 14;

  return (
    <Paper label={p.date} footLeft={<FootPill>{p.reveal ? "줄거리·후기는 프로필 링크에서" : "정답은 프로필 링크에서"}</FootPill>}>
      {/* 머리: 스티커 + 큰 제목(왼쪽) · 장르 색 표지(오른쪽) */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 44 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 660 }}>
          <Sticker tone="y" rotate={-5}>{p.reveal ? "이 방의 이야기" : "오늘의 미스터리 방"}</Sticker>
          {p.reveal ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", marginTop: 34, fontSize: nameSize, fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.035em", wordBreak: "keep-all" }}>{p.reveal.name}</div>
              <Wig width={240} top={12} />
              <div style={{ display: "flex", marginTop: 16, fontSize: 32, fontWeight: 800, color: ED.dim }}>{p.reveal.cafe}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Headline size={96} top={30}>
                <Line>이 줄거리,</Line>
                <Line>
                  <Em>어느 방</Em>일까?
                </Line>
              </Headline>
              <Wig width={300} top={8} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", marginTop: 16, marginRight: 14 }}>
          <Cover
            genre={p.genre}
            title={p.reveal ? p.reveal.name : "?"}
            width={220}
            rotate={6}
            titleSize={p.reveal ? (nameLen > 14 ? 24 : 30) : 150}
          />
        </div>
      </div>

      {/* 줄거리: 살짝 기운 흰 종이 */}
      <Sheet style={{ position: "relative", marginTop: 56, padding: "46px 44px 38px", transform: "rotate(-1.2deg)" }}>
        {/* 큰 따옴표 장식(닫는 따옴표가 혼자 다음 줄로 넘어가지 않게 글에는 따옴표를 넣지 않는다) */}
        <div style={{ position: "absolute", left: 34, top: -34, display: "flex", fontSize: 130, fontWeight: 800, lineHeight: 1, color: ED.accent }}>“</div>
        <div style={{ display: "flex", fontSize: teaserSize, fontWeight: 800, lineHeight: 1.5, letterSpacing: "-0.03em", wordBreak: "keep-all" }}>{teaser}</div>
      </Sheet>

      {/* 단서: DB 값 그대로 */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 40, fontSize: 28, fontWeight: 800 }}>
        <div style={{ display: "flex", color: ED.mute, marginRight: 12 }}>난이도</div>
        <Dots n={p.difficulty} />
        <div style={{ display: "flex", color: ED.mute, marginLeft: 36, marginRight: 12 }}>공포도</div>
        <Dots n={p.fear} color={ED.accent} />
        {p.region && <div style={{ display: "flex", marginLeft: 36, padding: "6px 18px", borderRadius: 999, border: `2px solid ${ED.ink}` }}>{p.region}</div>}
      </div>

      <div style={{ display: "flex", flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
        <Hand size={tight ? 52 : 64} rotate={-5} style={{ marginBottom: tight ? 30 : 46, marginLeft: 6 }}>{p.reveal ? "다녀왔다면 댓글로 알려 줘요!" : "아는 방이면 댓글로 찍어 봐요!"}</Hand>
        <Ghost origin={p.origin} say={tight ? undefined : p.reveal ? "여기 가 봤어?" : "어딘지 알겠어?"} size={tight ? 130 : 170} />
      </div>
    </Paper>
  );
}
