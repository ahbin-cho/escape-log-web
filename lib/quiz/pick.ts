import { SLOT_IDS } from "./slots";
import { QUESTIONS, type QuizQuestion } from "./questions";

// ─────────────────────────────────────────────────────────────
// 한 회차의 질문 뽑기. 슬롯마다 변형 하나, 직전 회차에 나온 변형은 제외.
// 첫 문항은 draw1 로 고정하고 나머지 순서는 섞는다.
// ─────────────────────────────────────────────────────────────

export function pickQuestions(
  lastVariantIds: readonly string[] = [],
  random: () => number = Math.random
): QuizQuestion[] {
  const last = new Set(lastVariantIds);
  const at = (n: number) => Math.min(n - 1, Math.floor(random() * n));

  const picked = SLOT_IDS.map((slot) => {
    const all = QUESTIONS.filter((q) => q.slot === slot);
    const fresh = all.filter((q) => !last.has(q.id));
    const pool = fresh.length ? fresh : all;
    return pool[at(pool.length)];
  });

  const [first, ...rest] = picked; // SLOT_IDS[0] === "draw1"
  for (let i = rest.length - 1; i > 0; i--) {
    const j = at(i + 1);
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

export const LAST_VARIANTS_KEY = "escapelog:quiz:last-variants";

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

// 직전 회차에 나온 변형 ID들. 읽을 수 없으면 빈 배열(제외 없이 뽑게 됨).
export function loadLastVariants(
  storage: Pick<Storage, "getItem"> | null = browserStorage()
): string[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(LAST_VARIANTS_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveLastVariants(
  ids: readonly string[],
  storage: Pick<Storage, "setItem"> | null = browserStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(LAST_VARIANTS_KEY, JSON.stringify(ids));
  } catch {
    // 저장 실패는 무시: 다음 회차에 같은 질문이 나올 수 있을 뿐이다.
  }
}
