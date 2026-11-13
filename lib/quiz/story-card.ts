import type { Draw, TypeId } from "./slots";
import { MASCOT, PLAYERS_LABEL, QUIZ_TYPES, typeImage } from "./types";
import { fearTrait } from "../terms";
import { wrapText } from "../review-image";

// ─────────────────────────────────────────────────────────────
// 결과 스토리 카드(1080×1920, 9:16). 인스타 스토리에 그대로 올릴 수 있게 브라우저 캔버스로 그린다.
// 위 220px·아래 250px 은 인스타 화면(프로필·답장 칸)이 덮으므로 비워 둔다.
// 내용(무엇을 쓸지)은 storyCardContent 가, 그림(어떻게 그릴지)은 makeStoryCard 가 맡는다.
// ─────────────────────────────────────────────────────────────

export const STORY_W = 1080;
export const STORY_H = 1920;
export const STORY_SAFE_TOP = 220;
export const STORY_SAFE_BOTTOM = 250;

export const HINT_NOTE = ["", "끝까지 버틴다", "웬만하면 버틴다", "적당히 쓴다", "막히면 쓴다", "바로 쓴다"];

// 끌림(draw)마다 한 가지 깊은 색. 크림 바탕 위에서 차분하게 보이는 톤만 쓴다.
export const DRAW_TONE: Record<Draw, string> = {
  thrill: "#8E3B2E", // 옥스블러드
  brain: "#2E4A66", // 잉크 네이비
  story: "#7A4A5E", // 모브
  explore: "#3F5F4A", // 포레스트
};

export interface StoryCardInput {
  typeId: TypeId;
  fear: number; // 1~5
  hint: number; // 1~5
  players: number; // 1 | 2 | 4 | 5 | 0
  eyebrow?: string; // 기본 "나의 방탈출 유형"
}

export interface StoryTrait {
  label: string;
  value: string;
  dots?: number; // 있으면 값 앞에 5칸 점으로 그린다
}

export interface StoryCardContent {
  no: string; // "07 / 16"
  eyebrow: string;
  title: string;
  tagline: string;
  traits: StoryTrait[];
  tone: string;
  image: string;
}

const clamp5 = (n: number) => Math.min(5, Math.max(1, Math.round(n) || 1));

export function storyCardContent(r: StoryCardInput): StoryCardContent {
  const ids = Object.keys(QUIZ_TYPES) as TypeId[];
  const type = QUIZ_TYPES[r.typeId];
  const fear = clamp5(r.fear);
  const hint = clamp5(r.hint);
  return {
    no: `${String(ids.indexOf(r.typeId) + 1).padStart(2, "0")} / ${ids.length}`,
    eyebrow: r.eyebrow ?? "나의 방탈출 유형",
    title: type.title,
    tagline: type.tagline,
    traits: [
      { label: "공포 내성", value: fearTrait(fear), dots: fear },
      { label: "힌트", value: HINT_NOTE[hint] },
      { label: "인원", value: PLAYERS_LABEL[r.players] ?? "상관없음" },
    ],
    tone: DRAW_TONE[r.typeId.split("-")[0] as Draw],
    image: typeImage(r.typeId),
  };
}

// ── 그리기(브라우저 전용) ──

const PAPER = "#F5F0E6";
const INK = "#1D1D1D";
const ORANGE = "#E49A4A";
const M = 96; // 좌우 여백

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load('96px "SBAggroB"', "방탈"),
      document.fonts.load('500 36px "Pretendard"', "방탈"),
      document.fonts.load('700 24px "Pretendard"', "방탈"),
      document.fonts.load('800 32px "Pretendard"', "방탈"),
    ]);
    await document.fonts.ready;
  } catch {
    // 글꼴을 못 불러와도 기본 글꼴로 그린다
  }
}

