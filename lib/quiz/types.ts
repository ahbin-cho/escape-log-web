import type { QuizValues, TypeId } from "./slots";

// 서비스 마스코트 (사주유 '옥냥이'와 겹치지 않게 방탈출 유령 가이드)
export const MASCOT = {
  name: "탈출귀",
  emoji: "👻",
  tagline: "방 좀 깨본 유령이 취향 딱 짚어줄게",
} as const;

export interface QuizType {
  title: string;
  tagline: string; // 탈출귀 반말 한 줄
}

// 유형 16개. 이름·설명의 원본은 스펙 7장. 판정 로직과 무관하게 고칠 수 있다.
export const QUIZ_TYPES: Record<TypeId, QuizType> = {
  "thrill-rush": {
    title: "공포방 돌격대장",
    tagline: "무서울수록 먼저 들어가. 비명은 지르지만 발은 안 멈춰.",
  },
  "thrill-analyze": {
    title: "침착한 퇴마사",
    tagline: "귀신이 나와도 단서부터 챙겨. 놀라는 건 탈출하고 나서.",
  },
  "thrill-savor": {
    title: "호러 연출 수집가",
    tagline: "문제보다 연출이 먼저야. 소름 돋는 장면을 모으러 다녀.",
  },
  "thrill-team": {
    title: "비명 합창단장",
    tagline: "혼자는 못 가도 같이면 어디든 가. 같이 놀라는 게 제일 재밌어.",
  },
  "brain-rush": {
    title: "자물쇠 폭격기",
    tagline: "생각보다 손이 빨라. 되는 번호가 나올 때까지 돌려.",
  },
  "brain-analyze": {
    title: "노힌트 명탐정",
    tagline: "힌트는 자존심이 허락 안 해. 끝까지 직접 풀어내.",
  },
  "brain-savor": {
    title: "장치 감별사",
    tagline: "문제가 풀리는 순간보다 장치가 움직이는 순간이 좋아.",
  },
  "brain-team": {
    title: "작전 참모",
    tagline: "누가 뭘 풀지 정리해 주는 사람. 팀의 속도가 달라져.",
  },
  "story-rush": {
    title: "급전개 직진러",
    tagline: "다음 장면이 궁금해서 못 참아. 결말을 향해 직진해.",
  },
  "story-analyze": {
    title: "복선 회수꾼",
    tagline: "흘린 떡밥을 다 기억해. 마지막에 전부 이어 붙여.",
  },
  "story-savor": {
    title: "과몰입 주인공",
    tagline: "방에 들어가면 그 사람이 돼. 엔딩에서 제일 오래 서 있어.",
  },
  "story-team": {
    title: "눈물 나눔 메이트",
    tagline: "좋은 이야기는 같이 봐야 해. 끝나고 수다가 본편이야.",
  },
  "explore-rush": {
    title: "문 다 여는 개척자",
    tagline: "열 수 있는 건 다 열어 봐. 새 공간이 제일 큰 보상이야.",
  },
  "explore-analyze": {
    title: "지도 그리는 탐사대원",
    tagline: "방 구조부터 머리에 넣어. 어디에 뭐가 있었는지 다 기억해.",
  },
  "explore-savor": {
    title: "세계관 여행자",
    tagline: "탈출보다 구경이야. 다른 세계에 온 기분이 좋아서 가.",
  },
  "explore-team": {
    title: "원정대 대장",
    tagline: "스케일 큰 방일수록 사람을 모아. 다 같이 넘는 게 재밌어.",
  },
};

// 운영자가 public/types/ 에 넣는 그림. 없으면 화면이 마스코트로 대체한다.
export function typeImage(id: TypeId): string {
  return `/types/${id}.jpg`;
}

export const PLAYERS_LABEL: Record<number, string> = {
  1: "혼자",
  2: "2인",
  4: "3~4인",
  5: "5인 이상",
  0: "상관없음",
};

export const TIME_LABEL: Record<QuizValues["time"], string> = {
  short: "40분",
  normal: "60분",
  long: "75분",
  extra: "90분 이상",
  any: "상관없음",
};

// 저장용 요약(친구 궁합 등 기존 화면이 읽는 형태).
export interface Persona {
  title: string;
  emoji: string;
  blurb: string;
  brand?: { name: string; reason: string };
}
