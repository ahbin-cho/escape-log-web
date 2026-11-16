import { graphHost } from "@/lib/instagram";

// 인스타 댓글 모아 보기 + (확인받은) 답글 달기. GitHub Actions "인스타 댓글" 이 부른다.
// 토큰은 Vercel 환경변수(IG_ACCESS_TOKEN)에만 있고, 이 주소는 CRON_SECRET 이 있어야 열린다.
//   GET  ?limit=10            최근 게시물 N개와 댓글·답글(우리가 답했는지 answered 로 표시)
//   POST ?reply=<댓글ID>      본문 {"message": "..."} 로 그 댓글에 답글
// 토큰에 instagram_manage_comments(또는 instagram_business_manage_comments) 권한이 있어야 한다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

async function graph(path: string, init?: RequestInit) {
  const token = process.env.IG_ACCESS_TOKEN ?? "";
  const base = `https://${graphHost(token)}/${process.env.IG_API_VERSION || "v21.0"}`;
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${base}${path}${init?.method === "POST" ? "" : `${sep}access_token=${encodeURIComponent(token)}`}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const e = body.error ?? {};
    const step = path.split("?")[0].replace(/\/\d+/g, "/:id");
    throw new Error(`${e.message || `인스타 API 오류 ${res.status}`} [${step}]${e.code ? ` (code ${e.code}${e.error_subcode ? ` · sub ${e.error_subcode}` : ""})` : ""}`);
  }
  return body;
}

type Reply = { id: string; text?: string; username?: string; timestamp?: string };
type Comment = Reply & { like_count?: number; replies?: { data?: Reply[] } };
type Media = {
  id: string;
  caption?: string;
  permalink?: string;
  timestamp?: string;
  media_type?: string;
  comments_count?: number;
  comments?: { data?: Comment[] };
};

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return json({ error: "권한 없음" }, 401);
  const userId = process.env.IG_USER_ID;
  if (!userId || !process.env.IG_ACCESS_TOKEN) return json({ error: "IG_USER_ID / IG_ACCESS_TOKEN 이 없어요" }, 500);
  const limit = Math.min(25, Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 10));
  try {
    const me = await graph(`/${userId}?fields=username`);
    const fields = `id,caption,permalink,timestamp,media_type,comments_count,comments.limit(50){id,text,username,timestamp,like_count,replies{id,text,username,timestamp}}`;
    const media = (await graph(`/${userId}/media?fields=${encodeURIComponent(fields)}&limit=${limit}`)).data as Media[];
    let total = 0;
    let waiting = 0;
    const posts = media.map((m) => {
      const comments = (m.comments?.data ?? []).map((c) => {
        const replies = c.replies?.data ?? [];
        const mine = c.username === me.username;
        const answered = mine || replies.some((r) => r.username === me.username);
        if (!mine) total++;
        if (!answered) waiting++;
        return { id: c.id, username: c.username, text: c.text, timestamp: c.timestamp, likes: c.like_count ?? 0, mine, answered, replies };
      });
      return {
        id: m.id,
        timestamp: m.timestamp,
        type: m.media_type,
        permalink: m.permalink,
        caption: (m.caption ?? "").split("\n")[0].slice(0, 80),
        comments_count: m.comments_count ?? comments.length,
        comments,
      };
    });
    return json({ ok: true, username: me.username, total, waiting, posts });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "댓글을 못 읽었어요" }, 500);
  }
}

export async function POST(req: Request) {
  if (!authorized(req)) return json({ error: "권한 없음" }, 401);
  const commentId = new URL(req.url).searchParams.get("reply") ?? "";
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!/^\d+$/.test(commentId)) return json({ error: "reply=<댓글ID> 가 필요해요" }, 400);
  if (!message || message.length > 2200) return json({ error: "message 는 1~2200자" }, 400);
  try {
    const form = new URLSearchParams({ message, access_token: process.env.IG_ACCESS_TOKEN ?? "" });
    const r = await graph(`/${commentId}/replies`, { method: "POST", body: form });
    return json({ ok: true, replyId: r.id });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "답글을 못 달았어요" }, 500);
  }
}
