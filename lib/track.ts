import { createClient, isSupabaseConfigured } from "./supabase/client";
import { getSavedQuiz } from "./store";

// 예약 버튼 클릭 집계. 제휴 제안 때 "예약 페이지로 N명 보냄" 근거로 쓴다.
// 실패해도 사용자 동작(예약 페이지 이동)을 막지 않도록 조용히 무시.
// 취향 찾기를 한 사람이면 유형 ID도 함께 남긴다(매장 리포트의 손님 유형 분포).
export type ReserveSource = "theme" | "card" | "recommend" | "home";

export function trackReserveClick(click: {
  themeId?: string;
  themeName: string;
  cafe: string;
  source: ReserveSource;
}): void {
  if (!isSupabaseConfigured()) return;
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        click.themeId ?? ""
      );
    const row: Record<string, string | null | undefined> = {
      theme_id: isUuid ? click.themeId : null,
      theme_name: click.themeName.slice(0, 200),
      cafe: click.cafe.slice(0, 200),
      source: click.source,
    };
    const typeId = savedTypeId();
    const table = () => createClient().from("reservation_clicks");
    void table()
      .insert({ ...row, ...(typeId ? { type_id: typeId } : {}) })
      .then(
        ({ error }) => {
          // DB 에 type_id 열을 아직 안 만들었으면 실패한다 → 유형 없이 다시 기록(클릭은 잃지 않게)
          if (error && typeId) void table().insert(row).then(() => {}, () => {});
        },
        () => {}
      );
  } catch {
    // 집계 실패는 무시
  }
}

const TYPE_ID_RE = /^(thrill|brain|story|explore)-(rush|analyze|savor|team)$/;

// 저장된 퀴즈 결과의 유형 ID. 없거나 형식이 다르면 null(DB 제약에 걸리지 않게).
function savedTypeId(): string | null {
  const id = getSavedQuiz()?.typeId;
  return id && TYPE_ID_RE.test(id) ? id : null;
}

// 유형별 비율 집계용: 퀴즈를 끝낼 때 유형 ID만 기록한다(별명·답은 저장하지 않음).
// 같은 브라우저에서 같은 유형이 연달아 나오면 다시 세지 않는다(다시 하기로 부풀지 않게).
const COUNTED_KEY = "escapelog:quiz:counted";

export function trackQuizCompletion(typeId: string): void {
  if (!isSupabaseConfigured()) return;
  try {
    if (window.localStorage.getItem(COUNTED_KEY) === typeId) return;
    window.localStorage.setItem(COUNTED_KEY, typeId);
  } catch {
    // 저장소를 못 쓰면 중복 방지 없이 기록한다
  }
  try {
    void createClient()
      .from("quiz_completions")
      .insert({ type_id: typeId })
      .then(
        () => {},
        () => {}
      );
  } catch {
    // 집계 실패는 무시
  }
}
