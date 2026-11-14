"""수원편 스토리(1080×1920, 하이라이트 📍수원 용) — 매장별로 테마를 전부 싣는다(운영자 요청 11/14: 피드 16개보다 더 많이, 그림은 가려져도 됨).
장: 1 표지 · 2 상상의문 · 3 셜록홈즈 수원역 · 4 셜록홈즈 인계 + 이스케이프월드 · 5 새로 생긴 곳
꼬리표(장르 등)는 공식 페이지로 확인한 값만 넣고, 확인 못 한 테마는 이름만 적는다. 계정(@)은 확인된 것만.
사용: python3 tools/ig/region/suwon_stories.py tools/ig/region/suwon.json"""
import json, os, sys, html
T = os.path.join(os.path.dirname(__file__), "..", "templates")
e = html.escape
HEAD = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(../../../assets/fonts/SBAggroB.woff)}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:P;letter-spacing:-.02em;color:#3A2E28}
h1{font-family:A;font-weight:400;line-height:1.1}
.chip{display:inline-flex;align-items:center;border-radius:999px;font-weight:800}
.art{position:absolute;left:0;right:0;top:0;height:560px;background-size:1080px auto;background-repeat:no-repeat}
.fade{position:absolute;left:0;right:0;top:380px;height:190px}
.sec{margin-bottom:26px}
.sec h2{font-family:A;font-weight:400;font-size:40px;display:flex;align-items:baseline;gap:14px;margin-bottom:12px}
.sec h2 span{font-family:P;font-weight:800;font-size:27px;color:var(--ac)}
.rows{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.r{background:rgba(255,251,242,.97);border:3px solid #3A2E28;border-radius:14px;padding:10px 16px;box-shadow:3px 3px 0 var(--ac);min-width:0}
.r b{display:block;font-family:A;font-weight:400;font-size:27px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r i{font-style:normal;font-weight:800;font-size:19px;color:#6E5A48}
.r{color:#3A2E28}
.big .rows{grid-template-columns:1fr}.big .r{padding:26px 28px}.big .r b{font-size:56px}.big .r i{font-size:30px;display:block;margin-top:8px}.big .sec{margin-bottom:60px}.big .sec h2{font-size:52px}.big .sec h2 span{font-size:34px}
.note{position:absolute;left:64px;right:64px;top:1560px;font-size:20px;font-weight:800;opacity:.7;line-height:1.5}
.cta{position:absolute;left:0;right:0;top:1680px;text-align:center;font-weight:800;font-size:34px}
</style></head><body>'''

def page(n, bg, art, artpos, ac, chip, title, secs, note, cta="👇 눌러서 수원 테마 다 보기", fg="#3A2E28", big=False):
    body = ""
    for s in secs:
        rows = "".join(f'<div class="r"><b>{e(t["name"])}</b>' + (f'<i>{e(t["tag"])}</i>' if t.get("tag") else '<i>&nbsp;</i>') + '</div>' for t in s["themes"])
        h = e(s["title"]) + (f'<span>@{e(s["handle"])}</span>' if s.get("handle") else "")
        body += f'<div class="sec"><h2>{h}</h2><div class="rows">{rows}</div></div>'
    s = HEAD + f'''<div style="position:absolute;inset:0;background:{bg}"></div>
<div class="art" style="background-image:url(../assets/{art});background-position:{artpos}"></div>
<div class="fade" style="background:linear-gradient(rgba(0,0,0,0),{bg})"></div>
<div style="position:absolute;left:64px;right:64px;top:120px;display:flex;justify-content:space-between"><span class="chip" style="background:{ac};color:#fff;border:3px solid #3A2E28;padding:7px 20px;font-size:27px">{chip}</span><span class="chip" style="background:#3A2E28;color:#FFFBF2;padding:7px 18px;font-size:24px">📍 수원</span></div>
<h1 style="position:absolute;left:64px;right:64px;top:210px;font-size:88px;color:#3A2E28;text-shadow:none;-webkit-text-stroke:10px #FFFBF2;paint-order:stroke fill">{title}</h1>
<div style="position:absolute;left:56px;right:56px;top:590px;--ac:{ac};color:{fg}" class="{'big' if big else ''}">{body}</div>
<p class="note" style="color:{fg}">{e(note)}</p><p class="cta" style="color:{fg}">{cta}</p></body></html>'''
    open(os.path.join(T, f"sws{n}.html"), "w").write(s)

def main(p):
    c = json.load(open(p)); P = c["pages"]; chk = c["checked_on"]
    # 1 표지: 올린 피드 표지를 가운데에(예전 방식)
    import re
    s = open(os.path.join(T, "sw1.html")).read()
    m = re.search(r"body\{background:(#[0-9A-Fa-f]{6}) (url\([^)]*\)[^;]*);color:(#[0-9A-Fa-f]{6})\}", s); bg, art, fg = m.groups()
    s = s.replace(m.group(0), f"body{{background:{bg};color:{fg}}}\n.wrap{{position:absolute;left:0;top:250px;width:1080px;height:1350px;overflow:hidden;background:{bg} {art}}}")
    s = s.replace("html,body{margin:0;width:1080px;height:1350px;", "html,body{margin:0;width:1080px;height:1920px;")
    s = re.sub(r'<span class="chip"[^>]*>\d / 6</span>', "", s)
    s = re.sub(r'<div style="position:absolute;left:72px;right:72px;top:1100px;display:grid.*?</div>\s*</div>', '', s, flags=re.S)   # 피드용 목차는 뺀다
    s = re.sub(r"테마 \d+개 중에서 골랐어요 · 옆으로 넘겨 보세요 →", f"매장별 테마 {c['total']}개 · 다음 스토리로 →", s)
    s = s.replace("<body>", '<body><div class="wrap">', 1).replace("</body>", f'</div><p style="position:absolute;left:0;right:0;top:1670px;text-align:center;font-weight:800;font-size:34px;color:{fg}">👇 눌러서 수원 테마 다 보기</p></body>', 1)
    open(os.path.join(T, "sws1.html"), "w").write(s)
    for n, pg in enumerate(P, 2):
        page(n, pg["bg"], pg["art"], pg["artpos"], pg["ac"], pg["chip"], pg["title"], pg["sections"], fg=pg.get("fg", "#3A2E28"), big=pg.get("big", False), note=
             f"매장·테마는 각 매장 공식 예약 페이지 기준({chk} 확인). 장르는 공식 표기, 확인하지 못한 테마는 이름만 적었어요.")
    print(f"sws1~{len(P) + 1} written")

if __name__ == "__main__":
    main(sys.argv[1])
