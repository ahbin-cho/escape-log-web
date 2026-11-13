// 포스터 찾기: 기록(테마 이름 + 매장 이름)으로 테마 목록의 공식 포스터를 찾는다. 순수 함수.

export type PosterIndex = Record<string, { id: string; poster: string }>;

const norm = (s: string) => (s || "").replace(/\s+/g, "").toLowerCase();

export function posterKey(name: string, cafe: string): string {
  return `${norm(name)}|${norm(cafe)}`;
}

// 매장 이름이 조금 달라도(지점 표기 등) 테마 이름이 하나뿐이면 그 포스터를 쓴다.
export function buildPosterIndex(rows: { id: string; name: string; cafe: string; poster_url?: string | null }[]): PosterIndex {
  const out: PosterIndex = {};
  const byName = new Map<string, { id: string; poster: string }[]>();
  for (const r of rows) {
    const poster = r.poster_url || "";
    const v = { id: r.id, poster };
    out[posterKey(r.name, r.cafe)] = v;
    const list = byName.get(norm(r.name));
    if (list) list.push(v);
    else byName.set(norm(r.name), [v]);
  }
  for (const [name, list] of byName) if (list.length === 1) out[`${name}|`] = list[0];
  return out;
}

export function findPoster(index: PosterIndex, name: string, cafe: string): { id: string; poster: string } | null {
  return index[posterKey(name, cafe)] ?? index[`${norm(name)}|`] ?? null;
}