// 자간을 넓힌 작은 라벨(영문 스몰캡스 느낌). canvas letterSpacing 이 없는 브라우저도 있어 한 글자씩 놓는다.
function spaced(c: CanvasRenderingContext2D, text: string, x: number, y: number, gap: number, align: "left" | "right" | "center") {
  const chars = Array.from(text);
  const width = chars.reduce((w, ch) => w + c.measureText(ch).width, 0) + gap * (chars.length - 1);
  let cx = align === "left" ? x : align === "right" ? x - width : x - width / 2;
  c.textAlign = "left";
  for (const ch of chars) {
    c.fillText(ch, cx, y);
    cx += c.measureText(ch).width + gap;
  }
  return width;
}

function rule(c: CanvasRenderingContext2D, x1: number, x2: number, y: number, w = 2, color = INK) {
  c.fillStyle = color;
  c.fillRect(x1, y - w / 2, x2 - x1, w);
}

export async function drawStoryCard(canvas: HTMLCanvasElement, input: StoryCardInput): Promise<void> {
  const d = storyCardContent(input);
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const c = canvas.getContext("2d")!;
  await loadFonts();
  const TITLE = '"SBAggroB", "Pretendard", sans-serif';
  const BODY = '"Pretendard", system-ui, sans-serif';
  const CX = STORY_W / 2;

  // 종이
  c.fillStyle = PAPER;
  c.fillRect(0, 0, STORY_W, STORY_H);
  // 아주 옅은 가장자리 음영(종이 질감 대신)
  const vg = c.createRadialGradient(CX, STORY_H * 0.45, STORY_H * 0.3, CX, STORY_H * 0.45, STORY_H * 0.75);
  vg.addColorStop(0, "rgba(29,29,29,0)");
  vg.addColorStop(1, "rgba(29,29,29,0.06)");
  c.fillStyle = vg;
  c.fillRect(0, 0, STORY_W, STORY_H);
  // 바깥 테두리(가는 선 한 줄)
  c.strokeStyle = "rgba(29,29,29,0.35)";
  c.lineWidth = 1.5;
  c.strokeRect(40, 40, STORY_W - 80, STORY_H - 80);

  c.textBaseline = "alphabetic";

  // ── 머리말: 브랜드 · 번호 ──
  let y = 272;
  c.fillStyle = ORANGE;
  c.beginPath();
  c.arc(M + 6, y - 8, 6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = INK;
  c.font = `800 22px ${BODY}`;
  spaced(c, "BANGTALLOG", M + 24, y, 6, "left");
  c.font = `700 22px ${BODY}`;
  c.fillStyle = "rgba(29,29,29,0.6)";
  spaced(c, `TYPE ${d.no}`, STORY_W - M, y, 4, "right");
  y += 28;
  rule(c, M, STORY_W - M, y, 2);

  // ── 유형 그림(주인공) ──
  const S = 640;
  const ix = CX - S / 2;
  const iy = 364;
  const img = (await loadImage(d.image)) ?? (await loadImage(MASCOT.image));
  c.fillStyle = `${d.tone}1A`;
  c.fillRect(ix, iy, S, S);
  if (img) {
    const s = Math.max(S / img.width, S / img.height);
    const w = img.width * s;
    const h = img.height * s;
    c.save();
    c.beginPath();
    c.rect(ix, iy, S, S);
    c.clip();
    c.drawImage(img, ix + (S - w) / 2, iy + (S - h) / 2, w, h);
    c.restore();
  }
  // 이중 액자선: 안쪽 굵은 먹선 + 바깥 가는 선
  c.strokeStyle = INK;
  c.lineWidth = 3;
  c.strokeRect(ix, iy, S, S);
  c.lineWidth = 1.5;
  c.strokeRect(ix - 16, iy - 16, S + 32, S + 32);

  // ── 라벨: — 나의 방탈출 유형 — ──
  y = iy + S + 98;
  c.font = `700 26px ${BODY}`;
  c.fillStyle = d.tone;
  const ew = spaced(c, d.eyebrow, CX, y, 6, "center");
  rule(c, CX - ew / 2 - 72, CX - ew / 2 - 24, y - 9, 1.5, d.tone);
  rule(c, CX + ew / 2 + 24, CX + ew / 2 + 72, y - 9, 1.5, d.tone);

  // ── 유형 이름(가장 크게, 한 줄에 맞춘다) ──
  y += 112;
  let size = 108;
  c.font = `${size}px ${TITLE}`;
  while (c.measureText(d.title).width > STORY_W - M * 2 && size > 56) {
    size -= 4;
    c.font = `${size}px ${TITLE}`;
  }
  c.fillStyle = INK;
  c.textAlign = "center";
  c.fillText(d.title, CX, y);

  // ── 한 줄 설명(최대 2줄) ──
  y += 72;
  c.font = `500 34px ${BODY}`;
  c.fillStyle = "rgba(29,29,29,0.72)";
  for (const l of wrapText((s) => c.measureText(s).width, d.tagline, 820, 2)) {
    c.fillText(l, CX, y);
    y += 52;
  }

  // ── 성향 3칸 ──
  const top = 1392;
  rule(c, M, STORY_W - M, top, 2);
  const colW = (STORY_W - M * 2) / d.traits.length;
  for (const [i, t] of d.traits.entries()) {
    const cx = M + colW * i + colW / 2;
    if (i > 0) {
      c.fillStyle = "rgba(29,29,29,0.25)";
      c.fillRect(M + colW * i, top + 30, 1.5, 104);
    }
    c.font = `700 22px ${BODY}`;
    c.fillStyle = "rgba(29,29,29,0.55)";
    spaced(c, t.label, cx, top + 62, 4, "center");
    c.font = `800 32px ${BODY}`;
    c.fillStyle = INK;
    c.textAlign = "center";
    if (t.dots) {
      const r = 7;
      const gap = 22;
      const dotsW = gap * 4;
      const hasText = !!t.value;
      const tw = hasText ? c.measureText(t.value).width + 20 : 0;
      let dx = cx - (dotsW + tw) / 2;
      for (let k = 1; k <= 5; k++) {
        c.beginPath();
        c.arc(dx, top + 108, r, 0, Math.PI * 2);
        if (k <= t.dots) {
          c.fillStyle = d.tone;
          c.fill();
        } else {
          c.strokeStyle = "rgba(29,29,29,0.4)";
          c.lineWidth = 1.5;
          c.stroke();
        }
        dx += gap;
      }
      if (hasText) {
        c.fillStyle = INK;
        c.textAlign = "left";
        c.fillText(t.value, dx - gap + r + 20, top + 119);
      }
    } else {
      c.fillText(t.value, cx, top + 119);
    }
  }
  rule(c, M, STORY_W - M, top + 164, 1.5);

  // ── 꼬리말: 사이트 주소(모든 공유가 사이트를 알린다) ──
  y = STORY_H - STORY_SAFE_BOTTOM - 40;
  c.textAlign = "left";
  c.font = `500 28px ${BODY}`;
  const lead = "나와 맞는 방 찾기  ·  ";
  c.font = `800 30px ${BODY}`;
  const domain = "bangtallog.com";
  const dw = c.measureText(domain).width;
  c.font = `500 28px ${BODY}`;
  const lw = c.measureText(lead).width;
  let fx = CX - (lw + dw) / 2;
  c.fillStyle = "rgba(29,29,29,0.6)";
  c.fillText(lead, fx, y);
  fx += lw;
  c.font = `800 30px ${BODY}`;
  c.fillStyle = INK;
  c.fillText(domain, fx, y);
  rule(c, fx, fx + dw, y + 10, 3, ORANGE);
  c.textAlign = "left";
}

export async function makeStoryCard(input: StoryCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await drawStoryCard(canvas, input);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/png")
  );
}
