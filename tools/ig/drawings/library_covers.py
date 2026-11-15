"""운영자 기록 캐러셀(서재·달력·리뷰 시트)의 탈깍.로그 표지 — 책 표지처럼 글자 중심으로.
공식 포스터를 못 쓰는 방(키이스케이프처럼 조심할 곳, 포스터 주소에 접속이 안 되는 곳)에 쓴다.
짠해는 공식 포스터(넥스트에디션)를 그대로 쓴다.

python3 tools/ig/drawings/library_covers.py  → tools/ig/templates/_cover-*.html 을 만들고
node tools/ig/render.cjs 로 tools/ig/assets/cover-*.jpg (400×600) 로 굽는다.
"""
import json
import os
import subprocess

ROOT = os.path.join(os.path.dirname(__file__), "..")
T = os.path.join(ROOT, "templates")
A = os.path.join(ROOT, "assets")

# 이름, 파일, 매장, 바탕, 강조, 무늬(선 그림 · 120×120 안)
EMB = {
    "crown": '<path d="M20 86 L28 40 L46 62 L60 28 L74 62 L92 40 L100 86 Z"/><path d="M20 98 H100"/><circle cx="60" cy="20" r="4"/>',
    "sun": '<circle cx="60" cy="52" r="20"/><path d="M8 84 H112"/><path d="M22 96 H98" opacity=".6"/><path d="M38 108 H82" opacity=".35"/><path d="M60 22 V12 M34 30 l-7 -7 M86 30 l7 -7"/>',
    "clock": '<circle cx="60" cy="60" r="42"/><circle cx="60" cy="60" r="34" opacity=".4"/><path d="M60 32 V60 L80 72"/><circle cx="60" cy="60" r="3"/>',
    "door": '<rect x="34" y="18" width="52" height="88" rx="26"/><path d="M34 44 H86" opacity=".5"/><circle cx="74" cy="66" r="3.5"/><path d="M14 106 H106"/>',
    "film": '<rect x="18" y="26" width="84" height="68" rx="4"/><path d="M18 40 H102 M18 80 H102" opacity=".5"/><path d="M30 26 V40 M46 26 V40 M62 26 V40 M78 26 V40 M94 26 V40 M30 80 V94 M46 80 V94 M62 80 V94 M78 80 V94 M94 80 V94" opacity=".5"/><path d="M52 50 L72 60 L52 70 Z"/>',
    "bulb": '<path d="M60 18 C38 18 26 34 26 50 C26 66 38 72 42 86 H78 C82 72 94 66 94 50 C94 34 82 18 60 18 Z"/><path d="M46 96 H74 M50 106 H70"/><path d="M52 60 L60 48 L68 60" opacity=".7"/>',
}
COVERS = [
    ("시크릿 왕국의 스캔들", "(감독판)", "secret", "상상의문", "#4A1622", "#E3B862", "crown"),
    ("here i am", "", "here", "상상의문", "#0F3B44", "#F2C879", "sun"),
    ("memory of tony", "", "tony", "키이스케이프 에버랜드", "#3B2416", "#E9A86B", "clock"),
    ("메모리컴퍼니", "", "memoryco", "키이스케이프", "#173A2E", "#9FD3A8", "door"),
    ("FILM BY BOB", "", "bob", "키이스케이프 메모리컴퍼니", "#1E1E24", "#F2B33D", "film"),
    ("imagine", "", "imagine", "", "#2B2A55", "#F7D774", "bulb"),
]

HTML = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:M;src:url(../assets/fonts/nanum-myeongjo-korean-800-normal.woff2);font-weight:800}}
@font-face{{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}}
*{{margin:0;box-sizing:border-box}}
html,body{{width:400px;height:600px;overflow:hidden;background:{bg}}}
.c{{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 30%,rgba(255,255,255,.10),transparent 60%),linear-gradient(180deg,transparent 60%,rgba(0,0,0,.28))}}
.f{{position:absolute;inset:18px;border:1.5px solid {ac}66;border-radius:6px}}
.f2{{position:absolute;inset:26px;border:1px solid {ac}33;border-radius:3px}}
.k{{position:absolute;left:0;right:0;top:52px;text-align:center;font:500 13px P;letter-spacing:.42em;color:{ac}cc}}
.e{{position:absolute;left:50%;top:128px;width:150px;height:150px;transform:translateX(-50%)}}
.e svg{{width:100%;height:100%;fill:none;stroke:{ac};stroke-width:3;stroke-linecap:round;stroke-linejoin:round}}
.r{{position:absolute;left:150px;right:150px;top:316px;height:1.5px;background:{ac}88}}
.t{{position:absolute;left:36px;right:36px;top:340px;text-align:center;font:800 {fs}px/1.12 M;color:#F6EEDC;letter-spacing:-.02em;word-break:keep-all}}
.t small{{display:block;font-size:22px;margin-top:8px;color:{ac}}}
.s{{position:absolute;left:0;right:0;bottom:48px;text-align:center;font:500 14px P;letter-spacing:.18em;color:#F6EEDCaa}}
.g{{position:absolute;inset:0;opacity:.16;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}}
</style></head><body><div class="c"></div><div class="f"></div><div class="f2"></div>
<div class="k">TALKKAK.LOG</div>
<div class="e"><svg viewBox="0 0 120 120">{emb}</svg></div>
<div class="r"></div>
<div class="t">{title}{sub}</div>
<div class="s">{store}</div>
<div class="g"></div></body></html>"""

jobs = []
for title, sub, key, store, bg, ac, emb in COVERS:
    fs = 50 if len(title) <= 8 else 42 if len(title) <= 12 else 38
    html = HTML.format(bg=bg, ac=ac, emb=EMB[emb], title=title, sub=f"<small>{sub}</small>" if sub else "", store=store, fs=fs)
    p = os.path.join(T, f"_cover-{key}.html")
    open(p, "w").write(html)
    jobs.append({"html": p, "out": os.path.join(A, f"cover-{key}.jpg"), "w": 400, "h": 600})
jf = os.path.join(T, "_covers.json")
json.dump(jobs, open(jf, "w"))
subprocess.run(["node", os.path.join(ROOT, "render.cjs"), jf], check=True)
print("ok", len(jobs))
