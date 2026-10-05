import type { Play, SlotId } from "./slots";

// ─────────────────────────────────────────────────────────────
// 질문 33개 = 슬롯 11개 × 변형 3개. 문장의 원본은
// docs/superpowers/specs/2026-10-06-quiz-variety-design.md 6장.
// 변형이 달라도 선택지는 같은 슬롯 값으로 환산된다.
// ─────────────────────────────────────────────────────────────

export type QuizFormat = "choice" | "binary" | "slider";

export interface QuizOption {
  label: string;
  value: string | number;
  bonus?: Play; // 플레이 방식 보조 1점
}

export interface QuizQuestion {
  id: string; // "<slot>-<a|b|c>"
  slot: SlotId;
  format: QuizFormat;
  prompt: string;
  options: QuizOption[]; // slider 는 빈 배열
  minLabel?: string; // slider 왼쪽 끝(1)
  maxLabel?: string; // slider 오른쪽 끝(5)
  reverse?: boolean; // slider 값을 뒤집어 저장(1↔5)
}

// 화면이 들고 있는 답: 질문 ID → 선택 번호(choice·binary) 또는 슬라이더 값(1~5)
export type QuizAnswers = Record<string, number>;

const c = (
  id: string,
  slot: SlotId,
  prompt: string,
  options: QuizOption[]
): QuizQuestion => ({ id, slot, format: "choice", prompt, options });

const b = (
  id: string,
  slot: SlotId,
  prompt: string,
  options: [QuizOption, QuizOption]
): QuizQuestion => ({ id, slot, format: "binary", prompt, options });

const s = (
  id: string,
  slot: SlotId,
  prompt: string,
  minLabel: string,
  maxLabel: string,
  reverse = false
): QuizQuestion => ({
  id,
  slot,
  format: "slider",
  prompt,
  options: [],
  minLabel,
  maxLabel,
  reverse,
});

const o = (label: string, value: string | number, bonus?: Play): QuizOption =>
  bonus ? { label, value, bonus } : { label, value };

