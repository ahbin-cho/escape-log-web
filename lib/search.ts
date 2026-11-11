import type { ThemeRow } from "./catalog-server";
import { brandOf } from "./cafe";
import { regionFromText } from "./region";

// ─────────────────────────────────────────────────────────────
// 테마 검색. 순수 함수(서버·테스트 공용).
// - 테마명·매장(브랜드·지점)·지역(시도, 매장명의 동네 이름)·장르·태그에서 찾는다
// - 띄어쓰기·대소문자·기호 무시 ("log in" → LOG_IN)
// - 초성 검색 ("ㅎㅈㄷㅇ" → 후즈데어)
// - 여러 단어는 모두 어딘가에 맞아야 함 ("강남 공포" → 강남 매장의 공포 테마)
// ─────────────────────────────────────────────────────────────

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

export function norm(s: string): string {
  return (s || "").toLowerCase().replace(/[\s_\-.·,()[\]'"!?~:/]+/g, "");
}

// 한글 음절 → 초성, 그 외 글자는 그대로
export function toChosung(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0) - 0xac00;
    out += code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : ch;
  }
  return out;
}

const isChosung = (term: string) => /^[ㄱ-ㅎ]+$/.test(term);

export type SearchHit = { theme: ThemeRow; score: number };

function termScore(t: ThemeRow, term: string): number {
  const name = norm(t.name);
  const q = norm(term);
  if (!q) return 0;

  if (isChosung(q)) {
    const cho = norm(toChosung(t.name));
    if (cho.startsWith(q)) return 55;
    if (cho.includes(q)) return 45;
    const cafeCho = norm(toChosung(t.cafe));
    return cafeCho.includes(q) ? 30 : 0;
  }

  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;

  const cafe = norm(t.cafe);
  if (norm(brandOf(t.cafe)) === q) return 45;
  if (cafe.includes(q)) return 40;

  const region = regionFromText(t.cafe);
  if (region && norm(region) === q) return 30;
  if (norm(t.genre) === q || norm(`${t.genre}방탈출`) === q) return 30;

  if ((t.tags ?? []).some((tag) => norm(tag).includes(q))) return 20;
  return 0;
}

export function searchThemes(themes: ThemeRow[], query: string, limit = 30): SearchHit[] {
  const terms = query.trim().split(/\s+/).filter((x) => norm(x));
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  for (const t of themes) {
    let score = 0;
    let all = true;
    for (const term of terms) {
      const s = termScore(t, term);
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    // 띄어 쓴 테마명("어느 폐가의 기록")을 통째로 친 경우도 이름 일치로 본다
    if (!all && terms.length > 1) {
      const whole = termScore(t, terms.join(""));
      if (whole >= 60) {
        all = true;
        score = whole;
      }
    }
    if (all) hits.push({ theme: t, score });
  }
  return hits
    .sort((a, b) => b.score - a.score || a.theme.name.localeCompare(b.theme.name, "ko"))
    .slice(0, limit);
}
