import type { MiniQuiz } from "./types";

// ─────────────────────────────────────────────────────────────
// 미니 진단 목록. 새 테스트는 여기에 하나 더 넣으면 /mini 에 뜬다.
// 한 달에 1~2개씩 openFrom/openUntil 로 돌려 가며 연다.
// 추천 링크는 /best 조건 페이지(공포도·난이도·인원·장르로 고른 목록)를 쓴다.
// 다른 사람 비율(%) 같은 통계는 실제 데이터가 없으니 넣지 않는다.
// ─────────────────────────────────────────────────────────────

const BALANCE: MiniQuiz = {
  slug: "balance",
  kicker: "밸런스 게임",
  title: "방탈 밸런스 게임",
  intro:
    "둘 중 하나만 고를 수 있다면? 일곱 번 고르면 내가 방탈출에서 진짜 원하는 게 뭔지 보여 줄게요.",
  mark: "A/B",
  layout: "versus",
  scoring: { kind: "type" },
  questions: [
    {
      id: "hint",
      prompt: "둘 중 하나만 고른다면?",
      options: [
        { label: "노힌트 60분", sub: "힌트는 못 쓰지만 시간은 빠듯하게", to: { puzzle: 2, detective: 1 } },
        { label: "힌트 무제한 90분", sub: "막히면 바로 묻고 여유 있게", to: { story: 1, party: 1 } },
      ],
    },
    {
      id: "theme",
      prompt: "오늘 들어갈 방은?",
      options: [
        { label: "공포 연출 가득한 방", sub: "문제는 쉬운데 계속 놀래킴", to: { horror: 2 } },
        { label: "고난도 퍼즐 가득한 방", sub: "하나도 안 무서운데 머리가 터짐", to: { puzzle: 2 } },
      ],
    },
    {
      id: "players",
      prompt: "같이 갈 인원은?",
      options: [
        { label: "둘이서 오붓하게", sub: "문제도 대화도 둘이서 다", to: { detective: 1, story: 1 } },
        { label: "여섯 명 왁자지껄", sub: "누가 뭘 푸는지 모르지만 즐거움", to: { party: 2 } },
      ],
    },
    {
      id: "ending",
      prompt: "결과는 이 중 하나라면?",
      options: [
        { label: "탈출 성공", sub: "근데 스토리는 하나도 기억 안 남", to: { puzzle: 1, detective: 1 } },
        { label: "탈출 실패", sub: "근데 엔딩 연출에 소름 돋음", to: { story: 2 } },
      ],
    },
    {
      id: "lock",
      prompt: "이 방의 핵심은?",
      options: [
        { label: "자물쇠 스무 개", sub: "열고 또 열고, 손이 바쁜 방", to: { puzzle: 1, party: 1 } },
        { label: "단서 하나로 범인 찾기", sub: "조용히 기록을 읽어 내려가는 방", to: { detective: 2 } },
      ],
    },
    {
      id: "actor",
      prompt: "더 끌리는 장면은?",
      options: [
        { label: "배우가 문을 열고 쫓아온다", sub: "뛰고 소리 지르고 정신없음", to: { horror: 2, party: 1 } },
        { label: "불 꺼진 서재에서 일기장을 발견", sub: "숨죽이고 한 장씩 넘김", to: { story: 1, detective: 1, horror: 1 } },
      ],
    },
    {
      id: "after",
      prompt: "탈출하고 나와서는?",
      options: [
        { label: "사진 찍고 카페에서 두 시간 수다", sub: "오늘 누가 제일 웃겼는지", to: { party: 1, story: 1 } },
        { label: "바로 다음 방 예약", sub: "아직 덜 놀랐고 덜 풀었다", to: { puzzle: 1, horror: 1 } },
      ],
    },
  ],
  results: [
    {
      key: "detective",
      title: "조용한 탐정",
      oneLiner: "자물쇠보다 단서 한 줄에 눈이 가는 사람.",
      desc: "다들 자물쇠 앞에 몰려 있을 때 혼자 벽에 붙은 메모를 읽고 있어요. 마지막에 범인을 짚는 건 대개 당신이에요.",
      stat: { label: "가장 오래 보는 것", value: "벽에 붙은 메모" },
      recommend: {
        label: "단서로 풀어 가는 추리방",
        hint: "추리 장르 테마를 쉬운 순서로 모았어요.",
        href: "/best/추리-방탈출",
        cta: "추리방 보러 가기",
      },
    },
    {
      key: "story",
      title: "엔딩 수집가",
      oneLiner: "탈출 성공보다 엔딩 연출에 진심인 사람.",
      desc: "시간이 모자라도 소품 하나, 편지 한 줄을 그냥 못 지나쳐요. 나오면서 제일 먼저 하는 말은 “스토리 미쳤다”.",
      stat: { label: "나오면서 하는 말", value: "“스토리 미쳤다”" },
      recommend: {
        label: "이야기에 빠지는 감성방",
        hint: "연출과 스토리가 중심인 테마를 모았어요.",
        href: "/best/감성-방탈출",
        cta: "감성방 보러 가기",
      },
    },
    {
      key: "horror",
      title: "비명 즐기는 형",
      oneLiner: "무서워야 방탈출이라고 생각하는 사람.",
      desc: "소리 지르는 것까지가 입장료에 포함이에요. 문제는 조금 쉬워도 괜찮으니 심장만 제대로 뛰게 해 주면 돼요.",
      stat: { label: "고르는 기준", value: "공포도부터 확인" },
      recommend: {
        label: "심장 뛰는 공포방",
        hint: "공포 장르·공포도 높은 테마를 무서운 순서로 모았어요.",
        href: "/best/공포-방탈출",
        cta: "공포방 보러 가기",
      },
    },
    {
      key: "party",
      title: "분위기 메이커",
      oneLiner: "어떤 방이냐보다 누구랑 가느냐가 중요한 사람.",
      desc: "탈출에 실패해도 단톡방이 제일 시끄러운 팀이 이긴 거예요. 여럿이 역할 나눠 떠드는 순간이 제일 즐거워요.",
      stat: { label: "최애 인원", value: "다섯 명 이상" },
      recommend: {
        label: "여럿이 가기 좋은 방",
        hint: "5명 이상 들어가는 테마만 모았어요.",
        href: "/best/단체-방탈출",
        cta: "단체방 보러 가기",
      },
    },
    {
      key: "puzzle",
      title: "노힌트 장인",
      oneLiner: "힌트 버튼은 장식이라고 믿는 사람.",
      desc: "문제 하나에 20분을 써도 내 손으로 풀어야 직성이 풀려요. 탈출 시간보다 ‘내가 풀었다’는 손맛이 더 중요해요.",
      stat: { label: "힌트 사용", value: "최후의 수단" },
      recommend: {
        label: "어려울수록 좋은 방",
        hint: "난이도 4 이상 테마를 어려운 순서로 모았어요.",
        href: "/best/고난도-방탈출",
        cta: "고난도 방 보러 가기",
      },
    },
  ],
};