export const QUESTIONS: QuizQuestion[] = [
  // ── draw1: 끌리는 것 A ──
  c("draw1-a", "draw1", "방 문이 열렸다. 제일 먼저 눈이 가는 건?", [
    o("어둠 속에서 뭔가 움직인 것 같은 구석", "thrill"),
    o("벽에 적힌 숫자와 기호", "brain"),
    o("책상 위 누군가의 일기장", "story"),
    o("저 끝에 살짝 열린 또 다른 문", "explore"),
  ]),
  c("draw1-b", "draw1", "방탈출 하면 심장이 뛰는 순간은?", [
    o("오싹한 연출에 소름이 돋을 때", "thrill"),
    o("흩어진 실마리가 한 번에 이어질 때", "brain"),
    o("이야기의 반전을 알아챘을 때", "story"),
    o("숨겨진 공간이 열릴 때", "explore"),
  ]),
  c("draw1-c", "draw1", "친구가 방 하나를 추천한다. 어떤 한마디에 바로 예약해?", [
    o("\"나 거기서 진짜 주저앉았어, 무서워서\"", "thrill"),
    o("\"문제 퀄리티가 미쳤어\"", "brain"),
    o("\"스토리 때문에 끝나고 한참 멍했어\"", "story"),
    o("\"방이 계속 나와, 끝이 없어\"", "explore"),
  ]),

  // ── draw2: 끌리는 것 B ──
  c("draw2-a", "draw2", "방탈출이 끝났다. 제일 오래 남는 기억은?", [
    o("갑자기 튀어나온 그 장면", "thrill"),
    o("끝까지 안 풀리다 풀린 그 문제", "brain"),
    o("마지막에 읽은 편지 한 줄", "story"),
    o("벽이 통째로 열리던 순간", "explore"),
  ]),
  c("draw2-b", "draw2", "방탈출 테마를 직접 만든다면?", [
    o("불 꺼진 폐병원", "thrill"),
    o("단서만 백 개인 탐정 사무소", "brain"),
    o("한 사람의 인생을 따라가는 방", "story"),
    o("방이 일곱 개 이어지는 유적", "explore"),
  ]),
  c("draw2-c", "draw2", "이 중 하나만 평생 할 수 있다면?", [
    o("무서운 방만", "thrill"),
    o("문제 어려운 방만", "brain"),
    o("스토리 좋은 방만", "story"),
    o("스케일 큰 방만", "explore"),
  ]),

  // ── play1: 플레이 방식 A ──
  c("play1-a", "play1", "문이 잠겼다. 제일 먼저 하는 행동은?", [
    o("보이는 자물쇠를 일단 다 돌려본다", "rush"),
    o("방 전체를 훑고 단서를 정리한다", "analyze"),
    o("소품과 인테리어부터 구경한다", "savor"),
    o("\"각자 구역 나누자\"고 말한다", "team"),
  ]),
  c("play1-b", "play1", "타이머가 10분 남았다. 나는?", [
    o("손에 잡히는 대로 다 시도한다", "rush"),
    o("남은 문제를 순서대로 정리한다", "analyze"),
    o("시간보다 엔딩 연출이 더 궁금하다", "savor"),
    o("누가 뭘 맡을지 빠르게 정한다", "team"),
  ]),
  c("play1-c", "play1", "방 안에서 나는 주로?", [
    o("먼저 움직이는 사람", "rush"),
    o("가만히 생각하는 사람", "analyze"),
    o("구경하는 사람", "savor"),
    o("정리해서 알려 주는 사람", "team"),
  ]),

  // ── play2: 플레이 방식 B ──
  c("play2-a", "play2", "일행이 한 문제에 5분째 막혔다. 나는?", [
    o("그 사이 다른 자물쇠를 연다", "rush"),
    o("옆에서 같이 처음부터 다시 본다", "analyze", "team"),
    o("그동안 방을 한 바퀴 구경한다", "savor"),
    o("지금까지 나온 단서를 모아 공유한다", "team", "analyze"),
  ]),
  c("play2-b", "play2", "방탈출 끝나고 제일 먼저 하는 말은?", [
    o("\"몇 분 남았어? 기록 몇 등이야?\"", "rush"),
    o("\"아까 그 문제 원리가 뭐였냐면\"", "analyze"),
    o("\"그 연출 진짜 좋았다, 사진 찍자\"", "savor"),
    o("\"너 아까 그거 진짜 잘했어\"", "team"),
  ]),
  c("play2-c", "play2", "새 방에 들어가기 직전, 나의 준비는?", [
    o("준비는 무슨, 들어가서 본다", "rush"),
    o("후기로 난이도와 장치 유형을 파악한다", "analyze"),
    o("스포 없이 분위기만 기대한다", "savor", "rush"),
    o("역할 분담부터 정한다", "team"),
  ]),

  // ── genre: 장르 ──
  c("genre-a", "genre", "오늘 딱 한 방만 간다면?", [
    o("공포", "공포"),
    o("추리", "추리"),
    o("감성", "감성"),
    o("모험", "모험"),
    o("SF", "SF"),
    o("코믹", "코믹"),
  ]),
  c("genre-b", "genre", "영화로 치면 내 취향은?", [
    o("불 끄고 보는 공포 영화", "공포"),
    o("범인을 맞히는 추리 영화", "추리"),
    o("휴지가 필요한 감성 영화", "감성"),
    o("보물을 찾아 떠나는 모험 영화", "모험"),
    o("우주로 나가는 SF 영화", "SF"),
    o("배꼽 잡는 코미디 영화", "코믹"),
  ]),
  c("genre-c", "genre", "방 소개글 첫 줄, 어디에 끌려?", [
    o("\"이 집에서는 아무도 살아 나오지 못했다\"", "공포"),
    o("\"범인은 이 안에 있다\"", "추리"),
    o("\"10년 전 부치지 못한 편지\"", "감성"),
    o("\"지도의 마지막 조각을 찾아라\"", "모험"),
    o("\"우주선의 산소가 60분 남았다\"", "SF"),
    o("\"사장님 몰래 야근 탈출\"", "코믹"),
  ]),

  // ── fear: 공포 내성 ──
  s("fear-a", "fear", "무서움, 어디까지 괜찮아요?", "하나도 안 무섭게", "심장 쫄깃 대환영"),
  b("fear-b", "fear", "둘 중 하나만 갈 수 있다면?", [
    o("귀신이 직접 나오는 방", 4),
    o("귀신 이야기만 나오는 방", 2),
  ]),
  c("fear-c", "fear", "복도 끝에서 발소리가 다가온다. 나는?", [
    o("일행 뒤로 숨는다", 1),
    o("눈 감고 지나가길 기다린다", 2),
    o("움찔하고 하던 걸 계속한다", 3),
    o("놀라지만 그게 재밌다", 4),
    o("소리 나는 쪽으로 간다", 5),
  ]),

  // ── difficulty: 선호 난이도 ──
  s("difficulty-a", "difficulty", "난이도는 어느 정도가 좋아?", "술술 풀리게", "머리 쥐어뜯게"),
  b("difficulty-b", "difficulty", "어느 쪽이 더 억울해?", [
    o("너무 쉬워서 20분 만에 나온 방", 4),
    o("너무 어려워서 절반도 못 간 방", 2),
  ]),
  c("difficulty-c", "difficulty", "한 문제에 15분째 막혔다. 솔직한 심정은?", [
    o("집에 가고 싶다", 1),
    o("슬슬 지친다", 2),
    o("그럴 수 있지", 3),
    o("이 맛에 한다", 4),
    o("더 어려워도 된다", 5),
  ]),

  // ── hint: 힌트 성향 (1 안 씀 ~ 5 바로 씀) ──
  c("hint-a", "hint", "막히면 힌트, 쓰는 편?", [
    o("절대 안 쓰고 버틴다", 1),
    o("정말 최후에만", 2),
    o("적당히 쓰는 편", 3),
    o("막히면 바로바로", 4),
    o("힌트 뭐 어때, 다 쓴다", 5),
  ]),
  b("hint-b", "hint", "힌트 버튼 앞에서 나는?", [
    o("끝까지 버틴다", 2),
    o("시간이 아깝다, 누른다", 4),
  ]),
  s("hint-c", "hint", "힌트 없이 얼마나 버텨?", "1분이면 누른다", "끝까지 안 누른다", true),

  // ── atmosphere: 분위기 ──
  c("atmosphere-a", "atmosphere", "어떤 분위기가 끌려?", [
    o("어둡고 으스스한", "dark"),
    o("밝고 화사한", "bright"),
    o("낡고 퇴폐적인", "grungy"),
    o("웅장하고 판타지 같은", "epic"),
    o("아기자기 귀여운", "cute"),
  ]),
  c("atmosphere-b", "atmosphere", "방 조명을 내가 고른다면?", [
    o("촛불 하나", "dark"),
    o("햇살 드는 창", "bright"),
    o("깜빡이는 형광등", "grungy"),
    o("스테인드글라스", "epic"),
    o("알전구 가랜드", "cute"),
  ]),
  c("atmosphere-c", "atmosphere", "하룻밤 묵어야 한다면?", [
    o("안개 낀 숲속 산장", "dark"),
    o("바닷가 하얀 집", "bright"),
    o("문 닫은 놀이공원", "grungy"),
    o("오래된 성", "epic"),
    o("인형 가득한 다락방", "cute"),
  ]),

  // ── players: 인원 (0 = 상관없음) ──
  c("players-a", "players", "보통 몇 명이서 가요?", [
    o("혼자", 1),
    o("둘이서", 2),
    o("3~4명이서", 4),
    o("5명 이상", 5),
    o("그때그때 달라", 0),
  ]),
  c("players-b", "players", "방탈출 단톡방, 이상적인 인원은?", [
    o("단톡방 없음, 혼자 간다", 1),
    o("둘이면 충분하다", 2),
    o("서너 명이 딱이다", 4),
    o("많을수록 좋다", 5),
    o("모이는 대로", 0),
  ]),
  c("players-c", "players", "방 안이 제일 재밌는 순간은?", [
    o("혼자 조용히 풀어낼 때", 1),
    o("둘이 눈빛만으로 통할 때", 2),
    o("서넛이 동시에 다른 걸 풀 때", 4),
    o("여럿이 한꺼번에 소리 지를 때", 5),
    o("인원은 상관없다", 0),
  ]),

  // ── time: 플레이 시간 ──
  c("time-a", "time", "플레이 시간은 어느 정도가 좋아?", [
    o("40분 이내로 후다닥", "short"),
    o("60분 정도", "normal"),
    o("75분쯤 넉넉하게", "long"),
    o("90분 이상 길게", "extra"),
    o("상관없어", "any"),
  ]),
  b("time-b", "time", "둘 중 고른다면?", [
    o("짧고 굵은 45분", "short"),
    o("느긋하게 즐기는 80분", "long"),
  ]),
  c("time-c", "time", "탈출했는데 직원이 말한다. \"사실 방이 하나 더 있어요.\"", [
    o("이미 지쳤다", "short"),
    o("딱 여기까지가 좋았다", "normal"),
    o("오, 좋아요", "long"),
    o("두 개 더 있어도 된다", "extra"),
    o("재밌으면 다 좋다", "any"),
  ]),
];

// 답(선택 번호 또는 슬라이더 값) → 슬롯 값. 고를 수 없는 답이면 undefined.
export function answerValue(
  q: QuizQuestion,
  answer: number
): string | number | undefined {
  if (q.format === "slider") {
    const n = Math.min(5, Math.max(1, Math.round(answer)));
    return q.reverse ? 6 - n : n;
  }
  return q.options[answer]?.value;
}

export function answerBonus(q: QuizQuestion, answer: number): Play | undefined {
  if (q.format === "slider") return undefined;
  return q.options[answer]?.bonus;
}
