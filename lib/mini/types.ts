// ─────────────────────────────────────────────────────────────
// 미니 진단(1분 테스트) 데이터 모양.
// 본 취향 찾기(33문항)와는 완전히 따로 돈다. 점수 계산은 lib/mini/score.ts.
// 함수 없이 순수 데이터만 둔다 → 서버·브라우저·테스트가 같이 쓴다.
// ─────────────────────────────────────────────────────────────

export type MiniOption = {
  label: string; // 선택지 본문
  sub?: string; // 작은 보조 설명(선택)
  // kind: "type" → 결과별 가산점 { 결과키: 점수 }
  to?: Record<string, number>;
  // kind: "scale" → 이 선택지의 점수(합산해서 구간으로 결과를 정한다)
  score?: number;
};

export type MiniQuestion = {
  id: string;
  prompt: string;
  options: MiniOption[];
};

export type MiniResult = {
  key: string; // 주소 ?r= 에 들어가는 영문 키
  title: string; // 결과 이름
  oneLiner: string; // 한 줄 요약(공유 미리보기 설명에도 씀)
  desc: string; // 1~2줄 설명
  stat?: { label: string; value: string }; // 결과 카드에 크게 보이는 한 칸(선택)
  recommend: {
    label: string; // "이런 방 추천" 제목
    hint: string; // 한 줄 설명
    href: string; // 사이트 안 링크
    cta: string; // 링크 버튼 글자
  };
};

export type MiniScoring =
  // 가산점이 가장 많은 결과(동점이면 results 순서가 앞인 것)
  | { kind: "type" }
  // 점수 합이 min 이상인 구간 중 가장 높은 것. tiers 는 min 오름차순.
  | { kind: "scale"; tiers: { key: string; min: number }[] };

export type MiniQuiz = {
  slug: string; // 영문 주소 (/mini/<slug>)
  title: string;
  kicker: string; // 제목 위 작은 글자 ("밸런스 게임")
  intro: string; // 시작 화면 설명
  mark: string; // 카드에 크게 들어가는 장식 글자 ("A/B", "60:00")
  layout: "versus" | "list"; // versus = A/B 두 장, list = 여러 줄
  scoring: MiniScoring;
  questions: MiniQuestion[];
  results: MiniResult[];
  // 열림 기간(선택). 'YYYY-MM-DD', 한국 시간 기준 그날 하루를 포함한다.
  // 기간 밖이면 /mini 목록에서 '지난 테스트'로 내려간다(링크는 계속 열림).
  openFrom?: string;
  openUntil?: string;
};
