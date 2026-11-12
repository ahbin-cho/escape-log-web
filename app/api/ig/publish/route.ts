import { getAllThemes } from "@/lib/catalog-server";
import { dailyMystery, kstDate } from "@/lib/home-picks";
import { graphHost, mysteryCaption, resolvePost, scheduledSet } from "@/lib/instagram";
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
  // 처리 대기: 다 되면 true, 시간 안에 안 끝나면 false
  const waitReady = async (id: string, tries = 12, gapMs = 2000) => {
    for (let i = 0; i < tries; i++) {
      const st = await graph(`/${id}?fields=status_code&access_token=${encodeURIComponent(token)}`);
      if (st.status_code === "FINISHED") return true;
      if (st.status_code === "ERROR") throw new Error("인스타가 이미지·영상을 처리하지 못했어요");
      await new Promise((r) => setTimeout(r, gapMs));
    }
    return false;
  };
  const publish = async (creationId: string) => {
    const published = await graph(
      `/${userId}/media_publish`,
      form({ creation_id: creationId, access_token: token })
    );
    return json({ published: true, mediaId: published.id, label });
  };

  try {
    // 앞서 시간이 모자랐던 릴스 마저 공개
    if (finishId) {
      if (!(await waitReady(finishId, 18, 2500))) {
        return json({ pending: true, creationId: finishId, label, reason: "아직 영상 처리 중" }, 202);
      }
      return await publish(finishId);
    }

    // 하루에 한 게시물만: 오늘(한국 날짜) 무엇이든 이미 올렸으면 건너뛴다
    const recent = await graph(
      `/${userId}/media?fields=caption,timestamp&limit=5&access_token=${encodeURIComponent(token)}`
    );
    const today = kstDate(now);
    const postedToday = (recent.data ?? []).some(
      (m: { timestamp?: string }) => !!m.timestamp && kstDate(new Date(m.timestamp)) === today
    );
    if (postedToday) return json({ skipped: true, reason: "오늘 이미 게시함", label });

    // 1) 게시물(릴스·한 장·여러 장 묶음) 만들기 → 2) 처리 대기 → 3) 공개
    let creationId: string;
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
      if (!(await waitReady(c.id, 18, 2500))) {
        return json({ pending: true, creationId: c.id, label, reason: "영상 처리 중 — ?finish= 로 다시 부르기" }, 202);
      }
      creationId = c.id;
    } else if (imageUrls.length === 1) {
      const c = await graph(`/${userId}/media`, form({ image_url: imageUrls[0], caption, access_token: token }));
      await waitReady(c.id);
      creationId = c.id;
    } else {
      const children: string[] = [];
      for (const image_url of imageUrls) {
        const c = await graph(
          `/${userId}/media`,
          form({ image_url, is_carousel_item: "true", access_token: token })
        );
        children.push(c.id);
      }
      for (const id of children) await waitReady(id);
      const carousel = await graph(
        `/${userId}/media`,
        form({ media_type: "CAROUSEL", children: children.join(","), caption, access_token: token })
      );
      await waitReady(carousel.id);
      creationId = carousel.id;
    }
    return await publish(creationId);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "게시 실패" }, 500);
  }
}
