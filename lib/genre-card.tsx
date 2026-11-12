import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// 장르별 분위기 카드(오늘의 미스터리 방 기본 디자인).
// 매일 장르가 바뀌니 피드도 매일 다르게 보이도록, 장르마다 색·장치를 다르게 그린다.
// public/ig-bg/{테마키}.jpg 가 있으면(제미나이 등으로 만든 글자 없는 배경 그림)
// 그 위에 어둡게 깔고 글자를 얹는다. 없으면 아래 도형 테마로 그린다.
// ─────────────────────────────────────────────────────────────

export type MoodKey = "horror" | "noir" | "dream" | "scifi" | "pop";

export function moodOf(genre: string): MoodKey {
  if (genre === "공포") return "horror";
  if (genre === "추리" || genre === "스릴러") return "noir";
  if (genre === "감성" || genre === "판타지") return "dream";
  if (genre === "SF" || genre === "아케이드") return "scifi";
  return "pop";
}

type Mood = {
  bg: string;
  bgImage?: string;
  text: string;
  dim: string;
  accent: string;
  label: string; // 맨 위 작은 라벨
  question: string; // 큰 질문
  chipBorder: string;
};

const MOODS: Record<MoodKey, Mood> = {
  horror: {
    bg: "#0A0A0B",
    bgImage: "radial-gradient(ellipse at 50% 110%, #5A0710 0%, #1A0406 45%, #0A0A0B 75%)",
    text: "#EDE6E1",
    dim: "#8E8580",
    accent: "#D4182F",
    label: "들어가기 전에 읽으세요",
    question: "이 방, 들어갈 수 있겠어?",
    chipBorder: "#D4182F",
  },
  noir: {
    bg: "#101010",
    bgImage: "radial-gradient(ellipse at 20% 0%, #4A4A4A 0%, #1C1C1C 40%, #0C0C0C 80%)",
    text: "#F2F0EA",
    dim: "#9C9890",
    accent: "#F2C230",
    label: "CASE FILE · 미제 사건",
    question: "이 사건, 어느 방이게?",
    chipBorder: "#F2F0EA",
  },
  dream: {
    bg: "#2B1E5C",
    bgImage: "linear-gradient(170deg, #1E1A4D 0%, #3D2A7A 45%, #B5658F 100%)",
    text: "#FFF8F2",
    dim: "#D9C9E8",
    accent: "#FFD27A",
    label: "오늘 밤의 이야기",
    question: "이 이야기, 어느 방일까?",
    chipBorder: "#FFD27A",
  },
  scifi: {
    bg: "#06111F",
    bgImage: "radial-gradient(ellipse at 80% 20%, #0D3350 0%, #06111F 60%)",
    text: "#E6F7FF",
    dim: "#7FA8C2",
    accent: "#4FD1FF",
    label: "SIGNAL DETECTED",
    question: "이 좌표, 어느 방일까?",
    chipBorder: "#4FD1FF",
  },
  pop: {
    bg: "#FFD84A",
    text: "#1D1D1D",
    dim: "#5C4A12",
    accent: "#1D1D1D",
    label: "오늘의 미스터리 방",
    question: "이 방, 어디게?!",
    chipBorder: "#1D1D1D",
  },
};

