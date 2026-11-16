// 자동 게시를 멈춘 뒤(운영자 결정 11/16), 자동이 올리던 것(일정 묶음·오늘의 미스터리 방)을 날짜별로 뽑아
// 직접 올리기 묶음으로 만든다. 서버(publish)와 같은 함수로 고르므로 자동이 올렸을 내용과 같다.
//
//   npx tsx tools/ig/manual_daily.ts <catalog.json> <out-dir> 2026-11-16 2026-12-01
//   catalog.json = Supabase catalog 전체(select=*). 이미지는 사이트(SITE_URL)의 /api/ig/* 에서 받는다.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { normalizeGenre } from "../../lib/genre";
import { dailyMystery } from "../../lib/home-picks";
import { mysteryCaption, resolvePost, scheduledSet } from "../../lib/instagram";
import type { ThemeRow } from "../../lib/catalog-server";

const [catalogPath, out, from, to] = process.argv.slice(2);
const SITE = "https://talkkaknote.com";
const raw = JSON.parse(readFileSync(catalogPath, "utf8")) as ThemeRow[];
const themes = raw
  .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
  .map((t) => ({ ...t, genre: normalizeGenre(t.genre, t.tags) }));

const WD = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
for (let d = new Date(`${from}T03:00:00Z`); d <= new Date(`${to}T03:00:00Z`); d = new Date(d.getTime() + 86400_000)) {
  const day = d.toISOString().slice(0, 10);
  const set = scheduledSet(day);
  if (set === "skip") continue;
  let caption: string;
  let images: string[];
  let label: string;
  const resolved = set && !set.startsWith("reel:") ? resolvePost(set, themes) : null;
  if (resolved && resolved.imagePaths.length) {
    caption = resolved.caption;
    images = resolved.imagePaths.map((p) => SITE + p);
    label = set!.replace(/[:/]/g, "-");
  } else {
    const t = dailyMystery(themes, d);
    if (!t) continue;
    caption = mysteryCaption(t);
    images = [`${SITE}/api/ig/mystery?date=${day}`];
    label = "mystery";
  }
  const wd = WD[new Date(`${day}T12:00:00+09:00`).getDay()];
  const dir = join(out, `auto_${day.slice(5).replace("-", "")}_${wd}_${label}`);
  mkdirSync(dir, { recursive: true });
  images.forEach((u, i) => execFileSync("curl", ["-s", "-f", "-m", "90", "-o", join(dir, `${i + 1}.jpg`), u]));
  writeFileSync(join(dir, "caption.txt"), caption + "\n");
  writeFileSync(
    join(dir, "how.txt"),
    `${day}(${wd}) 낮 12시쯤 피드\n1. [+] → [게시물] → ${images.length > 1 ? `[여러 항목 선택] → 1~${images.length}.jpg 순서대로` : "1.jpg"}\n2. caption.txt 붙여 넣기 → [공유]\n`
  );
  console.log(dir, images.length);
}
