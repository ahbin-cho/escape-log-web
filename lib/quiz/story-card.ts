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
// 유형 그림(따뜻한 수채화·램프 불빛의 서재)과 한 세계로 보이게: 낡은 동화책 한 페이지.
// 양피지 바탕, 그림은 가장자리가 종이로 번지게, 제목은 명조.

const PAPER_TOP = "#F6ECD6";
const PAPER_BOTTOM = "#ECDDBE";
const BROWN = "#3B2A1A";
const SEPIA = "#8A6A45";
const GOLD = "#B88A3E";

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
      document.fonts.load('800 96px "Nanum Myeongjo"', "방탈출유형"),
      document.fonts.load('500 34px "Pretendard"', "방탈"),
      document.fonts.load('700 24px "Pretendard"', "방탈"),
    ]);
    await document.fonts.ready;
  } catch {
    // 글꼴을 못 불러와도 기본 글꼴로 그린다
  }
}

function spaced(c: CanvasRenderingContext2D, text: string, x: number, y: number, gap: number) {
  const chars = Array.from(text);
  const width = chars.reduce((w, ch) => w + c.measureText(ch).width, 0) + gap * (chars.length - 1);
  let cx = x - width / 2;
  c.textAlign = "left";
  for (const ch of chars) {
    c.fillText(ch, cx, y);
    cx += c.measureText(ch).width + gap;
  }
  return width;
}

// 가운데 장식 줄: ── ✦ ──
function ornament(c: CanvasRenderingContext2D, cx: number, y: number, half: number) {
  c.strokeStyle = GOLD;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - half, y);
  c.lineTo(cx - 22, y);
  c.moveTo(cx + 22, y);
  c.lineTo(cx + half, y);
  c.stroke();
  c.fillStyle = GOLD;
  c.save();
  c.translate(cx, y);
  c.rotate(Math.PI / 4);
  c.fillRect(-6, -6, 12, 12);
  c.restore();
}

export async function drawStoryCard(canvas: HTMLCanvasElement, input: StoryCardInput): Promise<void> {
  const d = storyCardContent(input);
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const c = canvas.getContext("2d")!;
  await loadFonts();
  const SERIF = '"Nanum Myeongjo", "AppleMyungjo", serif';
  const BODY = '"Pretendard", system-ui, sans-serif';
  const CX = STORY_W / 2;

  // 양피지
  const bg = c.createLinearGradient(0, 0, 0, STORY_H);
  bg.addColorStop(0, PAPER_TOP);
  bg.addColorStop(1, PAPER_BOTTOM);
  c.fillStyle = bg;
  c.fillRect(0, 0, STORY_W, STORY_H);

  // 그림: 위쪽을 넓게, 아래 가장자리는 종이로 번지게
  const img = (await loadImage(d.image)) ?? (await loadImage(MASCOT.image));
  const IY = 96;
  const IS = 1080;
  if (img) {
    const s = Math.max(IS / img.width, IS / img.height);
    c.drawImage(img, CX - (img.width * s) / 2, IY, img.width * s, img.height * s);
  }
  const fadeTop = c.createLinearGradient(0, IY, 0, IY + 160);
  fadeTop.addColorStop(0, PAPER_TOP);
  fadeTop.addColorStop(1, "rgba(246,236,214,0)");
  c.fillStyle = fadeTop;
  c.fillRect(0, IY - 2, STORY_W, 162);
  const fadeBottom = c.createLinearGradient(0, IY + IS - 360, 0, IY + IS);
  fadeBottom.addColorStop(0, "rgba(240,227,201,0)");
  fadeBottom.addColorStop(1, "#F0E3C9");
  c.fillStyle = fadeBottom;
  c.fillRect(0, IY + IS - 360, STORY_W, 362);
  c.fillStyle = "#F0E3C9";
  c.fillRect(0, IY + IS - 1, STORY_W, 6);

  // 종이 가장자리 그늘(오래된 책장)
  const vg = c.createRadialGradient(CX, STORY_H * 0.5, STORY_H * 0.32, CX, STORY_H * 0.5, STORY_H * 0.78);
  vg.addColorStop(0, "rgba(90,60,30,0)");
  vg.addColorStop(1, "rgba(90,60,30,0.22)");
  c.fillStyle = vg;
  c.fillRect(0, 0, STORY_W, STORY_H);

  c.textBaseline = "alphabetic";
  c.textAlign = "center";

  // 장 번호
  let y = 1112;
  c.font = `700 24px ${BODY}`;
  c.fillStyle = SEPIA;
  spaced(c, `No.${d.no.split(" ")[0]}  ·  ${d.eyebrow}`, CX, y, 5);

  // 유형 이름(명조, 한 줄)
  y += 112;
  let size = 104;
  c.font = `800 ${size}px ${SERIF}`;
  while (c.measureText(d.title).width > STORY_W - 160 && size > 56) {
    size -= 4;
    c.font = `800 ${size}px ${SERIF}`;
  }
  c.fillStyle = BROWN;
  c.textAlign = "center";
  c.fillText(d.title, CX, y);

  // 한 줄 설명
  y += 70;
  c.font = `500 34px ${BODY}`;
  c.fillStyle = "rgba(59,42,26,0.78)";
  for (const l of wrapText((s) => c.measureText(s).width, d.tagline, 840, 2)) {
    c.fillText(l, CX, y);
    y += 50;
  }

  // 장식 줄
  y += 22;
  ornament(c, CX, y, 300);

  // 성향: 세 줄짜리 열람 카드처럼
  y += 70;
  const colW = 280;
  for (const [i, t] of d.traits.entries()) {
    const cx = CX + (i - 1) * colW;
    c.font = `700 22px ${BODY}`;
    c.fillStyle = SEPIA;
    spaced(c, t.label, cx, y, 4);
    c.font = `800 32px ${SERIF}`;
    c.fillStyle = BROWN;
    c.textAlign = "center";
    c.fillText(t.dots ? `${"●".repeat(t.dots)}${"○".repeat(5 - t.dots)}` : t.value, cx, y + 50);
    if (t.dots && t.value) {
      c.font = `500 24px ${BODY}`;
      c.fillStyle = "rgba(59,42,26,0.7)";
      c.fillText(t.value, cx, y + 88);
    }
    if (i > 0) {
      c.fillStyle = "rgba(138,106,69,0.35)";
      c.fillRect(cx - colW / 2, y - 26, 1.5, 116);
    }
  }

  // 꼬리말
  y = STORY_H - STORY_SAFE_BOTTOM - 36;
  c.textAlign = "center";
  c.font = `500 28px ${BODY}`;
  c.fillStyle = SEPIA;
  c.fillText("나와 맞는 방 찾기", CX, y - 44);
  c.font = `800 34px ${SERIF}`;
  c.fillStyle = BROWN;
  c.fillText("bangtallog.com", CX, y);
  c.textAlign = "left";
}

export async function makeStoryCard(input: StoryCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await drawStoryCard(canvas, input);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/png")
  );
}
