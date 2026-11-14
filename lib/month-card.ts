import type { EscapeRecord } from "./store";
import { monthCells, recordsByDay } from "./calendar";
import { wrapText } from "./review-image";
import { TONE } from "../components/PosterTile";

// ─────────────────────────────────────────────────────────────
// 이번 달 달력 이미지(1080×1920, 9:16). 기록 달력에서 보던 그 달을 한 장으로 그려
// 인스타 스토리에 올리거나 사진첩에 저장한다. 브라우저 캔버스로 그리므로 서버 비용이 없다.
// 위 220px·아래 250px 은 인스타 화면(프로필·답장 칸)이 덮으므로 중요한 내용은 그 사이에만.
// 무엇을 그릴지(monthCardLayout·monthStats)는 순수 함수, 어떻게 그릴지는 drawMonthCard.
// ─────────────────────────────────────────────────────────────

export const CARD_W = 1080;
export const CARD_H = 1920;
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 250;

export interface MonthCell {
  day: string; // "2026-11-07"
  dayNum: number; // 7
  weekday: number; // 0=일 … 6=토
  records: EscapeRecord[]; // 그날 기록(먼저 쓴 기록이 앞)
}

export interface MonthStats {
  total: number;
  escaped: number;
  lifeThemes: number; // 별점 5 = 인생테마
}

export interface MonthCardLayout {
  year: number;
  month: number;
  title: string; // "2026년 11월의 방탈출"
  weeks: (MonthCell | null)[][]; // 주마다 7칸, 그 달이 아닌 칸은 null
  stats: MonthStats;
  statChips: string[]; // ["이번 달 12방", "탈출 9", "인생테마 2"]
}

export function monthStats(records: EscapeRecord[]): MonthStats {
  return {
    total: records.length,
    escaped: records.filter((r) => r.success).length,
    lifeThemes: records.filter((r) => Math.round(r.rating) >= 5).length,
  };
}

export function statChips(s: MonthStats): string[] {
  if (!s.total) return ["이번 달 기록 없음"];
  return [`이번 달 ${s.total}방`, `탈출 ${s.escaped}`, s.lifeThemes ? `인생테마 ${s.lifeThemes}` : ""].filter(Boolean);
}

