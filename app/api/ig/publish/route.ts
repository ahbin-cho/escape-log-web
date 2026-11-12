import { getAllThemes } from "@/lib/catalog-server";
import { dailyMystery, kstDate } from "@/lib/home-picks";
import { graphHost, mysteryCaption, resolvePost, scheduledExtra, scheduledSet } from "@/lib/instagram";
import { SITE_URL } from "@/lib/site";

// 인스타 "오늘의 미스터리 방" 게시. Vercel Cron 이 하루 1번 부른다(vercel.json).
//
// 필요한 환경변수(Vercel 대시보드에만 넣고 코드·대화에 적지 않기):
//   CRON_SECRET        이 주소를 아무나 못 부르게 하는 값(Vercel Cron 이 자동으로 같이 보냄)
//   IG_USER_ID         인스타 프로페셔널 계정 ID
//   IG_ACCESS_TOKEN    게시 토큰. 두 종류 모두 된다:
//                      - 통합 로그인(비즈니스용 Facebook 로그인)의 시스템 사용자 토큰(만료 없음) → graph.facebook.com
//                      - 인스타 로그인 방식 토큰(IGAA 로 시작, 약 60일) → graph.instagram.com
//   IG_API_VERSION     (선택) 기본 v21.0
// IG_* 가 없거나 ?dry=1 이면 실제로 올리지 않고 올릴 내용만 돌려준다.
// ?check=1 이면 올리지 않고 토큰으로 계정 이름만 읽어 연결이 맞는지 확인한다.
// ?set=<묶음> 으로 일정과 상관없이 바로 올릴 수 있다(GitHub Actions "인스타 지금 올리기").
// 릴스는 영상 처리에 시간이 걸려 시간 안에 못 끝나면 pending 과 creationId 를 돌려준다
// → ?finish=<creationId> 로 다시 부르면 공개만 한다.
// 여러 장 묶음도 시간이 모자라면 pending 과 children 을 돌려준다 → ?set=<묶음>&children=<id,id,…> 로 이어서.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 캐러셀(6장)은 이미지마다 처리 대기가 있어 길게

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

