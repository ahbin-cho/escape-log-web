// 포스터 찾기: 기록(테마 이름 + 매장 이름)으로 테마 목록의 공식 포스터를 찾는다. 순수 함수.

export type PosterIndex = Record<string, { id: string; poster: string }>;

// 띄어쓰기·기호·대소문자는 무시한다("눈 먼 귀금속상인" = "눈먼 귀금속 상인", "V.E.T" = "VET")
const norm = (s: string) => (s || "").toLowerCase().replace(/[^0-9a-z가-힣]/g, "");

// 사람들이 한글로 적는 영어 제목(모두의 후기에서 포스터가 안 붙던 것들). 필요할 때 한 줄씩 추가.
const ALIASES: Record<string, string> = {
  녹스: "nox",
  리턴: "return",
  얼라이브: "alive",
  오케이컷: "okcut",
  필름바이밥: "filmbybob",
  필름바이에디: "filmbyeddy",
  필름바이스티브: "filmbysteve",
  메모리오브토니: "memoryoftony",
  히어아이엠: "hereiam",
  워너고홈: "wannagohome",
  포프리: "forfree",
  네드: "nerd",
  그카지말라캤잖아: "그카지말라캤자나",
};

// 이름 열쇠: 시리즈 머리말("EP2 : ")을 떼고, 한글 표기는 원래 제목으로 바꾼다
function nameKey(name: string): string {
  const n = norm(name).replace(/^ep\d+/, "");
  return ALIASES[n] ?? n;
}

export function posterKey(name: string, cafe: string): string {
  return `${nameKey(name)}|${norm(cafe)}`;
}

// 매장 이름이 조금 달라도(지점 표기 등) 테마 이름이 하나뿐이면 그 포스터를 쓴다.
export function buildPosterIndex(rows: { id: string; name: string; cafe: string; poster_url?: string | null }[]): PosterIndex {
  const out: PosterIndex = {};
  const byName = new Map<string, { id: string; poster: string }[]>();
  for (const r of rows) {
    const poster = r.poster_url || "";
    const v = { id: r.id, poster };
    out[posterKey(r.name, r.cafe)] = v;
    const list = byName.get(nameKey(r.name));
    if (list) list.push(v);
    else byName.set(nameKey(r.name), [v]);
  }
  for (const [name, list] of byName) if (list.length === 1) out[`${name}|`] = list[0];
  return out;
}

export function findPoster(index: PosterIndex, name: string, cafe: string): { id: string; poster: string } | null {
  return index[posterKey(name, cafe)] ?? index[`${nameKey(name)}|`] ?? null;
}