// month: "2026-11". records 는 화면에 보이는 기록 전체(다른 달 기록이 섞여 있어도 된다).
export function monthCardLayout(month: string, records: EscapeRecord[]): MonthCardLayout {
  const [year, m] = month.split("-").map(Number);
  const byDay = recordsByDay(records);
  const cells = monthCells(month).map((day, i): MonthCell | null =>
    day ? { day, dayNum: Number(day.slice(8)), weekday: i % 7, records: byDay.get(day) ?? [] } : null
  );
  const weeks: (MonthCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const stats = monthStats(cells.flatMap((c) => c?.records ?? []));
  return { year, month: m, title: `${year}년 ${m}월의 방탈출`, weeks, stats, statChips: statChips(stats) };
}

// 테마 이름 줄바꿈: 띄어쓰기 단위로 끊고(한 단어를 둘로 쪼개지 않게), 한 단어가 칸보다 길 때만 글자 단위로.
// 줄이 모자라면 마지막 줄 끝을 '…' 로.
export function wrapWords(measure: (s: string) => number, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.replace(/\s+/g, " ").trim().split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    if (measure(word) <= maxWidth) {
      line = word;
    } else {
      const parts = wrapText(measure, word, maxWidth, 99);
      lines.push(...parts.slice(0, -1));
      line = parts.at(-1) ?? "";
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const out = lines.slice(0, maxLines);
  let last = out[maxLines - 1];
  while (last.length > 1 && measure(`${last}…`) > maxWidth) last = last.slice(0, -1);
  out[maxLines - 1] = `${last.trimEnd()}…`;
  return out;
}

// ── 그리기(브라우저 전용) ──
// 사이트 카드와 같은 말투: 크림 종이, 먹색 굵은 테두리, 오른쪽 아래로 밀린 먹색 그림자, 주황 포인트.

const PAPER = "#F5F0E6";
const PANEL = "#FFFCF6";
const INK = "#1D1D1D";
const ORANGE = "#E49A4A";
const SUN = "rgba(200,60,50,0.75)"; // 일요일 숫자
const SAT = "rgba(40,110,170,0.75)"; // 토요일 숫자
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

const TITLE = '"SBAggroB", "Pretendard", sans-serif';
const BODY = '"Pretendard", system-ui, sans-serif';

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load('700 80px "SBAggroB"', "2026년 11월의 방탈출"),
      document.fonts.load('800 30px "Pretendard"', "방탈출 이번 달"),
      document.fonts.load('700 24px "Pretendard"', "방탈출"),
    ]);
    await document.fonts.ready;
  } catch {
    // 글꼴을 못 불러와도 기본 글꼴로 그린다
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// 사이트 카드 모양: 먹색 그림자 → 채움 → 먹색 테두리
function card(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  opt: { line?: number; shadow?: number } = {}
) {
  const line = opt.line ?? 4;
  const shadow = opt.shadow ?? 0;
  if (shadow) {
    c.fillStyle = INK;
    c.beginPath();
    c.roundRect(x + shadow, y + shadow, w, h, r);
    c.fill();
  }
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
  c.lineWidth = line;
  c.strokeStyle = INK;
  c.stroke();
}

// 나뉜 칸용 작은 표지: 장르 색 바탕에 테마 이름만(자리가 좁다)
function miniTile(c: CanvasRenderingContext2D, r: EscapeRecord, x: number, y: number, w: number, h: number) {
  const t = TONE[r.genre] ?? TONE["기타"];
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.fillStyle = t.bg;
  c.fillRect(x, y, w, h);
  const g = c.createLinearGradient(x, y, x + w * 0.6, y + h);
  g.addColorStop(0, `${t.accent}33`);
  g.addColorStop(1, `${t.accent}00`);
  c.fillStyle = g;
  c.fillRect(x, y, w, h);
  const p = 7;
  const size = Math.max(13, Math.min(19, Math.round(w * 0.17)));
  const lh = Math.round(size * 1.18);
  c.font = `800 ${size}px ${BODY}`;
  c.fillStyle = PAPER;
  c.textAlign = "left";
  c.textBaseline = "top";
  const maxLines = Math.max(1, Math.min(2, Math.floor((h - p * 2) / lh)));
  const lines = wrapWords((s) => c.measureText(s).width, r.themeName || "제목 없음", w - p * 2, maxLines);
  lines.forEach((l, i) => c.fillText(l, x + p, y + h - p - (lines.length - i) * lh));
  c.textBaseline = "alphabetic";
  c.restore();
}

// 미니 포스터(PosterTile 과 같은 모양): 장르 색 바탕, 위에 장르, 가운데 테마 이름, 아래 주황 줄 + 탈출 점
function posterTile(c: CanvasRenderingContext2D, r: EscapeRecord, x: number, y: number, w: number, h: number) {
  const t = TONE[r.genre] ?? TONE["기타"];
  const rad = Math.round(w * 0.1);
  c.save();
  c.beginPath();
  c.roundRect(x, y, w, h, rad);
  c.clip();
  c.fillStyle = t.bg;
  c.fillRect(x, y, w, h);
  // 사이트 타일과 같은 은은한 장르 빛(왼쪽 위)
  const g = c.createLinearGradient(x, y, x + w * 0.55, y + h * 0.75);
  g.addColorStop(0, `${t.accent}22`);
  g.addColorStop(1, `${t.accent}00`);
  c.fillStyle = g;
  c.fillRect(x, y, w, h);

  const p = Math.max(8, Math.round(w * 0.09));
  c.textAlign = "left";
  c.textBaseline = "top";
  c.fillStyle = t.accent;
  c.font = `800 ${Math.round(w * 0.14)}px ${BODY}`;
  c.fillText(r.genre, x + p, y + p);

  // 테마 이름: 칸 높이에 맞춰 2~3줄
  const size = Math.round(w * 0.165);
  const lh = Math.round(size * 1.22);
  const room = h - p * 2 - Math.round(w * 0.14) - 22; // 장르 줄·아래 줄을 뺀 자리
  const maxLines = Math.max(1, Math.min(3, Math.floor(room / lh)));
  c.font = `800 ${size}px ${BODY}`;
  c.fillStyle = PAPER;
  const lines = wrapWords((s) => c.measureText(s).width, r.themeName || "제목 없음", w - p * 2, maxLines);
  const top = y + p + Math.round(w * 0.14) + 8;
  const mid = top + (y + h - p - 14 - top - lines.length * lh) / 2; // 장르와 아래 줄 사이 가운데
  lines.forEach((l, i) => c.fillText(l, x + p, Math.max(top, mid) + i * lh));

  // 아래 줄 + 탈출 점(채움=탈출, 빈 동그라미=실패)
  const by = y + h - p - 4;
  const dot = Math.max(5, Math.round(w * 0.05));
  c.fillStyle = `${t.accent}66`;
  c.beginPath();
  c.roundRect(x + p, by - 2, w - p * 2 - dot * 2 - 8, 4, 2);
  c.fill();
  c.beginPath();
  c.arc(x + w - p - dot, by, dot, 0, Math.PI * 2);
  if (r.success) {
    c.fillStyle = t.accent;
    c.fill();
  } else {
    c.lineWidth = 2;
    c.strokeStyle = t.accent;
    c.stroke();
  }
  c.restore();

  c.lineWidth = 3;
  c.strokeStyle = INK;
  c.beginPath();
  c.roundRect(x, y, w, h, rad);
  c.stroke();
}

function fitFont(c: CanvasRenderingContext2D, text: string, family: string, weight: string, start: number, min: number, maxW: number) {
  let size = start;
  c.font = `${weight} ${size}px ${family}`.trim();
  while (c.measureText(text).width > maxW && size > min) {
    size -= 2;
    c.font = `${weight} ${size}px ${family}`.trim();
  }
  return size;
}

export async function drawMonthCard(canvas: HTMLCanvasElement, month: string, records: EscapeRecord[]): Promise<void> {
  const L = monthCardLayout(month, records);
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const c = canvas.getContext("2d")!;
  await loadFonts();
  const mascot = await loadImage("/mascot.png");

  const X = 64; // 좌우 여백
  const PW = CARD_W - X * 2;

  c.fillStyle = PAPER;
  c.fillRect(0, 0, CARD_W, CARD_H);

  // ── 제목 ──
  c.textBaseline = "alphabetic";
  c.textAlign = "left";
  c.fillStyle = INK;
  fitFont(c, `${L.year}년`, BODY, "800", 36, 36, PW);
  c.fillStyle = "rgba(29,29,29,0.6)";
  c.fillText(`${L.year}년`, X + 4, SAFE_TOP + 60);
  const titleText = `${L.month}월의 방탈출`;
  fitFont(c, titleText, TITLE, "700", 104, 64, PW - 200);
  c.fillStyle = INK;
  c.fillText(titleText, X, SAFE_TOP + 168);
  // 제목 밑 주황 붓줄
  const tw = c.measureText(`${L.month}월`).width; // 'N월' 밑에만
  c.fillStyle = ORANGE;
  c.beginPath();
  c.roundRect(X + 2, SAFE_TOP + 186, tw, 12, 6);
  c.fill();

  // ── 이번 달 숫자: 도장처럼 붙인 칩 ──
  let cx = X;
  const chipY = SAFE_TOP + 228;
  const chipH = 62;
  c.font = `800 30px ${BODY}`;
  for (const [i, chip] of L.statChips.entries()) {
    const w = c.measureText(chip).width + 44;
    card(c, cx, chipY, w, chipH, 31, i === 0 && L.stats.total ? ORANGE : PANEL, { line: 3, shadow: 4 });
    c.fillStyle = INK;
    c.textBaseline = "middle";
    c.fillText(chip, cx + 22, chipY + chipH / 2 + 1);
    cx += w + 16;
  }
  c.textBaseline = "alphabetic";

  // ── 달력 판 ──
  const rows = L.weeks.length;
  const panelTop = SAFE_TOP + (rows > 5 ? 316 : 340);
  const pad = 26;
  const gapX = 12;
  const gapY = rows > 5 ? 8 : 14;
  const headH = 46;
  const dateH = rows > 5 ? 32 : 36;
  const colW = (PW - pad * 2 - gapX * 6) / 7;
  const maxBottom = CARD_H - SAFE_BOTTOM - 84; // 아래 주소 자리
  const room = maxBottom - panelTop - pad * 2 - headH;
  const rowH = Math.min(dateH + (colW * 4) / 3 + gapY, room / rows);
  const posterH = rowH - dateH - gapY;
  const panelH = pad * 2 + headH + rowH * rows - gapY;
  card(c, X, panelTop, PW, panelH, 28, PANEL, { line: 5, shadow: 10 });

  // 마스코트: 판 오른쪽 위에 걸터앉기
  if (mascot) {
    const s = 190;
    c.drawImage(mascot, X + PW - s - 10, panelTop - s + 44, s, s);
  }

  // 요일
  c.textAlign = "center";
  c.font = `800 26px ${BODY}`;
  WEEK.forEach((w, i) => {
    c.fillStyle = i === 0 ? SUN : i === 6 ? SAT : "rgba(29,29,29,0.5)";
    c.fillText(w, X + pad + i * (colW + gapX) + colW / 2, panelTop + pad + 30);
  });

  // 날짜 칸
  L.weeks.forEach((week, wi) => {
    const ry = panelTop + pad + headH + wi * rowH;
    week.forEach((cell, di) => {
      if (!cell) return;
      const x = X + pad + di * (colW + gapX);
      const played = cell.records.length > 0;
      c.textAlign = "center";
      c.font = `800 ${played ? 27 : 25}px ${BODY}`;
      c.fillStyle = played ? INK : di === 0 ? SUN : di === 6 ? SAT : "rgba(29,29,29,0.42)";
      if (!played && (di === 0 || di === 6)) c.globalAlpha = 0.7;
      c.fillText(String(cell.dayNum), x + colW / 2, ry + 26);
      c.globalAlpha = 1;
      const py = ry + dateH;
      if (!played) {
        // 빈 날은 조용히: 옅은 칸만
        c.fillStyle = "rgba(29,29,29,0.04)";
        c.beginPath();
        c.roundRect(x, py, colW, posterH, Math.round(colW * 0.1));
        c.fill();
        return;
      }
      // 하루 여러 방이면 달력 화면처럼 칸을 나눈다: 2=위아래, 3=위 1+아래 2, 4방부터는 3장 + "+N"
      const list = cell.records;
      if (list.length === 1) {
        posterTile(c, list[0], x, py, colW, posterH);
        return;
      }
      const g = 4;
      const hh = (posterH - g) / 2;
      const hw = (colW - g) / 2;
      c.save();
      c.beginPath();
      c.roundRect(x, py, colW, posterH, Math.round(colW * 0.1));
      c.clip();
      if (list.length === 2) {
        miniTile(c, list[0], x, py, colW, hh);
        miniTile(c, list[1], x, py + hh + g, colW, hh);
      } else if (list.length === 3) {
        miniTile(c, list[0], x, py, colW, hh);
        miniTile(c, list[1], x, py + hh + g, hw, hh);
        miniTile(c, list[2], x + hw + g, py + hh + g, hw, hh);
      } else {
        miniTile(c, list[0], x, py, hw, hh);
        miniTile(c, list[1], x + hw + g, py, hw, hh);
        miniTile(c, list[2], x, py + hh + g, hw, hh);
        c.fillStyle = ORANGE;
        c.fillRect(x + hw + g, py + hh + g, hw, hh);
        c.fillStyle = INK;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `800 ${Math.round(hw * 0.42)}px ${BODY}`;
        c.fillText(`+${list.length - 3}`, x + hw + g + hw / 2, py + hh + g + hh / 2 + 1);
        c.textBaseline = "alphabetic";
      }
      c.restore();
    });
  });

  // ── 아래: 주소 ──
  const fy = Math.min(panelTop + panelH + 10 + 70, CARD_H - SAFE_BOTTOM - 20);
  c.textAlign = "center";
  c.fillStyle = INK;
  c.font = `700 36px ${TITLE}`;
  c.fillText("bangtallog.com", CARD_W / 2, fy);
  c.textAlign = "left";
}

export async function makeMonthCard(month: string, records: EscapeRecord[]): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await drawMonthCard(canvas, month, records);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/png")
  );
}