const HORROR_TIME: MiniQuiz = {
  slug: "horror-time",
  kicker: "공포 내성 테스트",
  title: "공포방에서 나는 몇 분 버틸까?",
  intro:
    "불이 꺼지고, 문 너머에서 쿵 소리가 났어요. 여섯 장면에서 솔직하게 고르면 공포방에서의 내 자리와 맞는 공포도를 알려 줄게요.",
  mark: "60:00",
  layout: "list",
  scoring: {
    kind: "scale",
    tiers: [
      { key: "entrance", min: 0 },
      { key: "back", min: 4 },
      { key: "middle", min: 8 },
      { key: "front", min: 12 },
      { key: "hunter", min: 15 },
    ],
  },
  questions: [
    {
      id: "dark",
      prompt: "들어가자마자 불이 꺼졌다.",
      options: [
        { label: "무전기부터 찾는다. “저기요…”", score: 0 },
        { label: "옆 사람 팔을 꽉 잡는다", score: 1 },
        { label: "가만히 눈이 적응하길 기다린다", score: 2 },
        { label: "오, 연출 좋다. 손전등 어디 있지?", score: 3 },
      ],
    },
    {
      id: "hall",
      prompt: "어두운 복도로 가야 한다. 내 위치는?",
      options: [
        { label: "방에 남아서 다른 문제 푸는 척", score: 0 },
        { label: "맨 뒤, 앞사람 옷자락 잡고", score: 1 },
        { label: "가운데쯤, 앞뒤에 사람 있는 자리", score: 2 },
        { label: "당연히 맨 앞", score: 3 },
      ],
    },
    {
      id: "knock",
      prompt: "닫힌 문 너머에서 ‘쿵’ 소리가 났다.",
      options: [
        { label: "못 들은 걸로 한다", score: 0 },
        { label: "“네가 열어 봐” 하고 등을 민다", score: 1 },
        { label: "“셋 세고 같이 열자”", score: 2 },
        { label: "이미 문고리를 돌리고 있다", score: 3 },
      ],
    },
    {
      id: "level",
      prompt: "예약 화면에서 ‘공포도 5’를 봤다.",
      options: [
        { label: "조용히 창을 닫는다", score: 0 },
        { label: "친구가 가자고 하면… 가 본다", score: 1 },
        { label: "4까지는 해 봤으니 도전", score: 2 },
        { label: "5가 최고야? 아쉽다", score: 3 },
      ],
    },
    {
      id: "actor",
      prompt: "배우가 등장했다.",
      options: [
        { label: "비명과 함께 그 자리에 주저앉는다", score: 0 },
        { label: "소리는 지르는데 단서는 챙긴다", score: 1 },
        { label: "깜짝 놀라도 금방 웃음이 난다", score: 2 },
        { label: "고개 숙여 인사한다", score: 3 },
      ],
    },
    {
      id: "after",
      prompt: "탈출하고 나온 직후, 내 첫마디는?",
      options: [
        { label: "“다시는 안 와”", score: 0 },
        { label: "“무서웠는데… 또 오고 싶다”", score: 1 },
        { label: "“생각보다 할 만했다”", score: 2 },
        { label: "“더 센 데 어디 없어?”", score: 3 },
      ],
    },
  ],
  results: [
    {
      key: "entrance",
      title: "입구컷형",
      oneLiner: "문 닫히는 소리에 마음은 이미 밖에 있어요.",
      desc: "괜찮아요, 무서운 방만 방탈출인 건 아니에요. 놀래키는 연출 없는 방에서 문제 푸는 재미부터 느껴 보세요.",
      stat: { label: "버티는 시간", value: "브리핑 영상 3분" },
      recommend: {
        label: "공포도 1~2 추천",
        hint: "공포 장르를 빼고 공포도 2 이하만 모았어요.",
        href: "/best/안-무서운-방탈출",
        cta: "안 무서운 방 보러 가기",
      },
    },
    {
      key: "back",
      title: "뒤에 붙는 형",
      oneLiner: "무섭지만 혼자 남는 게 더 무서워서 따라가요.",
      desc: "앞사람 옷자락만 있으면 끝까지 갈 수 있어요. 살짝 으스스한 정도에서 시작해 내 한계를 천천히 넓혀 보세요.",
      stat: { label: "버티는 시간", value: "옷자락 잡고 끝까지" },
      recommend: {
        label: "공포도 2~3 추천",
        hint: "난이도·공포도가 낮은 입문용 테마를 모았어요.",
        href: "/best/입문-방탈출",
        cta: "입문용 방 보러 가기",
      },
    },
    {
      key: "middle",
      title: "중간 합류형",
      oneLiner: "처음엔 뒤에 있다가, 분위기 익으면 슬쩍 앞으로.",
      desc: "첫 비명만 지나가면 그때부터 진짜 실력이 나와요. 공포도 3~4 정도가 놀람과 재미의 균형이 딱 좋아요.",
      stat: { label: "버티는 시간", value: "첫 비명 이후 50분" },
      recommend: {
        label: "공포도 3~4 추천",
        hint: "무서운 순서로 모았으니 목록 아래쪽부터 골라 보세요.",
        href: "/best/공포-방탈출",
        cta: "공포방 보러 가기",
      },
    },
    {
      key: "front",
      title: "선두 돌격형",
      oneLiner: "어두운 복도? 일단 제가 먼저 갈게요.",
      desc: "팀이 겁먹을수록 더 앞으로 나가는 사람이에요. 다만 혼자 너무 앞서가면 단서를 놓치니 가끔 뒤도 봐 주세요.",
      stat: { label: "버티는 시간", value: "60분 내내 맨 앞" },
      recommend: {
        label: "공포도 4~5 추천",
        hint: "공포 장르·공포도 높은 테마를 무서운 순서로 모았어요.",
        href: "/best/공포-방탈출",
        cta: "공포방 보러 가기",
      },
    },
    {
      key: "hunter",
      title: "공포 사냥꾼",
      oneLiner: "배우님께 인사하고 나오는 사람.",
      desc: "웬만한 연출엔 꿈쩍도 안 해서 같이 간 친구들이 더 무서워해요. 이제 무서운 방을 ‘찾아다니는’ 단계예요.",
      stat: { label: "버티는 시간", value: "끝나고 “벌써 끝?”" },
      recommend: {
        label: "공포도 5 추천",
        hint: "가장 무서운 테마가 맨 위에 있어요. 위에서부터 도전.",
        href: "/best/공포-방탈출",
        cta: "제일 무서운 방 보러 가기",
      },
    },
  ],
};

