import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// ─────────────────────────────────────────────────────────────
// 인스타 카드 공통(서버 전용): 1080×1350 JPEG 로 그리기 + 디자인 D 부품.
// 인스타 게시 API 는 JPEG 만 받으므로 PNG → JPEG 로 바꿔 돌려준다.
// 디자인 D(docs/design-d.md): 종이색 바탕 · 먹색 글자 · 주황 포인트 하나 · Pretendard 800 제목 · 얇은 선.
// 유쾌한 느낌(tools/ig/templates/diary1~4.html 과 같은 모습): 주황 물결 밑줄, 기울인 알약 스티커,
// 주황 붓글씨 한마디, 탈출귀 말풍선. 로고만 SB어그로.
// 글꼴: Pretendard · 나눔손글씨 붓(둘 다 OFL), SB어그로(상업적 이용 가능 무료 글꼴)
// ─────────────────────────────────────────────────────────────

export const CARD_W = 1080;
export const CARD_H = 1350;

export const ED = {
  bg: "#F5F0E6",
  ink: "#17171A",
  dim: "#55514A", // 본문 보조 글씨
  mute: "#8A8478", // 쪽수·작은 안내
  faint: "#D9D0C2", // 얇은 선
  accent: "#EE7A2B",
  yellow: "#FFD84D", // 스티커
  panel: "#EDE5D6",
  white: "#FFFFFF",
};

// 장르 색 표지(사이트 components/PosterTile.tsx 의 TONE 과 같은 값). 매장 포스터 대신 쓴다.
export const GENRE_TONE: Record<string, { bg: string; accent: string }> = {
  공포: { bg: "#2A1215", accent: "#E5604C" },
  스릴러: { bg: "#1A1E2C", accent: "#8FA3D9" },
  추리: { bg: "#17282A", accent: "#6FC2A6" },
  감성: { bg: "#3A2033", accent: "#F0A7C0" },
  판타지: { bg: "#2A2142", accent: "#B9A6F2" },
  SF: { bg: "#11253B", accent: "#6DB8F2" },
  모험: { bg: "#3A2912", accent: "#F0B45C" },
  코믹: { bg: "#3B3210", accent: "#F2D75C" },
  아케이드: { bg: "#10302F", accent: "#5FD0C5" },
  기타: { bg: "#2B2926", accent: "#D9CFC0" },
};
export const toneOf = (genre: string) => GENRE_TONE[genre] ?? GENRE_TONE["기타"];

type Font = { name: string; data: Buffer; weight: 400 | 500 | 800 };
let fontsCache: Promise<Font[]> | null = null;

export function cardFonts(): Promise<Font[]> {
  fontsCache ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Pretendard-ExtraBold.woff")),
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Medium.woff")),
    readFile(join(process.cwd(), "assets/fonts/SBAggroB.woff")),
    readFile(join(process.cwd(), "assets/fonts/NanumBrushScript.woff")),
  ]).then(([bold, medium, aggro, hand]) => [
    { name: "Pretendard", data: bold, weight: 800 as const },
    { name: "Pretendard", data: medium, weight: 500 as const },
    // 로고 전용 fontFamily: "Aggro"
    { name: "Aggro", data: aggro, weight: 400 as const },
    // 붓글씨 한마디 fontFamily: "Hand" (말줄임표 … 글자는 없으니 ... 로 쓴다)
    { name: "Hand", data: hand, weight: 400 as const },
  ]);
  return fontsCache;
}

export async function jpegResponse(element: ReactElement, cacheSeconds = 3600): Promise<Response> {
  const png = await new ImageResponse(element, {
    width: CARD_W,
    height: CARD_H,
    fonts: await cardFonts(),
  }).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 92 }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
    },
  });
}

// ── 디자인 D 부품 ─────────────────────────────────────────────

export const PAD_X = 72;

