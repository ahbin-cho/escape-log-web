// 기록 종류: 방탈출(기본) / 머더미스터리·크라임씬(2026-11-19 확장, 운영자 결정).
// 머더미스터리는 남은 시간·힌트·공포도·테마 유형이 없고, 대신 맡은 역할(나만 보기)이 있다.
// 탈출 성공률·힌트·유형 진단 같은 방탈출 통계에는 넣지 않는다(escapeOnly 로 걸러서 계산).
export type RecordKind = "escape" | "murder";

export const KIND_LABEL: Record<RecordKind, string> = { escape: "방탈출", murder: "머더미스터리" };
export const KIND_EMOJI: Record<RecordKind, string> = { escape: "🔑", murder: "🔪" };

type HasKind = { kind?: RecordKind | string | null };

export function kindOf(r: HasKind): RecordKind {
  return r.kind === "murder" ? "murder" : "escape";
}
export const isMurder = (r: HasKind) => kindOf(r) === "murder";

/** 방탈출 통계용: 머더미스터리 기록을 뺀다 */
export function escapeOnly<T extends HasKind>(list: T[]): T[] {
  return list.filter((r) => !isMurder(r));
}

/** 결과 한마디. 머더미스터리는 역할마다 목표가 달라 '탈출' 대신 '목표 달성'으로 적는다 */
export function resultWord(r: HasKind & { success: boolean }, long = false): string {
  if (isMurder(r)) return r.success ? "목표 달성" : long ? "목표 실패" : "실패";
  return r.success ? (long ? "탈출 성공" : "탈출") : long ? "탈출 실패" : "실패";
}