// 결정적 난수(같은 날 같은 그림)
function rand(seed: number) {
  let x = seed || 1;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

function Decor({ mood, seed }: { mood: MoodKey; seed: number }): ReactNode {
  const r = rand(seed);
  if (mood === "horror") {
    // 위에서 흘러내리는 핏자국
    const drips = Array.from({ length: 11 }, (_, i) => ({
      left: i * 100 + Math.floor(r() * 40),
      w: 18 + Math.floor(r() * 26),
      h: 30 + Math.floor(r() * 150),
    }));
    return (
      <>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 34, backgroundColor: "#8E0B1C", display: "flex" }} />
        {drips.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.left,
              top: 20,
              width: d.w,
              height: d.h,
              borderRadius: d.w,
              backgroundColor: "#8E0B1C",
              display: "flex",
            }}
          />
        ))}
      </>
    );
  }
  if (mood === "noir") {
    // 비 내리는 사선 + 노란 수사 테이프
    const rain = Array.from({ length: 70 }, () => ({
      left: Math.floor(r() * 1200) - 60,
      top: Math.floor(r() * 1350) - 100,
      h: 60 + Math.floor(r() * 120),
      o: 0.08 + r() * 0.18,
    }));
    return (
      <>
        {rain.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.left,
              top: d.top,
              width: 2,
              height: d.h,
              backgroundColor: "#FFFFFF",
              opacity: d.o,
              transform: "rotate(14deg)",
              display: "flex",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: -80,
            top: 470,
            width: 1260,
            height: 64,
            backgroundColor: "#F2C230",
            transform: "rotate(-6deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111",
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "0.2em",
          }}
        >
          KEEP OUT · 수사 중 · KEEP OUT · 수사 중 · KEEP OUT
        </div>
      </>
    );
  }
  if (mood === "dream") {
    // 별 + 초승달
    const stars = Array.from({ length: 46 }, () => ({
      left: Math.floor(r() * 1080),
      top: Math.floor(r() * 760),
      s: 3 + Math.floor(r() * 6),
      o: 0.4 + r() * 0.6,
    }));
    return (
      <>
        {stars.map((d, i) => (
          <div key={i} style={{ position: "absolute", left: d.left, top: d.top, width: d.s, height: d.s, borderRadius: d.s, backgroundColor: "#FFF6D8", opacity: d.o, display: "flex" }} />
        ))}
        <div style={{ position: "absolute", left: 810, top: 360, width: 150, height: 150, borderRadius: 75, backgroundColor: "#FFE7A6", display: "flex" }} />
        <div style={{ position: "absolute", left: 844, top: 338, width: 150, height: 150, borderRadius: 75, backgroundColor: "#2F2468", display: "flex" }} />
      </>
    );
  }
  if (mood === "scifi") {
    // 격자 + 화면 모서리 괄호
    const lines = [];
    for (let x = 0; x <= 1080; x += 90)
      lines.push(<div key={`x${x}`} style={{ position: "absolute", left: x, top: 0, width: 1, height: 1350, backgroundColor: "#4FD1FF", opacity: 0.12, display: "flex" }} />);
    for (let y = 0; y <= 1350; y += 90)
      lines.push(<div key={`y${y}`} style={{ position: "absolute", left: 0, top: y, width: 1080, height: 1, backgroundColor: "#4FD1FF", opacity: 0.12, display: "flex" }} />);
    const corner = (pos: Record<string, number>, bt: boolean, lr: boolean) => (
      <div
        style={{
          position: "absolute",
          ...pos,
          width: 70,
          height: 70,
          display: "flex",
          borderColor: "#4FD1FF",
          borderStyle: "solid",
          borderWidth: `${bt ? 0 : 5}px ${lr ? 5 : 0}px ${bt ? 5 : 0}px ${lr ? 0 : 5}px`,
        }}
      />
    );
    return (
      <>
        {lines}
        {corner({ left: 40, top: 40 }, false, false)}
        {corner({ left: 970, top: 40 }, false, true)}
        {corner({ left: 40, top: 1240 }, true, false)}
        {corner({ left: 970, top: 1240 }, true, true)}
      </>
    );
  }
  // pop: 큰 물음표·느낌표
  return (
    <div
      style={{
        position: "absolute",
        right: -30,
        top: 60,
        fontSize: 560,
        fontWeight: 800,
        color: "#1D1D1D",
        opacity: 0.08,
        letterSpacing: "-0.08em",
        display: "flex",
      }}
    >
      ?!
    </div>
  );
}

export function genreCard(p: {
  teaser: string;
  genre: string;
  difficulty: number;
  fear: number;
  region: string | null;
  date: string;
  origin: string;
  seed: number;
  bgUrl?: string | null; // public/ig-bg 의 배경 그림(있으면)
  reveal?: { name: string; cafe: string }; // "이 방의 이야기": 이름을 공개하는 카드
}) {
  const key = moodOf(p.genre);
  const m = MOODS[key];
  const scale = (n: number) => `${"●".repeat(n)}${"○".repeat(Math.max(0, 5 - n))}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: m.bg,
        // 값이 없을 때 backgroundImage 키 자체를 빼야 한다(undefined 를 넣으면 그리기 오류)
        ...(!p.bgUrl && m.bgImage ? { backgroundImage: m.bgImage } : {}),
        color: m.text,
        fontFamily: "Pretendard",
      }}
    >
      {p.bgUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.bgUrl} alt="" width={1080} height={1350} style={{ position: "absolute", left: 0, top: 0, objectFit: "cover" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1350, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.85) 100%)" }} />
        </>
      ) : (
        <Decor mood={key} seed={p.seed} />
      )}

      {/* 글자 층: 장식은 카드 가장자리 기준, 글자만 여백 안쪽 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1350,
          display: "flex",
          flexDirection: "column",
          padding: key === "horror" ? "250px 92px 84px" : "110px 92px 84px",
        }}
      >

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, letterSpacing: "0.16em" }}>
        <div style={{ color: m.accent }}>{m.label}</div>
        <div style={{ color: m.dim }}>{p.date}</div>
      </div>

      <div style={{ display: "flex", marginTop: 60, fontSize: 84, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.045em", color: m.text }}>
        {p.reveal ? p.reveal.name : m.question}
      </div>
      {p.reveal && (
        <div style={{ display: "flex", marginTop: 14, fontSize: 32, fontWeight: 800, color: m.dim }}>{p.reveal.cafe}</div>
      )}

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          fontSize: 50,
          fontWeight: 800,
          lineHeight: 1.5,
          letterSpacing: "-0.03em",
          wordBreak: "keep-all",
        }}
      >
        {`“${p.teaser}”`}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 44 }}>
        {[p.genre, `난이도 ${scale(p.difficulty)}`, `공포도 ${scale(p.fear)}`, p.region ?? ""]
          .filter(Boolean)
          .map((c) => (
            <div
              key={c}
              style={{ display: "flex", padding: "12px 24px", borderRadius: 999, border: `3px solid ${m.chipBorder}`, fontSize: 30, fontWeight: 800 }}
            >
              {c}
            </div>
          ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 56 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: key === "pop" ? m.text : m.accent }}>
            {p.reveal ? "줄거리·후기 → 프로필 링크" : "정답은 프로필 링크에서"}
          </div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 500, color: m.dim }}>방탈로그 · bangtallog.com</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${p.origin}/mascot.png`} alt="" width={120} height={120} />
      </div>
      </div>
    </div>
  );
}
