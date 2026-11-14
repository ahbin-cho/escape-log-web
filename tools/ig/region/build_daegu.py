"""대구편 캐러셀 6장(사투리 제목 + 대구 풍경 + 테마별 새 그림).
사용: python3 tools/ig/region/build_daegu.py tools/ig/region/daegu.json
카드 값은 daegu.json 그대로(공식 예약 페이지로 확인한 값만 넣을 것)."""
import json, sys, os, html
sys.path.insert(0, os.path.dirname(__file__))
from daegu_art import motif, COVER, POSTER_ART

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
.grid{position:absolute;left:44px;right:44px;top:360px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.cd{background:#FFFBF2;border:4px solid #1D1D1D;border-radius:22px;overflow:hidden;box-shadow:7px 8px 0 #1D1D1D;display:flex;flex-direction:column}
.cd .art{height:208px;border-bottom:4px solid #1D1D1D;position:relative}
.cd .art svg{width:100%;height:100%;display:block}
.cd .art .tg{position:absolute;right:12px;top:12px;background:#1D1D1D;color:#fff;font-weight:800;font-size:20px;border-radius:999px;padding:5px 13px}
.cd .bd{padding:16px 20px 18px;color:#1D1D1D}
.cd .nm{font-family:A;font-size:32px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cd .q{font-weight:500;font-size:20px;color:#4A4038;line-height:1.4;margin-top:8px;height:56px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:keep-all}
.cd .cf{margin-top:10px;font-weight:800;font-size:21px;color:#1D1D1D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cd.pc{flex-direction:row;height:380px}
.po{flex:0 0 236px;background:#141414;border-right:4px solid #1D1D1D;display:flex;align-items:center;justify-content:center}
.po img{max-width:100%;max-height:100%;display:block}
.po.dr svg{width:100%;height:100%}
.pc .bd{flex:1;min-width:0;display:flex;flex-direction:column;padding:16px 18px}
.pc .nm{font-size:30px;word-break:keep-all;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-top:8px}
.pc .q{height:auto;-webkit-line-clamp:4;font-size:21px;flex:1}
.pc .cf{font-size:18px}
.tg2{align-self:flex-start;background:#1D1D1D;color:#fff;font-weight:800;font-size:17px;border-radius:999px;padding:4px 11px}
.foot{position:absolute;left:64px;right:64px;bottom:40px;display:flex;justify-content:space-between;align-items:baseline;font-size:21px}
.foot b{font-family:A;font-weight:400;font-size:26px}
</style></head><body>'''

def q(s, n=40):
    s = (s or "").strip().strip('"“”\'')
    return s if len(s) <= n else s[:n].rstrip() + "…"

POSTERS = {}  # 테마 이름 → 공식 포스터 파일(원본 그대로, 자르지 않고 작게). 셜록홈즈는 새 그림 유지
NO_POSTER_BRANDS = ("셜록홈즈",)

SHORT_CAFE = {"서울이스케이프룸 대구 동성로점": "서울이스케이프룸 동성로", "서울이스케이프룸 대구 리틀보이": "서울이스케이프룸 리틀보이",
              "지구별방탈출 대구점": "지구별방탈출 대구", "셜록홈즈 대구동성로점": "셜록홈즈 동성로"}

def card(t, tag, line):
    tag = t.get("tag", tag); line = t.get("line", line)
    t = dict(t, cafe=SHORT_CAFE.get(t["cafe"], t["cafe"]), _cafe=t["cafe"])
    pf = POSTERS.get(t["name"])
    if pf and not t["_cafe"].startswith(NO_POSTER_BRANDS):
        return f'''<div class="cd pc"><div class="po"><img src="file://{pf}"></div>
<div class="bd"><span class="tg2">{e(tag)}</span><div class="nm">{e(t.get("short") or t["name"])}</div><div class="q">{e(line)}</div><div class="cf">📍 {e(t["cafe"])}</div></div></div>'''
    if POSTERS:
        return f'''<div class="cd pc"><div class="po dr">{POSTER_ART.get(t["name"]) or motif(t["name"], t["genre"])}</div>
<div class="bd"><span class="tg2">{e(tag)}</span><div class="nm">{e(t.get("short") or t["name"])}</div><div class="q">{e(line)}</div><div class="cf">📍 {e(t["cafe"])}</div></div></div>'''
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

FAN = ["우리 아빠", "춘단화 : 봄을 잘라낸 꽃", "만월 <<꿈을 훔치는 요괴>>", "박스오피스", "잉카", "오모테나시"]

ROW = ["너의 겨울은 가고, 봄은 온다", "접견", "단디해라", "사명 : 투쟁의 노래", "만찬", "신스틸러"]

def row():
    fs = [POSTERS[n] for n in ROW if n in POSTERS]
    if not fs: return ""
    out = "".join(f'<img src="file://{f}" style="position:absolute;left:{40 + i * 168}px;top:{560 + (i % 2) * 40}px;width:190px;border:5px solid #1D1D1D;border-radius:10px;background:#111;box-shadow:6px 8px 0 rgba(0,0,0,.3);transform:rotate({(-4 if i % 2 else 4)}deg)">' for i, f in enumerate(fs))
    return out + '<p style="position:absolute;right:64px;top:1010px;font-size:17px;font-weight:800;color:#FFFBF2;opacity:.85">포스터: 지구별방탈출 · 서울이스케이프룸 공식 홈페이지</p>'

def fan():
    fs = [POSTERS[n] for n in FAN if n in POSTERS]
    if not fs: return ""
    out = []
    k = len(fs)
    for i, f in enumerate(fs):
        a = (i - (k - 1) / 2) * 7
        x = 540 + (i - (k - 1) / 2) * 120 - 120
        y = 520 + abs(i - (k - 1) / 2) * 22
        out.append(f'<img src="file://{f}" style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;width:240px;border:5px solid #1D1D1D;border-radius:10px;box-shadow:8px 10px 0 rgba(0,0,0,.35);transform:rotate({a:.1f}deg);background:#111;z-index:{3 + i}">')
    return "".join(out) + '<p style="position:absolute;right:64px;top:1030px;font-size:17px;font-weight:800;color:#FFFBF2;opacity:.85;z-index:9">포스터: 지구별방탈출 · 서울이스케이프룸 공식 홈페이지</p>'

def credit(ts):
    b = sorted({t["cafe"].split()[0] for t in ts if POSTERS.get(t["name"]) and not t["cafe"].startswith(NO_POSTER_BRANDS)})
    return f'<p style="position:absolute;left:64px;right:64px;top:1250px;font-size:18px;font-weight:800;opacity:.7">포스터: {" · ".join(b)} 공식 홈페이지{" · 셜록홈즈는 방탈로그가 새로 그린 그림" if any(t["cafe"].startswith(NO_POSTER_BRANDS) for t in ts) else ""}</p>' if b else ""

def main(p, posters=None):
    if posters: POSTERS.update(json.load(open(posters)))
    c = json.load(open(p)); S = c["sections"]; total = c["total"]; chk = c.get("checked_on", "")
    foot_note = f"정보는 매장 공식 예약 페이지 기준{(' · ' + chk + ' 확인') if chk else ''}" + ("" if POSTERS else " · 그림은 방탈로그가 새로 그렸어요")
    # 1 표지
    toc = "".join(f'<div style="background:#FFFBF2;border:4px solid #1D1D1D;border-radius:18px;padding:12px 18px;font-weight:800;font-size:26px;box-shadow:4px 5px 0 #1D1D1D">{x}</div>'
                  for x in ["2 😱 쫄깃한 거 좋아하나?", "3 🌿 무서븐 건 싫나?", "4 🐣 방탈출 처음이가?", "5 📖 이야기 좋아하제?"])
    cov = (COVER[:COVER.index('<path d="M0 820')] + '<path d="M0 1060q260-40 540-10t540-10V1350H0z" fill="#B8463C"/></svg>') if POSTERS else COVER
    s1 = HEAD + '<img src="../assets/dg-deco.jpg" style="position:absolute;inset:0;width:1080px;height:1350px">' + f'''
<div class="top"><span class="chip" style="background:#FFFBF2;border:4px solid #1D1D1D;padding:8px 20px;font-size:26px">📍 대구 방탈출 · 동성로</span>
<span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:7px 16px;font-size:23px">1 / 6</span></div>
<h1 style="position:absolute;left:64px;top:140px;font-size:110px;color:#FFF3DA;-webkit-text-stroke:10px #1D1D1D;paint-order:stroke fill;text-shadow:0 8px 0 rgba(0,0,0,.25)">대구 방탈출,<br><span style="color:#FFD25A">어데 갈래?</span></h1>
<p style="position:absolute;left:68px;top:405px;font-weight:800;font-size:31px;color:#FFF3DA;text-shadow:0 2px 8px rgba(0,0,0,.6)">대프리카 더위 피해서 들어갈 방, 골라 봤다 아이가 🥵</p>
<img src="../../../public/mascot.png" style="position:absolute;left:470px;top:930px;width:150px;transform:rotate(-6deg);z-index:5">
<div style="position:absolute;left:64px;right:64px;top:1100px;display:grid;grid-template-columns:1fr 1fr;gap:14px">{toc}</div>
<div class="foot" style="color:#FFFBF2;bottom:44px"><span style="font-weight:800;text-shadow:0 2px 6px rgba(0,0,0,.6)">테마 {total}개 중에서 골랐어요 · 옆으로 넘겨 보세요 → · 그림: 방탈로그</span><b>방탈로그</b></div></body></html>'''
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
<div class="grid">{cards}</div>{credit(S[key])}
<div class="foot" style="color:{fg};opacity:.85"><span style="font-weight:800;font-size:19px">{foot_note}</span><b>방탈로그</b></div></body></html>'''
        open(os.path.join(T, f"dg{i}.html"), "w").write(s)
    # 6 마무리
    s6 = HEAD + '<img src="../assets/dg-deco.jpg" style="position:absolute;inset:0;width:1080px;height:1350px"><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,10,34,.15),rgba(20,10,34,.05) 40%,rgba(20,10,34,.55))"></div>' + row() + f'''
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,251,242,.0),rgba(255,251,242,0) 50%)"></div>
<div class="top"><span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:8px 20px;font-size:26px">📌 저장해 두기</span>
<span class="chip" style="background:#1D1D1D;color:#FFE27A;padding:7px 16px;font-size:23px">6 / 6</span></div>
<h1 style="position:absolute;left:64px;top:140px;font-size:100px;color:#FFF3DA;-webkit-text-stroke:10px #1D1D1D;paint-order:stroke fill">대구 테마 {total}개,<br><span style="color:#FFD25A">다 보고 싶제?</span></h1>
<p style="position:absolute;left:68px;top:395px;font-weight:800;font-size:32px;color:#FFF3DA;text-shadow:0 2px 8px rgba(0,0,0,.6)">단디 저장해 두고, 다녀온 방은 다이어리에 적어 두이소 📒</p>
<img src="../../../public/mascot.png" style="position:absolute;right:40px;top:{'860' if POSTERS else '520'}px;width:{'200' if POSTERS else '320'}px;transform:rotate(8deg);z-index:5">
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
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
