// 나이 제한: 매장이 공식으로 밝힌 제한을 카탈로그 태그("19세 미만 불가", "고등학생 미만 불가")로 넣어 두고,
// 테마 화면에서는 눈에 띄게 알리고, 홈·인스타 자동 추천에서는 성인 전용 테마를 뺀다.
export interface AgeLimit {
  label: string; // 화면에 보여 줄 말: "19세 미만 이용 불가"
  adultOnly: boolean; // 성인 전용(19세 미만 불가)
}

export function ageLimit(tags: string[] | null | undefined): AgeLimit | null {
  const list = tags ?? [];
  const adult = list.some((t) => /19\s*금|19\s*세\s*미만|성인\s*전용|청소년\s*이용\s*불가/.test(t));
  if (adult) return { label: "19세 미만 이용 불가", adultOnly: true };
  const other = list.find((t) => /미만.*불가/.test(t));
  if (other) return { label: other.replace(/미만\s*불가/, "미만 이용 불가"), adultOnly: false };
  return null;
}

export function isAdultOnly(tags: string[] | null | undefined): boolean {
  return ageLimit(tags)?.adultOnly ?? false;
}

// 가오픈(시범 운영): 매장이 공식으로 가오픈이라고 밝힌 동안만 카탈로그 태그 "가오픈"을 붙인다.
// 정식 오픈하면 태그를 뗀다(값이 바뀌는 경우가 많아, 가오픈 때 값은 정식 오픈 뒤 다시 확인).
export function isSoftOpen(tags: string[] | null | undefined): boolean {
  return (tags ?? []).some((t) => /가\s*오픈/.test(t));
}
