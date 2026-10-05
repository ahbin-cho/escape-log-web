import type { MateTaste } from "../match";
import {
  DRAWS,
  PLAYER_PREFS,
  PLAYS,
  QUIZ_GENRES,
  TIME_PREFS,
  type QuizGenre,
  type QuizValues,
  type TimePref,
  type TypeId,
} from "./slots";
import { determineType } from "./score";

// ─────────────────────────────────────────────────────────────
// 결과 공유 코드. 서버에 저장하지 않고 주소(/quiz/r/<코드>)에 담는다.
// 앞 7글자 = 유형·장르·공포·난이도·힌트·인원·시간, 나머지 = 별명(base64url).
// 누구나 주소를 고쳐 쓸 수 있으므로 읽을 때 전부 다시 검증한다.
// ─────────────────────────────────────────────────────────────

export interface SharedResult {
  name: string;
  typeId: TypeId;
  genre: QuizGenre;
  fear: number;
  difficulty: number;
  hint: number;
  players: number;
  time: TimePref;
}

const TYPE_IDS: TypeId[] = DRAWS.flatMap((d) => PLAYS.map((p) => `${d}-${p}` as TypeId));
const NAME_MAX = 12;
const DEFAULT_NAME = "친구";

// 제어문자를 지우고 앞뒤 공백을 뗀 뒤 12자(이모지도 1자)로 자른다.
export function cleanName(raw: string): string {
  const name = Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, "").trim())
    .slice(0, NAME_MAX)
    .join("");
  return name || DEFAULT_NAME;
}

function toBase64Url(text: string): string {
  let bin = "";
  for (const b of new TextEncoder().encode(text)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function encodeShare(r: SharedResult): string {
  const head = [
    TYPE_IDS.indexOf(r.typeId).toString(16),
    QUIZ_GENRES.indexOf(r.genre),
    r.fear,
    r.difficulty,
    r.hint,
    (PLAYER_PREFS as readonly number[]).indexOf(r.players),
    TIME_PREFS.indexOf(r.time),
  ].join("");
  const name = cleanName(r.name);
  return head + (name === DEFAULT_NAME ? "" : toBase64Url(name));
}

const scale = (ch: string) => (/^[1-5]$/.test(ch) ? Number(ch) : null);

export function decodeShare(raw: string): SharedResult | null {
  try {
    const code = decodeURIComponent(raw);
    if (!/^[0-9a-f][0-5][1-5]{3}[0-4]{2}[A-Za-z0-9_-]*$/.test(code)) return null;
    const fear = scale(code[2]);
    const difficulty = scale(code[3]);
    const hint = scale(code[4]);
    if (fear === null || difficulty === null || hint === null) return null;
    const rest = code.slice(7);
    return {
      name: rest ? cleanName(fromBase64Url(rest)) : DEFAULT_NAME,
      typeId: TYPE_IDS[parseInt(code[0], 16)],
      genre: QUIZ_GENRES[Number(code[1])],
      fear,
      difficulty,
      hint,
      players: PLAYER_PREFS[Number(code[5])],
      time: TIME_PREFS[Number(code[6])],
    };
  } catch {
    return null; // 깨진 퍼센트 인코딩·base64·UTF-8
  }
}

export function shareFromValues(values: QuizValues, name: string): SharedResult {
  return {
    name: cleanName(name),
    typeId: determineType(values),
    genre: values.genre,
    fear: values.fear,
    difficulty: values.difficulty,
    hint: values.hint,
    players: values.players,
    time: values.time,
  };
}

// 친구 궁합(lib/match)이 쓰는 형태
export function shareToMate(r: SharedResult): MateTaste {
  return { name: r.name, genre: r.genre, fear: r.fear, diff: r.difficulty };
}

export function sharePath(code: string): string {
  return `/quiz/r/${code}`;
}
