"""지역 모음 캐러셀(6장) 만들기 — 수원편(sw1~6) 틀을 복사해 다른 지역으로.
사용: python3 tools/ig/region/build.py tools/ig/region/<지역>.json
JSON: {"area":"대구","prefix":"dg","total":45,
       "art":{"cover":"dg-cover.jpg","fear":"sw-fear.jpg",...}  (tools/ig/assets 안 파일),
       "sections":{"fear":[{name,cafe,story,fear}], "calm":[{name,cafe,genre,difficulty}],
                   "first":[{name,cafe,difficulty,time,players}], "story":[{name,cafe,story,genre}]}}
카드 내용은 공식 페이지로 확인한 값만 넣는다(확인 기록은 JSON 의 "checked" 에).
"""
import json, re, sys, html, os

T = os.path.join(os.path.dirname(__file__), "..", "templates")
e = html.escape
GRID = re.compile(r'<div style="position:absolute;left:60px;right:60px;top:\d+px;display:grid.*?(?=\n<div style="position:absolute;left:72px;right:72px;top:1290px)', re.S)

def q(s, n=34):
    s = s.strip().strip('"“”\'')
    return s if len(s) <= n else s[:n].rstrip() + "…"

def fear_card(t):
    return f'''<div style="min-width:0;background:rgba(255,248,250,.97);border:3px solid #1E1630;border-radius:18px;padding:13px 18px;box-shadow:4px 4px 0 #E2603F">
<div style="font-family:A;font-size:27px;color:#1E1630;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{e(t["name"])}</div>
<div style="font-weight:500;font-size:18px;color:#3A2E4A;line-height:1.4;margin-top:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:50px;word-break:keep-all">“{e(q(t["story"], 40))}”</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><span style="font-weight:800;font-size:21px;color:#1E1630;background:#FFE7A3;border:2px solid #1E1630;border-radius:999px;padding:2px 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:330px">📍 {e(t["cafe"])}</span><span style="font-weight:800;font-size:16px;color:#fff;background:#E2603F;border-radius:999px;padding:2px 11px;white-space:nowrap">매운맛 {t["fear"]}/5</span></div></div>'''

def simple(t, tag, quote=None):
    qq = f'<div class="q">“{e(q(quote))}”</div>' if quote else ""
    return f'<div class="card"><div class="nm">{e(t["name"])}</div>{qq}<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px"><div class="cf">📍 {e(t["cafe"])}</div><span class="tg">{e(tag)}</span></div></div>'

def first_tag(t):
    parts = [f'난이도 {t["difficulty"]}']
    if t.get("time"): parts.append(f'{t["time"]}분')
    if t.get("players"): parts.append(f'{t["players"]}인')
    return " · ".join(parts)

def main(cfg_path):
    c = json.load(open(cfg_path)); A = c["area"]; P = c["prefix"]; S = c["sections"]; art = c["art"]
    def page(src, dst, key, grid_html, top, extra=lambda s: s):
        s = open(os.path.join(T, src)).read()
        s = s.replace("../assets/sw-" + key + ".jpg", "../assets/" + art[key])
        s = s.replace("수원", A)
        if grid_html is not None:
            s = GRID.sub(f'<div style="position:absolute;left:60px;right:60px;top:{top}px;display:grid;grid-template-columns:1fr 1fr;gap:14px">{grid_html}</div>', s, count=1)
        s = extra(s)
        open(os.path.join(T, f"{P}{dst}.html"), "w").write(s); print("wrote", f"{P}{dst}.html")
    total = str(c["total"])
    page("sw1.html", 1, "cover", None, 0, lambda s: re.sub(r"테마 \d+개", f"테마 {total}개", s))
    page("sw2.html", 2, "fear", "".join(fear_card(t) for t in S["fear"]), 948)
    page("sw3.html", 3, "calm", "".join(simple(t, f'{t["genre"]} · 난이도 {t["difficulty"]}') for t in S["calm"]), 1040)
    page("sw4.html", 4, "first", "".join(simple(t, first_tag(t)) for t in S["first"]), 1040)
    page("sw5.html", 5, "story", "".join(simple(t, t["genre"], t["story"]) for t in S["story"]), 968)
    page("sw6.html", 6, "end", None, 0, lambda s: re.sub(r"테마 \d+개", f"테마 {total}개", s))

if __name__ == "__main__":
    main(sys.argv[1])
