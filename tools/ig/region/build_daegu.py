"""대구편 캐러셀 6장(사투리 제목 + 대구 풍경 + 테마별 새 그림).
사용: python3 tools/ig/region/build_daegu.py tools/ig/region/daegu.json
카드 값은 daegu.json 그대로(공식 예약 페이지로 확인한 값만 넣을 것)."""
import json, sys, os, html
sys.path.insert(0, os.path.dirname(__file__))
from daegu_art import motif, COVER

T = os.path.join(os.path.dirname(__file__), "..", "templates")
e = html.escape
HEAD = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(../../../assets/fonts/SBAggroB.woff)}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden;font-family:P;letter-spacing:-.02em}
h1{font-family:A;font-weight:400;line-height:1.08}
.chip{display:inline-flex;align-items:center;gap:8px;border-radius:999px;font-weight:800}
.top{position:absolute;left:64px;right:64px;top:52px;display:flex;justify-content:space-between;align-items:center}
.grid{position:absolute;left:52px;right:52px;top:370px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.cd{background:#FFFBF2;border:4px solid #1D1D1D;border-radius:22px;overflow:hidden;box-shadow:7px 8px 0 #1D1D1D;display:flex;flex-direction:column}
.cd .art{height:208px;border-bottom:4px solid #1D1D1D;position:relative}
.cd .art svg{width:100%;height:100%;display:block}
.cd .art .tg{position:absolute;right:12px;top:12px;background:#1D1D1D;color:#fff;font-weight:800;font-size:20px;border-radius:999px;padding:5px 13px}
.cd .bd{padding:16px 20px 18px;color:#1D1D1D}
.cd .nm{font-family:A;font-size:32px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cd .q{font-weight:500;font-size:20px;color:#4A4038;line-height:1.4;margin-top:8px;height:56px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:keep-all}
.cd .cf{margin-top:10px;font-weight:800;font-size:21px;color:#1D1D1D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot{position:absolute;left:64px;right:64px;bottom:40px;display:flex;justify-content:space-between;align-items:baseline;font-size:21px}
.foot b{font-family:A;font-weight:400;font-size:26px}
</style></head><body>'''

def q(s, n=40):
    s = (s or "").strip().strip('"“”\'')
    return s if len(s) <= n else s[:n].rstrip() + "…"

def card(t, tag, line):
    tag = t.get("tag", tag); line = t.get("line", line)
    return f'''<div class="cd"><div class="art">{motif(t["name"], t["genre"])}<span class="tg">{e(tag)}</span></div>
<div class="bd"><div class="nm">{e(t.get("short") or t["name"])}</div><div class="q">{e(line)}</div><div class="cf">📍 {e(t["cafe"])}</div></div></div>'''

def first_tag(t):
    p = [f'난이도 {t["difficulty"]}/5']
    if t.get("time"): p.append(f'{t["time"]}분')
    return " · ".join(p)

PAGES = [
 ("fear", "#1A1420", "#F5E9F0", "#FF5A4E", "😱 쫄깃한 맛", "쫄깃한 거<br><span style='color:#FF5A4E'>좋아하나?</span>", "공포·스릴러 · 줄거리 첫 문장만 살짝",
  lambda t: (f'공포 {t["fear"]}/5', "“" + q(t["story"]) + "”")),
 ("calm", "#DFF2E6", "#1D1D1D", "#2E8B57", "🌿 안 무서븐 맛", "무서븐 건<br><span style='color:#2E8B57'>싫나?</span>", "공포도 낮은 방 · 장르 골고루",
  lambda t: (f'{t["genre"]} · 난이도 {t["difficulty"]}/5', "“" + q(t["story"]) + "”")),
 ("first", "#FFF1C2", "#1D1D1D", "#D9771C", "🐣 입문", "방탈출<br><span style='color:#D9771C'>처음이가?</span>", "난이도 낮은 방 · 고를 수 있는 방까지",
  lambda t: (first_tag(t), "“" + q(t["story"]) + "”")),
 ("story", "#ECE6FA", "#1D1D1D", "#6A55C2", "📖 이야기 맛집", "이야기<br><span style='color:#6A55C2'>좋아하제?</span>", "줄거리 첫 문장 미리보기",
  lambda t: (t["genre"], "“" + q(t["story"]) + "”")),
]

def main(p):
    c = json.load(open(p)); S = c["sections"]; total = c["total"]; chk = c.get("checked_on", "")
    foot_note = f"정보는 매장 공식 예약 페이지 기준{(' · ' + chk + ' 확인') if chk else ''} · 그림은 방탈로그가 새로 그렸어요"
    # 1 표지
    toc = "".join(f'<div style="background:#FFFBF2;border:4px solid #1D1D1D;border-radius:18px;padding:12px 18px;font-weight:800;font-size:26px;box-shadow:4px 5px 0 #1D1D1D">{x}</div>'
                  for x in ["2 😱 쫄깃한 거 좋아하나?", "3 🌿 무서븐 건 싫나?", "4 🐣 방탈출 처음이가?", "5 📖 이야기 좋아하제?"])
    s1 = HEAD + COVER + f'''
<div class="top"><span class="chip" style="background:#FFFBF2;border:4px solid #1D1D1D;padding:8px 20px;font-size:26px">📍 대구 방탈출 · 동성로</span>
<span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:7px 16px;font-size:23px">1 / 6</span></div>
<h1 style="position:absolute;left:64px;top:150px;font-size:104px;color:#1D1D1D">대구 방탈출,<br><span style="color:#FFFBF2;-webkit-text-stroke:4px #1D1D1D;paint-order:stroke fill">어데 갈래?</span></h1>
<p style="position:absolute;left:68px;top:400px;font-weight:800;font-size:32px;color:#1D1D1D">대프리카 더위 피해서 들어갈 방, 골라 봤다 아이가 🥵</p>
<img src="../../../public/mascot.png" style="position:absolute;left:40px;top:560px;width:330px;transform:rotate(-6deg)">
<div style="position:absolute;left:64px;right:64px;top:1080px;display:grid;grid-template-columns:1fr 1fr;gap:14px">{toc}</div>
<div class="foot" style="color:#FFFBF2"><span style="font-weight:800">테마 {total}개 중에서 골랐어요 · 옆으로 넘겨 보세요 →</span><b>방탈로그</b></div></body></html>'''
    open(os.path.join(T, "dg1.html"), "w").write(s1)
    for i, (key, bg, fg, ac, chip, title, sub, fn) in enumerate(PAGES, 2):
        cards = "".join(card(t, *((t["tag"], t["line"]) if "tag" in t else fn(t))) for t in S[key])
        dark = key == "fear"
        s = HEAD + f'''<style>body{{background:{bg};color:{fg}}}</style>
<div style="position:absolute;inset:0;background-image:radial-gradient({'rgba(255,255,255,.05)' if dark else 'rgba(0,0,0,.05)'} 2px,transparent 2px);background-size:26px 26px"></div>
<div class="top"><span class="chip" style="background:{ac};color:#fff;border:4px solid {'#F5E9F0' if dark else '#1D1D1D'};padding:7px 18px;font-size:25px">{chip}</span>
<span class="chip" style="background:{'#F5E9F0' if dark else '#1D1D1D'};color:{bg};padding:7px 16px;font-size:23px">{i} / 6</span></div>
<h1 style="position:absolute;left:64px;top:130px;font-size:92px">{title}</h1>
<p style="position:absolute;right:64px;top:290px;font-weight:500;font-size:24px;opacity:.75;text-align:right">{sub}</p>
<div class="grid">{cards}</div>
<div class="foot" style="color:{fg};opacity:.85"><span style="font-weight:800;font-size:19px">{foot_note}</span><b>방탈로그</b></div></body></html>'''
        open(os.path.join(T, f"dg{i}.html"), "w").write(s)
    # 6 마무리
    s6 = HEAD + COVER.replace('fill="url(#sky)"', 'fill="url(#sky)" opacity=".9"') + f'''
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,251,242,.0),rgba(255,251,242,0) 50%)"></div>
<div class="top"><span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:8px 20px;font-size:26px">📌 저장해 두기</span>
<span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:7px 16px;font-size:23px">6 / 6</span></div>
<h1 style="position:absolute;left:64px;top:150px;font-size:96px;color:#1D1D1D">대구 테마 {total}개,<br><span style="color:#FFFBF2;-webkit-text-stroke:4px #1D1D1D;paint-order:stroke fill">다 보고 싶제?</span></h1>
<p style="position:absolute;left:68px;top:390px;font-weight:800;font-size:34px;color:#1D1D1D">단디 저장해 두고, 다녀온 방은 다이어리에 적어 두이소 📒</p>
<img src="../../../public/mascot.png" style="position:absolute;right:60px;top:520px;width:320px;transform:rotate(8deg)">
<div style="position:absolute;left:64px;right:64px;top:1060px;display:flex;flex-direction:column;gap:16px">
<div style="display:flex;gap:12px;flex-wrap:wrap">
<span class="chip" style="background:#FFFBF2;border:4px solid #1D1D1D;padding:9px 18px;font-size:25px">🔍 검색창에 "대구"</span>
<span class="chip" style="background:#FFFBF2;border:4px solid #1D1D1D;padding:9px 18px;font-size:25px">📖 줄거리·난이도·후기</span>
<span class="chip" style="background:#FFFBF2;border:4px solid #1D1D1D;padding:9px 18px;font-size:25px">🎯 취향 추천</span></div>
<div><span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:14px 28px;font-size:32px;box-shadow:6px 6px 0 #FFFBF2">프로필 링크 → bangtallog.com</span></div></div>
<div class="foot" style="color:#FFFBF2"><span style="font-weight:800">먼저 써 보고 10초 가입</span><b>방탈로그</b></div></body></html>'''
    open(os.path.join(T, "dg6.html"), "w").write(s6)
    print("dg1~6 written")

if __name__ == "__main__":
    main(sys.argv[1])