async function graph(path: string, init?: RequestInit) {
  const token = process.env.IG_ACCESS_TOKEN ?? "";
  const base = `https://${graphHost(token)}/${process.env.IG_API_VERSION || "v21.0"}`;
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
  const params = new URL(req.url).searchParams;
  const finishId = params.get("finish");
  const childIds = (params.get("children") ?? "").split(",").filter(Boolean);
  // Vercel 함수 제한(60초) 안에 끝내도록 45초가 지나면 기다리기를 멈추고 이어서 하라고 돌려준다
  const deadline = Date.now() + 45_000;

  // 오늘 올릴 것: ?set= 으로 지정했거나 일정(POST_SCHEDULE)에 있으면 그 묶음, 아니면 오늘의 미스터리 방
  const set = params.get("set") || scheduledSet(kstDate(now));
  // 릴스를 직접 올리는 날: 자동 게시를 쉰다(하루 1개 유지)
  if (set === "skip") return json({ skipped: true, reason: "일정상 쉬는 날(릴스 직접 게시)", label: "skip" });
  const themes = await getAllThemes();
  const resolved = set ? resolvePost(set, themes) : null;
  let caption: string;
  let imageUrls: string[];
  let videoUrl: string | null = null;
  let label: string;
  if (set && resolved) {
    caption = resolved.caption;
    imageUrls = resolved.imagePaths.map((p) => `${SITE_URL}${p}`);
    if (resolved.videoPath) videoUrl = `${SITE_URL}${resolved.videoPath}`;
    label = set;
  } else {
    // 일정이 없거나(혹은 묶음을 못 만들면) 오늘의 미스터리 방
    const theme = dailyMystery(themes, now);
    if (!theme) return json({ error: "오늘 고를 테마가 없어요" }, 404);
    caption = mysteryCaption(theme);
    imageUrls = [`${SITE_URL}/api/ig/mystery?date=${kstDate(now)}`];
    label = `mystery:${theme.id}`;
  }

  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (params.get("check") === "1") {
    if (!userId || !token) return json({ ok: false, reason: "IG 환경변수 없음" }, 400);
    try {
      const me = await graph(
        `/${userId}?fields=username&access_token=${encodeURIComponent(token)}`
      );
      return json({ ok: true, username: me.username, host: graphHost(token) });
    } catch (e) {
      return json({ ok: false, host: graphHost(token), error: e instanceof Error ? e.message : "확인 실패" }, 500);
    }
  }
  const dry = params.get("dry") === "1";
  if (dry || !userId || !token) {
    return json({ dryRun: true, reason: dry ? "dry=1" : "IG 환경변수 없음", label, imageUrls, videoUrl, caption });
  }

  const form = (o: Record<string, string>) => ({
    method: "POST",
    body: new URLSearchParams(o),
  });
  // 처리 대기: 다 되면 true, 시간(deadline) 안에 안 끝나면 false
  const waitReady = async (id: string) => {
    for (;;) {
      const st = await graph(`/${id}?fields=status_code&access_token=${encodeURIComponent(token)}`);
      if (st.status_code === "FINISHED") return true;
      if (st.status_code === "ERROR") throw new Error("인스타가 이미지·영상을 처리하지 못했어요");
      if (Date.now() + 2000 > deadline) return false;
      await new Promise((r) => setTimeout(r, 2000));
    }
  };
  const allReady = async (ids: string[]) => (await Promise.all(ids.map(waitReady))).every(Boolean);
  const pending = (o: Record<string, unknown>) =>
    json({ pending: true, label, reason: "인스타 처리 중 — 돌려준 값으로 다시 부르기", ...o }, 202);
  // 묶음 조각이 다 처리되면 묶음을 만들고 공개
  const finishCarousel = async (children: string[]) => {
    await allReady(children);
    let carousel: { id: string };
    try {
      carousel = await graph(
        `/${userId}/media`,
        form({ media_type: "CAROUSEL", children: children.join(","), caption, access_token: token })
      );
    } catch (e) {
      if (notReady(e)) return pending({ children: children.join(",") });
      throw e;
    }
    return tryPublish(carousel.id);
  };
  const tryPublish = async (creationId: string) => {
    await waitReady(creationId);
    try {
      return await publish(creationId);
    } catch (e) {
      if (notReady(e)) return pending({ creationId });
      throw e;
    }
  };
  // 인스타가 처리 상태를 "FINISHED"로 늦게(또는 안) 알려 주는 경우가 있어서,
  // 기다린 뒤에도 일단 시도해 보고 "아직 준비 안 됨" 오류일 때만 이어서 하라고 돌려준다
  const notReady = (e: unknown) => /not ready|not finished|being processed|아직|9007|2207027/i.test(e instanceof Error ? e.message : "");
  const publish = async (creationId: string) => {
    const published = await graph(
      `/${userId}/media_publish`,
      form({ creation_id: creationId, access_token: token })
    );
    return json({ published: true, mediaId: published.id, label });
  };

  try {
    // 앞서 시간이 모자랐던 릴스 마저 공개
    if (finishId) return await tryPublish(finishId);
    if (childIds.length > 0) return await finishCarousel(childIds);

    // 하루에 한 게시물만: 오늘(한국 날짜) 무엇이든 이미 올렸으면 건너뛴다
    const recent = await graph(
      `/${userId}/media?fields=caption,timestamp&limit=5&access_token=${encodeURIComponent(token)}`
    );
    const today = kstDate(now);
    const todays = (recent.data ?? []).filter(
      (m: { timestamp?: string }) => !!m.timestamp && kstDate(new Date(m.timestamp)) === today
    ) as { caption?: string }[];
    // 일정에 extra 가 켜진 날(일정대로 부를 때만)은 직접 올린 게 있어도 올리되, 같은 게시물(첫 줄이 같은 캡션)은 두 번 올리지 않는다
    const extra = !params.get("set") && scheduledExtra(today);
    const firstLine = caption.split("\n")[0];
    const blocked = extra
      ? todays.some((m) => (m.caption ?? "").split("\n")[0] === firstLine)
      : todays.length > 0;
    if (blocked) return json({ skipped: true, reason: extra ? "오늘 같은 게시물을 이미 올림" : "오늘 이미 게시함", label });

    // 1) 게시물(릴스·한 장·여러 장 묶음) 만들기 → 2) 처리 대기 → 3) 공개
    if (videoUrl) {
      const c = await graph(
        `/${userId}/media`,
        form({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          share_to_feed: "true",
          thumb_offset: "9000", // 제목이 다 나온 마지막 장면을 표지로
          access_token: token,
        })
      );
      return await tryPublish(c.id);
    } else if (imageUrls.length === 1) {
      const c = await graph(`/${userId}/media`, form({ image_url: imageUrls[0], caption, access_token: token }));
      return await tryPublish(c.id);
    } else {
      // 조각을 한꺼번에 만들어 인스타가 이미지를 동시에 가져가게 한다
      const children = await Promise.all(
        imageUrls.map(async (image_url) =>
          (await graph(`/${userId}/media`, form({ image_url, is_carousel_item: "true", access_token: token }))).id as string
        )
      );
      return await finishCarousel(children);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "게시 실패" }, 500);
  }
}