// 카드 한 장의 틀: 종이 바탕 + 왼쪽 위 로고 + 오른쪽 위 쪽수(또는 날짜) + 아래 오른쪽 주소.
// footLeft 는 아래 왼쪽(먹색 알약이나 작은 안내 글). children 은 세로로 쌓인다.
export function Paper({
  label,
  footLeft,
  children,
}: {
  label?: string;
  footLeft?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: ED.bg,
        color: ED.ink,
        fontFamily: "Pretendard",
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      {/* 종이 결 흉내: 아주 옅은 얼룩 몇 개 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: CARD_W, height: CARD_H, display: "flex", backgroundImage: "radial-gradient(circle at 18% 12%, rgba(120,95,55,0.07) 0%, rgba(120,95,55,0) 42%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CARD_W, height: CARD_H, display: "flex", backgroundImage: "radial-gradient(circle at 88% 64%, rgba(120,95,55,0.08) 0%, rgba(120,95,55,0) 46%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CARD_W, height: CARD_H, display: "flex", backgroundImage: "radial-gradient(circle at 30% 96%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CARD_W, height: CARD_H, display: "flex", flexDirection: "column", padding: `64px ${PAD_X}px 56px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 }}>
          <div style={{ display: "flex", fontFamily: "Aggro", fontSize: 30, letterSpacing: "0" }}>방탈로그</div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: ED.mute }}>{label ?? ""}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 66 }}>
          <div style={{ display: "flex" }}>{footLeft ?? null}</div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>bangtallog.com</div>
        </div>
      </div>
    </div>
  );
}

// 아래 왼쪽 먹색 알약
export const FootPill = ({ children }: { children: string }) => (
  <div style={{ display: "flex", backgroundColor: ED.ink, color: ED.white, borderRadius: 999, padding: "16px 30px", fontSize: 28, fontWeight: 800 }}>{children}</div>
);
// 아래 왼쪽 작은 안내 글(예시 표시·출처)
export const FootNote = ({ children }: { children: string }) => (
  <div style={{ display: "flex", fontSize: 22, fontWeight: 500, color: ED.mute }}>{children}</div>
);

// 큰 제목. 줄마다 <div> 로, 주황 부분은 <Em>
export function Headline({ size = 96, top = 56, children }: { size?: number; top?: number; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: top, fontSize: size, fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.035em" }}>
      {children}
    </div>
  );
}
export const Line = ({ children }: { children: ReactNode }) => <div style={{ display: "flex" }}>{children}</div>;
export const Em = ({ children }: { children: ReactNode }) => <div style={{ display: "flex", color: ED.accent }}>{children}</div>;

// 주황 물결 밑줄
export function Wig({ width = 300, top = 10 }: { width?: number; top?: number }) {
  const n = Math.max(2, Math.round(width / 30));
  let d = "M3 12 Q18 -2 33 12";
  for (let i = 2; i <= n; i++) d += ` T${3 + i * 30} 12`;
  const w = n * 30 + 6;
  return (
    <div style={{ display: "flex", marginTop: top, width: w, height: 24 }}>
      <svg width={w} height={24} viewBox={`0 0 ${w} 24`}>
        <path d={d} fill="none" stroke={ED.accent} strokeWidth={6} strokeLinecap="round" />
      </svg>
    </div>
  );
}

export const Sub = ({ children, top = 26, size = 34 }: { children: ReactNode; top?: number; size?: number }) => (
  <div style={{ display: "flex", marginTop: top, fontSize: size, fontWeight: 500, lineHeight: 1.5, color: ED.dim, wordBreak: "keep-all" }}>{children}</div>
);

// 기울인 알약 스티커(노랑·주황·흰색) — 먹색 테두리 + 작은 그림자
export function Sticker({
  children,
  tone = "y",
  rotate = -6,
  size = 30,
  style,
}: {
  children: ReactNode;
  tone?: "y" | "o" | "w";
  rotate?: number;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: tone === "o" ? ED.accent : tone === "w" ? ED.white : ED.yellow,
        color: ED.ink,
        fontSize: size,
        fontWeight: 800,
        padding: `${Math.round(size * 0.4)}px ${Math.round(size * 0.73)}px`,
        borderRadius: 999,
        border: `3px solid ${ED.ink}`,
        boxShadow: `4px 5px 0 ${ED.ink}`,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// 주황 붓글씨 한마디
export function Hand({ children, size = 62, rotate = -5, style }: { children: string; size?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", fontFamily: "Hand", fontWeight: 400, fontSize: size, lineHeight: 1, letterSpacing: "0", color: ED.accent, whiteSpace: "nowrap", transform: `rotate(${rotate}deg)`, ...style }}>
      {children}
    </div>
  );
}

// 탈출귀 + 말풍선(오른쪽 아래에 놓는다). 폭은 글 길이에 맞춰 늘어난다.
export function Ghost({ origin, say, size = 200, style }: { origin: string; say?: string; size?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", ...style }}>
      {say && (
        <div style={{ display: "flex", position: "relative", marginRight: -34, marginTop: 0 }}>
          <div style={{ display: "flex", backgroundColor: ED.white, border: `3px solid ${ED.ink}`, borderRadius: 28, padding: "14px 24px", fontSize: 30, fontWeight: 800, whiteSpace: "nowrap" }}>{say}</div>
          <div style={{ position: "absolute", right: 46, bottom: -12, width: 26, height: 26, display: "flex", backgroundColor: ED.white, borderRight: `3px solid ${ED.ink}`, borderBottom: `3px solid ${ED.ink}`, transform: "rotate(45deg)" }} />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${origin}/mascot.png`} alt="" width={size} height={size} style={{ marginTop: say ? 44 : 0, transform: "rotate(8deg)" }} />
    </div>
  );
}

// 장르 색 표지(2:3). 매장 포스터를 쓰지 않고 장르 색 + 글자만으로 그린다.
export function Cover({
  genre,
  title,
  width = 200,
  rotate = 0,
  titleSize,
  style,
}: {
  genre: string;
  title: string;
  width?: number;
  rotate?: number;
  titleSize?: number;
  style?: CSSProperties;
}) {
  const t = toneOf(genre);
  const pad = Math.round(width * 0.1);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width,
        height: Math.round(width * 1.5),
        padding: pad,
        borderRadius: Math.round(width * 0.08),
        backgroundColor: t.bg,
        backgroundImage: `linear-gradient(160deg, ${t.accent}33 0%, ${t.accent}00 55%)`,
        boxShadow: "0 14px 28px rgba(60,45,20,0.22)",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      <div style={{ display: "flex", fontSize: Math.max(14, Math.round(width * 0.1)), fontWeight: 800, letterSpacing: "0.06em", color: t.accent }}>{genre}</div>
      <div style={{ display: "flex", fontSize: titleSize ?? Math.round(width * 0.15), fontWeight: 800, lineHeight: 1.2, color: "#F5F0E6", wordBreak: "keep-all" }}>{title}</div>
      <div style={{ display: "flex", height: Math.max(3, Math.round(width * 0.02)), borderRadius: 4, backgroundColor: `${t.accent}99` }} />
    </div>
  );
}

// 흰 종이 카드(얇은 선). 굵은 테두리·오프셋 그림자 카드는 쓰지 않는다.
export function Sheet({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", backgroundColor: ED.white, border: `2px solid ${ED.faint}`, borderRadius: 26, boxShadow: "0 10px 24px rgba(60,45,20,0.08)", ...style }}>
      {children}
    </div>
  );
}

// 난이도·공포도 점 5개
export function Dots({ n, size = 18, color = ED.ink }: { n: number; size?: number; color?: string }) {
  const k = Math.round(n);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: "flex", width: size, height: size, borderRadius: size, marginRight: i < 5 ? Math.round(size * 0.3) : 0, border: `2px solid ${i <= k ? color : ED.faint}`, backgroundColor: i <= k ? color : "transparent" }} />
      ))}
    </div>
  );
}
