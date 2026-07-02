// ─────────────────────────────────────────────────────────────
// 서버 전용 LLM 헬퍼 (선택적). 키가 있으면 진짜 GPT/Claude로 페르소나 생성,
// 없으면 null 반환 → 화면은 규칙 기반 페르소나로 폴백.
// 키는 절대 클라이언트로 나가지 않음 (이 파일은 API 라우트에서만 import).
//
// 사용법: 프로젝트 루트에 .env.local 파일을 만들고 아래 중 하나만 넣으세요.
//   OPENAI_API_KEY=sk-...        (GPT 사용)
//   ANTHROPIC_API_KEY=sk-ant-... (Claude 사용)
// 선택: AI_MODEL=원하는-모델명  (기본값은 각 제공사 저비용 모델)
// ─────────────────────────────────────────────────────────────

export interface PersonaResult {
  title: string;
  emoji: string;
  blurb: string;
}

export interface PersonaPayload {
  profile: Record<string, string>;
  recs: { name: string; genre: string; difficulty: number; fearLevel: number }[];
}

const SYSTEM_PROMPT =
  "너는 방탈출 마스코트 '탈출귀'야. 방을 많이 깨본 장난기 있는 유령 가이드지. " +
  "사용자의 오지선다 답변(장르, 공포도, 난이도, 중요요소, 동행스타일, 힌트성향, 플레이스타일, 분위기, 시간선호)과 추천된 방 목록을 보고, 반말로 살짝 능글맞게 취향 페르소나를 진단해. " +
  "답변 항목들을 종합해서 그 사람만의 독특한 취향 조합을 콕 짚어줘. 두루뭉술 말고, 구체적으로 재밌게. 추천된 방 이름을 1개 정도 자연스럽게 언급해도 좋아. " +
  '반드시 JSON 하나만 출력해: {"title": "짧은 아키타입 이름(15자 이내)", "emoji": "이모지 1개", "blurb": "2~3문장 진단(탈출귀 말투)"}. ' +
  "JSON 외 다른 말은 절대 쓰지 마.";

function safeParse(text: string): PersonaResult | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]);
    if (obj && obj.title && obj.blurb) {
      return {
        title: String(obj.title),
        emoji: String(obj.emoji || "✨"),
        blurb: String(obj.blurb),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

export async function generatePersona(
  payload: PersonaPayload
): Promise<PersonaResult | null> {
  const userMsg = JSON.stringify(payload);

  try {
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          max_tokens: 300,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg },
          ],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return safeParse(data?.choices?.[0]?.message?.content ?? "");
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "claude-3-5-haiku-latest",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return safeParse(data?.content?.[0]?.text ?? "");
    }
  } catch {
    return null;
  }

  return null; // 키 없음
}