export const MINI_QUIZZES: MiniQuiz[] = [BALANCE, HORROR_TIME];

export function miniBySlug(slug: string): MiniQuiz | null {
  return MINI_QUIZZES.find((q) => q.slug === slug) ?? null;
}

export function miniResult(quiz: MiniQuiz, key: string | null | undefined) {
  if (!key) return null;
  return quiz.results.find((r) => r.key === key) ?? null;
}

// 'YYYY-MM-DD' → 한국 시간 그날 0시(openFrom) / 그날 끝(openUntil)
function kstDay(date: string, endOfDay: boolean): number {
  const t = Date.parse(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00"}+09:00`);
  return Number.isNaN(t) ? NaN : t;
}

// 지금 열려 있는 테스트인가. 기간을 안 적었으면 늘 열림.
export function isMiniOpen(quiz: MiniQuiz, now: Date = new Date()): boolean {
  const t = now.getTime();
  if (quiz.openFrom) {
    const from = kstDay(quiz.openFrom, false);
    if (!Number.isNaN(from) && t < from) return false;
  }
  if (quiz.openUntil) {
    const until = kstDay(quiz.openUntil, true);
    if (!Number.isNaN(until) && t > until) return false;
  }
  return true;
}

// 아직 열리기 전(openFrom 이 미래)인 테스트는 목록에 아예 안 보인다.
export function isMiniUpcoming(quiz: MiniQuiz, now: Date = new Date()): boolean {
  if (!quiz.openFrom) return false;
  const from = kstDay(quiz.openFrom, false);
  return !Number.isNaN(from) && now.getTime() < from;
}
