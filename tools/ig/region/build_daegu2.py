"""대구편 v3 — 수원편과 같은 수채 그림체(운영자가 제미나이로 만든 그림)를 꽉 채우고, 아래 띠에 작은 카드 2×2.
카드: 공식 포스터 썸네일(원본 그대로) + 이름 + 꼬리표 + 매장. 셜록홈즈는 방탈로그 새 그림.
사용: python3 tools/ig/region/build_daegu2.py tools/ig/region/daegu.json <posters map.json> [stories]"""
import json, sys, os, html
sys.path.insert(0, os.path.dirname(__file__))
from daegu_art import POSTER_ART

T = os.path.join(os.path.dirname(__file__), "..", "templates")
e = html.escape
SHORT = {"서울이스케이프룸 대구 동성로점": "서울이스케이프룸 동성로", "서울이스케이프룸 대구 리틀보이": "서울이스케이프룸 리틀보이",
         "지구별방탈출 대구점": "지구별방탈출 대구", "셜록홈즈 대구동성로점": "셜록홈즈 동성로"}
POSTERS = {}

HEAD = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(../../../assets/fonts/SBAggroB.woff)}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:%dpx;overflow:hidden;font-family:P;letter-spacing:-.02em}
h1{font-family:A;font-weight:400;line-height:1.1}
.chip{display:inline-flex;align-items:center;gap:8px;border-radius:999px;font-weight:800}
.top{position:absolute;left:64px;right:64px;top:52px;display:flex;justify-content:space-between;align-items:center}
.grid{position:absolute;left:48px;right:48px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.c{display:flex;gap:12px;background:rgba(255,251,242,.97);border:3px solid #3A2E28;border-radius:16px;padding:10px;box-shadow:4px 4px 0 var(--ac)}
.th{flex:0 0 74px;height:111px;background:#1a1a1a;border-radius:7px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.th img{max-width:100%%;max-height:100%%;display:block}.th svg{width:100%%;height:100%%}
.b{min-width:0;flex:1;display:flex;flex-direction:column;justify-content:center;gap:5px;color:#2E2622}
.nm{font-family:A;font-size:25px;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:keep-all}
.tg{align-self:flex-start;font-weight:800;font-size:15px;color:#fff;background:var(--ac);border-radius:999px;padding:2px 10px;white-space:nowrap}
.cf{font-weight:800;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.85}
.ft{position:absolute;left:64px;right:64px;display:flex;justify-content:space-between;align-items:baseline;font-size:17px;font-weight:800}
.ft b{font-family:A;font-weight:400;font-size:24px}
</style></head><body>'''

def thumb(t):
    if t["cafe"].startswith("셜록홈즈") or t["name"] not in POSTERS:
        return POSTER_ART.get(t["name"], "")
    return f'<img src="file://{POSTERS[t["name"]]}">'

def card(t):
    return (f'<div class="c"><div class="th">{thumb(t)}</div><div class="b"><span class="tg">{e(t["tag"])}</span>'
            f'<div class="nm">{e(t.get("short") or t["name"])}</div><div class="cf">📍 {e(SHORT.get(t["cafe"], t["cafe"]))}</div></div></div>')

def credit(ts):
    b = sorted({SHORT.get(t["cafe"], t["cafe"]).split()[0] for t in ts if not t["cafe"].startswith("셜록홈즈")})
    sh = any(t["cafe"].startswith("셜록홈즈") for t in ts)
    return "포스터: " + " · ".join(b) + " 공식" + (" · 셜록홈즈 칸은 방탈로그 그림" if sh else "")

# key, 그림, 위 띠 글자색, 강조색, 칩, 제목
PAGES = [
 ("fear", "dg-fear.jpg", "#FFF3E8", "#E2554A", "😱 쫄깃한 맛", "쫄깃한 거 <span style='color:#FFB4A8'>좋아하나?</span>", "#302C39", "#FFF3E8"),
 ("calm", "dg-calm.jpg", "#3A2E28", "#3E9A6A", "🌿 안 무서븐 맛", "무서븐 건 <span style='color:#3E9A6A'>싫나?</span>", "#EEDDC9", "#3A2E28"),
 ("first", "dg-first.jpg", "#3A2E28", "#D9771C", "🐣 입문", "방탈출 <span style='color:#D9771C'>처음이가?</span>", "#EDDBC8", "#3A2E28"),
 ("story", "dg-story.jpg", "#3A2E28", "#7A68C2", "📖 이야기 맛집", "이야기 <span style='color:#7A68C2'>좋아하제?</span>", "#E9D8C5", "#3A2E28"),
]

def cover(c):
    toc = "".join(f'<div style="background:#FFFBF2;border:3px solid #3A2E28;border-radius:14px;padding:9px 16px;font-weight:800;font-size:23px;box-shadow:3px 3px 0 #3A2E28">{x}</div>'
                  for x in ["2 😱 쫄깃한 거 좋아하나?", "3 🌿 무서븐 건 싫나?", "4 🐣 방탈출 처음이가?", "5 📖 이야기 좋아하제?"])
    s1 = (HEAD % 1350) + f'''<div style="position:absolute;inset:0;background:#F7EEDD"></div>
<img src="../assets/dg-cover.jpg" style="position:absolute;left:0;top:0;width:1080px;height:1340px">
<div class="top"><span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:6px 18px;font-size:24px">📍 대구 방탈출 · 동성로</span>
<span class="chip" style="background:#3A2E28;color:#F7EEDD;padding:6px 16px;font-size:22px">1 / 6</span></div>
<h1 style="position:absolute;left:64px;top:118px;font-size:80px;color:#3A2E28">대구 방탈출,<br><span style="color:#E2603F">어데 갈래?</span></h1>
<div style="position:absolute;left:64px;right:64px;top:1105px;display:grid;grid-template-columns:1fr 1fr;gap:10px">{toc}</div>
<div class="ft" style="top:1300px;color:#3A2E28;opacity:.8"><span>대프리카 더위 피해서 들어갈 방, 테마 {c["total"]}개 중에 골라 봤다 아이가 🥵 →</span><b>방탈로그</b></div></body></html>'''
    open(os.path.join(T, "dg1.html"), "w").write(s1)
    s = (HEAD % 1920) + f'''<div style="position:absolute;inset:0;background:#F7EEDD"></div>
<img src="../assets/dg-cover.jpg" style="position:absolute;left:0;top:250px;width:1080px;height:1340px">
<div class="top" style="top:120px"><span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 20px;font-size:27px">📍 대구 방탈출 · 동성로</span></div>
<h1 style="position:absolute;left:64px;top:220px;font-size:112px;color:#3A2E28">대구 방탈출,<br><span style="color:#E2603F">어데 갈래?</span></h1>
<p style="position:absolute;left:68px;top:1380px;right:64px;font-weight:800;font-size:34px;color:#3A2E28">대프리카 더위 피해서 들어갈 방 16곳, 골라 봤다 아이가 🥵</p>
<p style="position:absolute;left:0;right:0;top:1660px;text-align:center;font-weight:800;font-size:34px;color:#3A2E28">👇 눌러서 대구 테마 다 보기</p></body></html>'''
    open(os.path.join(T, "dgs1.html"), "w").write(s)

def feed(c):
    S = c["sections"]; chk = c.get("checked_on", "")
    for i, (key, art, fg, ac, chip, title, bot, bfg) in enumerate(PAGES, 2):
        s = (HEAD % 1350) + f'''<div style="position:absolute;inset:0;background:{bot}"></div>
<img src="../assets/{art}" style="position:absolute;left:0;top:0;width:1080px;height:1340px">
<div class="top"><span class="chip" style="background:{ac};color:#fff;border:3px solid {fg};padding:6px 18px;font-size:24px">{chip}</span>
<span class="chip" style="background:{fg};color:{bot if key != 'fear' else '#6E6EA5'};padding:6px 16px;font-size:22px">{i} / 6</span></div>
<h1 style="position:absolute;left:64px;top:128px;font-size:88px;color:{fg}">{title}</h1>
<p style="position:absolute;left:68px;top:238px;font-weight:800;font-size:24px;color:{fg};opacity:.8">📍 대구 동성로 일대 · 매장 공식 예약 페이지 기준({chk} 확인)</p>
<div class="grid" style="top:1008px;--ac:{ac}">{"".join(card(t) for t in S[key])}</div>
<div class="ft" style="top:1300px;color:{bfg};opacity:.8"><span>{credit(S[key])}</span><b>방탈로그</b></div></body></html>'''
        open(os.path.join(T, f"dg{i}.html"), "w").write(s)
    # 6 마무리
    s6 = (HEAD % 1350) + f'''<div style="position:absolute;inset:0;background:#A7AEC5"></div>
<img src="../assets/dg-end.jpg" style="position:absolute;left:0;top:0;width:1080px;height:1340px">
<div class="top"><span class="chip" style="background:#E2603F;color:#fff;border:3px solid #3A2E28;padding:6px 18px;font-size:24px">📌 저장해 두기</span>
<span class="chip" style="background:#3A2E28;color:#BBBBD2;padding:6px 16px;font-size:22px">6 / 6</span></div>
<h1 style="position:absolute;left:64px;top:108px;font-size:74px;color:#2E2650">대구 테마 {c["total"]}개,<br><span style="color:#E2603F">다 보고 싶제?</span></h1>
<p style="position:absolute;right:64px;top:250px;text-align:right;font-weight:800;font-size:25px;color:#2E2650;opacity:.85">단디 저장해 두고, 다녀온 방은 다이어리에 적어 두이소 📒</p>
<div style="position:absolute;left:64px;right:64px;top:1095px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;gap:10px;flex-wrap:wrap">
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">🔍 검색창에 "대구"</span>
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">📖 줄거리·난이도·후기</span>
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">🎯 취향 추천</span></div>
<div><span class="chip" style="background:#E2603F;color:#fff;border:3px solid #3A2E28;padding:11px 24px;font-size:29px;box-shadow:5px 5px 0 #3A2E28">프로필 링크 → bangtallog.com</span></div></div>
<div class="ft" style="top:1300px;color:#2E2650;opacity:.8"><span>먼저 써 보고 10초 가입</span><b>방탈로그</b></div></body></html>'''
    open(os.path.join(T, "dg6.html"), "w").write(s6)
    print("dg2~6 written (v3)")

def stories(c):
    S = c["sections"]; chk = c.get("checked_on", "")
    for i, (key, art, fg, ac, chip, title, bot, bfg) in enumerate(PAGES, 2):
        s = (HEAD % 1920) + f'''<div style="position:absolute;inset:0;background:{bot}"></div>
<div style="position:absolute;left:0;right:0;top:0;height:420px;background:{'#6E6EA5' if key == 'fear' else bot}"></div>
<img src="../assets/{art}" style="position:absolute;left:0;top:160px;width:1080px;height:1340px">
<div class="top" style="top:120px"><span class="chip" style="background:{ac};color:#fff;border:3px solid {fg};padding:7px 20px;font-size:27px">{chip}</span></div>
<h1 style="position:absolute;left:64px;top:220px;font-size:100px;color:{fg}">{title}</h1>
<p style="position:absolute;left:68px;top:340px;font-weight:800;font-size:27px;color:{fg};opacity:.8">📍 대구 동성로 일대 · 공식 예약 페이지 기준({chk} 확인)</p>
<div class="grid" style="top:1090px;grid-template-columns:1fr;--ac:{ac}">{"".join(card(t) for t in S[key])}</div>
<div class="ft" style="top:1700px;color:{bfg};opacity:.75"><span>{credit(S[key])}</span></div></body></html>'''
        open(os.path.join(T, f"dgs{i}.html"), "w").write(s)
    print("dgs2~5 written (v3)")

if __name__ == "__main__":
    c = json.load(open(sys.argv[1]))
    if len(sys.argv) > 2: POSTERS.update(json.load(open(sys.argv[2])))
    cover(c)
    (stories if len(sys.argv) > 3 and sys.argv[3] == "stories" else feed)(c)
