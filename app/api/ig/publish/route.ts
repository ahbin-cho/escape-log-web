import { getAllThemes } from "@/lib/catalog-server";
import { dailyMystery, kstDate } from "@/lib/home-picks";
import { alreadyPostedToday, mysteryCaption } from "@/lib/instagram";
import { SITE_URL } from "@/lib/site";

// 인스타 "오늘의 미스터리 방" 게시. Vercel Cron 이 하루 1번 부른다(vercel.json).
//
// 필요한 환경변수(Vercel 대시보드에만 넣고 코드·대화에 적지 않기):
//   CRON_SECRET        이 주소를 아무나 못 부르게 하는 값(Vercel Cron 이 자동으로 같이 보냄)
//   IG_USER_ID         인스타 프로페셔널 계정 ID
//   IG_ACCESS_TOKEN    인스타 로그인 방식 API 의 장기 토큰(약 60일 유효 → 만료 전 갱신 필요)
//   IG_API_VERSION     (선택) 기본 v21.0
// IG_* 가 없거나 ?dry=1 이면 실제로 올리지 않고 올릴 내용만 돌려준다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

async function graph(path: string, init?: RequestInit) {
  const base = `https://graph.instagram.com/${process.env.IG_API_VERSION || "v21.0"}`;
  const res = await fetch(`${base}${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    throw new Error(body.error?.message || `인스타 API 오류 ${res.status}`);
  }
  return body;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "권한 없음" }, 401);
  }

  const now = new Date();
  const theme = dailyMystery(await getAllThemes(), now);
  if (!theme) return json({ error: "오늘 고를 테마가 없어요" }, 404);

  const caption = mysteryCaption(theme);
  const imageUrl = `${SITE_URL}/api/ig/mystery?date=${kstDate(now)}`;

  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  if (dry || !userId || !token) {
    return json({ dryRun: true, reason: dry ? "dry=1" : "IG 환경변수 없음", imageUrl, caption });
  }

  try {
    // 오늘 이미 올렸으면 건너뛴다
    const recent = await graph(
      `/${userId}/media?fields=caption,timestamp&limit=5&access_token=${encodeURIComponent(token)}`
    );
    if (alreadyPostedToday(recent.data ?? [], now)) {
      return json({ skipped: true, reason: "오늘 이미 게시함" });
    }

    // 1) 게시물 만들기 → 2) 처리 끝날 때까지 잠깐 기다림 → 3) 공개
    const form = (o: Record<string, string>) => ({
      method: "POST",
      body: new URLSearchParams(o),
    });
    const container = await graph(
      `/${userId}/media`,
      form({ image_url: imageUrl, caption, access_token: token })
    );
    for (let i = 0; i < 8; i++) {
      const s = await graph(
        `/${container.id}?fields=status_code&access_token=${encodeURIComponent(token)}`
      );
      if (s.status_code === "FINISHED") break;
      if (s.status_code === "ERROR") throw new Error("인스타가 이미지를 처리하지 못했어요");
      await new Promise((r) => setTimeout(r, 2000));
    }
    const published = await graph(
      `/${userId}/media_publish`,
      form({ creation_id: container.id, access_token: token })
    );
    return json({ published: true, mediaId: published.id, themeId: theme.id });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "게시 실패" }, 500);
  }
}
