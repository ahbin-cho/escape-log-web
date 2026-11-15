"""비공식클래스(SPORTS CENTER) 2차 티켓 오픈 — 스토리 3장 + 피드 캐러셀 3장.

공식 포스터 분위기(핏빛 폭풍 구름 · 붉은 달 · 붉은 번개 · 앙상한 나무 · 붉게 불 켜진 체육관 ·
젖은 바닥 반사 · 안개 · K 가죽 가방)를 SVG 로 새로 그린다. 포스터를 베끼지 않는다.
공식 포스터 원본은 피드 2장째에만 작게(출처 표기) 쓴다.

정보 출처
- NOL 티켓 상품 상세(운영자 캡처 11/15): 11.26~12.27 · 목·금 22:30 / 토·일 18:30, 21:30 · 85분 · 만 16세 이상
  · 55,000원 · NOL 단독 · 프리쇼 20분 전 · 드레스 코드 교복
- NOL 달력(운영자 캡처 11/15): 12/13까지 열린 회차 전석 0, 12/14 이후는 아직 안 열림
- 2차 티켓 11/30(월) 12:00 · 1차 3초 매진: 보도자료(전자신문 11/13) → 카드에 '보도자료 기준' 표기

python3 tools/ig/drawings/klass_pages.py  → tools/ig/templates/tk-klass-{d7,d1,day}.html, klass-f{1,2,3}.html
"""
import math
import os
import random

T = os.path.join(os.path.dirname(__file__), "..", "templates")

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
@font-face{font-family:M;src:url(../assets/fonts/nanum-myeongjo-korean-800-normal.woff2);font-weight:800}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden;font-family:P;color:#EFE7DC;background:#04050A}
.a{position:absolute}
.kick{font-family:M;font-weight:800;font-size:26px;letter-spacing:.42em;color:#D9C7A6;display:flex;align-items:center;gap:22px;white-space:nowrap}
.kick:before,.kick:after{content:"";flex:1;height:2px;background:linear-gradient(90deg,transparent,#D9C7A6aa)}
.kick:after{background:linear-gradient(90deg,#D9C7A6aa,transparent)}
.ttl{font-family:M;font-weight:800;letter-spacing:-.04em;line-height:1.14;
  background:linear-gradient(180deg,#FFFFFF 0%%,#E9E1E1 38%%,#B9AAAA 52%%,#E3D7D7 70%%,#9B8E8E 100%%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 4px 0 #3A0508) drop-shadow(0 0 26px rgba(200,20,30,.55))}
.ttl em{font-style:normal;background:linear-gradient(180deg,#FF6A6A,#D4141E 55%%,#7E060C);-webkit-background-clip:text;background-clip:text}
.red{color:#FF4A4F}
.big{font-family:M;font-weight:800;letter-spacing:-.02em;color:#FF3B42;text-shadow:0 0 30px rgba(255,40,50,.6),0 3px 0 #3A0508}
.body{font-weight:500;color:#EFE7DC;line-height:1.6;word-break:keep-all}
.note{font-weight:500;font-size:22px;line-height:1.55;color:#EFE7DC;opacity:.62;word-break:keep-all}
.foot{display:flex;justify-content:space-between;font-size:21px;letter-spacing:.22em;opacity:.55}
.plate{background:rgba(6,6,12,.62);border:1.5px solid rgba(217,199,166,.35);border-radius:6px;backdrop-filter:blur(3px)}
.vig{inset:0;background:radial-gradient(ellipse at 50%% 45%%,transparent 35%%,rgba(0,0,0,.82) 100%%);pointer-events:none}
.grain{inset:0;opacity:.2;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%%3E%%3Cfilter id='n'%%3E%%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%%3E%%3C/filter%%3E%%3Crect width='100%%25' height='100%%25' filter='url(%%23n)'/%%3E%%3C/svg%%3E")}
</style></head><body>
"""


def branches(rng, x, y, ang, ln, w, depth, out):
    if depth == 0 or ln < 6:
        return
    x2 = x + math.cos(ang) * ln
    y2 = y + math.sin(ang) * ln
    cx = (x + x2) / 2 + rng.uniform(-ln, ln) * 0.15
    cy = (y + y2) / 2 + rng.uniform(-ln, ln) * 0.15
    out.append(f'<path d="M{x:.0f} {y:.0f} Q{cx:.0f} {cy:.0f} {x2:.0f} {y2:.0f}" stroke-width="{w:.1f}"/>')
    n = 2 if depth > 2 else rng.choice([2, 3])
    for _ in range(n):
        branches(rng, x2, y2, ang + rng.uniform(-0.75, 0.75), ln * rng.uniform(0.62, 0.8), w * 0.66, depth - 1, out)


def tree(seed, x, y, ang, ln, w):
    rng = random.Random(seed)
    out = []
    branches(rng, x, y, ang, ln, w, 8, out)
    return '<g stroke="#020205" fill="none" stroke-linecap="round">' + "".join(out) + "</g>"


def lightning(seed, x, y, length, spread):
    rng = random.Random(seed)
    pts = [(x, y)]
    cx, cy = x, y
    while cy < y + length:
        cx += rng.uniform(-spread, spread)
        cy += rng.uniform(26, 60)
        pts.append((cx, cy))
    d = "M" + " L".join(f"{a:.0f} {b:.0f}" for a, b in pts)
    forks = []
    for i in range(2, len(pts) - 2, 3):
        fx, fy = pts[i]
        q = [(fx, fy)]
        for _ in range(rng.randint(2, 4)):
            fx += rng.uniform(10, 40) * rng.choice([-1, 1])
            fy += rng.uniform(20, 45)
            q.append((fx, fy))
        forks.append("M" + " L".join(f"{a:.0f} {b:.0f}" for a, b in q))
    return d, forks


def building(gx, gy, s):
    """gx: 왼쪽 끝, gy: 땅 높이, s: 배율. 왼쪽은 유리 정면 건물, 오른쪽은 둥근 체육관."""
    p = []
    W = lambda v: gx + v * s
    H = lambda v: gy - v * s
    # 왼쪽 별관(옥상 구조물)
    p.append(f'<rect x="{W(0)}" y="{H(300)}" width="{70*s}" height="{300*s}" fill="url(#concrete)"/>')
    p.append(f'<rect x="{W(60)}" y="{H(360)}" width="{300*s}" height="{360*s}" fill="url(#concrete)"/>')
    p.append(f'<rect x="{W(90)}" y="{H(395)}" width="{60*s}" height="{36*s}" fill="#1A1C22"/>')
    p.append(f'<rect x="{W(240)}" y="{H(380)}" width="{40*s}" height="{20*s}" fill="#1A1C22"/>')
    # 유리 정면 — 붉은 불빛
    gx0, gw, gh = W(85), 175 * s, 300 * s
    p.append(f'<rect x="{gx0}" y="{H(300)}" width="{gw}" height="{gh}" fill="url(#redglass)"/>')
    for i in range(1, 6):
        p.append(f'<line x1="{gx0 + gw*i/6}" y1="{H(300)}" x2="{gx0 + gw*i/6}" y2="{gy}" stroke="#14080A" stroke-width="{3*s}"/>')
    for j in range(1, 6):
        p.append(f'<line x1="{gx0}" y1="{H(300) + gh*j/6}" x2="{gx0+gw}" y2="{H(300) + gh*j/6}" stroke="#14080A" stroke-width="{2.5*s}"/>')
    # 유리창 안 사람 실루엣(한 명)
    p.append(f'<g fill="#140405" opacity=".9"><circle cx="{W(175)}" cy="{H(216)}" r="{7*s}"/><path d="M{W(166)} {H(165)} Q{W(175)} {H(212)} {W(184)} {H(165)}Z"/></g>')
    # 오른쪽 위층 작은 창
    for r in range(3):
        for c in range(3):
            lit = (r + c) % 3 == 0
            p.append(f'<rect x="{W(285 + c*22)}" y="{H(330 - r*70)}" width="{12*s}" height="{20*s}" fill="{"#B3121C" if lit else "#0C0D12"}" opacity="{.9 if lit else 1}"/>')
    # 둥근 체육관
    p.append(f'<path d="M{W(330)} {gy} V{H(250)} Q{W(330)} {H(270)} {W(360)} {H(272)} L{W(900)} {H(272)} Q{W(930)} {H(268)} {W(930)} {H(240)} V{gy}Z" fill="url(#concrete2)"/>')
    p.append(f'<rect x="{W(330)}" y="{H(272)}" width="{600*s}" height="{6*s}" fill="#2A2D35"/>')
    # 체육관 붉은 창(아래 띠)
    for c in range(9):
        p.append(f'<rect x="{W(380 + c*58)}" y="{H(95)}" width="{34*s}" height="{70*s}" fill="#9E0F18" opacity="{.55 + (c%3)*.15:.2f}"/>')
    for c in range(6):
        p.append(f'<rect x="{W(400 + c*85)}" y="{H(200)}" width="{24*s}" height="{18*s}" fill="#0A0B10"/>')
    # 입구 캐노피
    p.append(f'<path d="M{W(470)} {H(120)} Q{W(540)} {H(150)} {W(610)} {H(120)} V{H(110)} H{W(470)}Z" fill="#202229"/>')
    p.append(f'<rect x="{W(490)}" y="{H(110)}" width="{100*s}" height="{110*s}" fill="url(#door)"/>')
    p.append(f'<rect x="{W(470)}" y="{H(140)}" width="{140*s}" height="{140*s}" fill="#FF2630" opacity=".25" filter="url(#glow)"/>')
    return "".join(p)


def briefcase(x, y, s):
    return f"""<g transform="translate({x} {y}) scale({s})">
<ellipse cx="110" cy="152" rx="130" ry="14" fill="#000" opacity=".7"/>
<path d="M78 10 Q78 -8 110 -8 Q142 -8 142 10" stroke="#1B1310" stroke-width="10" fill="none"/>
<rect x="0" y="10" width="220" height="140" rx="12" fill="url(#leather)" stroke="#0B0705" stroke-width="3"/>
<rect x="8" y="38" width="204" height="4" fill="#0B0705" opacity=".6"/>
<rect x="30" y="28" width="16" height="22" rx="3" fill="#6B5634"/><rect x="174" y="28" width="16" height="22" rx="3" fill="#6B5634"/>
<text x="110" y="120" text-anchor="middle" font-family="M" font-weight="800" font-size="62" fill="#8C7445" opacity=".9">K</text>
</g>"""


def scene(w, h, ground, moon=(0.83, 0.1), bolt_x=0.8, bscale=1.0, seed=3, case_y=None):
    """ground: 땅 높이(px). 위쪽은 하늘·구름, 아래는 젖은 바닥."""
    d, forks = lightning(seed, w * bolt_x, h * 0.12, ground - h * 0.18, 34)
    bx = (w - 930 * bscale) / 2 - 40 * bscale
    bld = building(bx, ground, bscale)
    mx, my = w * moon[0], h * moon[1]
    return f"""<svg class="a" style="inset:0" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060F"/><stop offset=".35" stop-color="#0B1129"/><stop offset=".62" stop-color="#170A14"/><stop offset="1" stop-color="#05050A"/></linearGradient>
 <radialGradient id="redmask" cx=".66" cy=".22" r=".62"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <radialGradient id="bluemask" cx=".1" cy=".3" r=".55"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <mask id="mr"><rect width="{w}" height="{ground}" fill="url(#redmask)"/></mask>
 <mask id="mb"><rect width="{w}" height="{ground}" fill="url(#bluemask)"/></mask>
 <filter id="cloudR" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0045 .007" numOctaves="5" seed="{seed+4}"/><feColorMatrix values="0 0 0 0 .78  0 0 0 0 .05  0 0 0 0 .08  0 0 0 2.4 -1.05"/></filter>
 <filter id="cloudD" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .01" numOctaves="5" seed="{seed+9}"/><feColorMatrix values="0 0 0 0 .01  0 0 0 0 .01  0 0 0 0 .02  0 0 0 2.2 -.95"/></filter>
 <filter id="cloudB" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".005 .009" numOctaves="4" seed="{seed+1}"/><feColorMatrix values="0 0 0 0 .14  0 0 0 0 .2  0 0 0 0 .45  0 0 0 2 -.9"/></filter>
 <filter id="fog" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".003 .02" numOctaves="4" seed="{seed+2}"/><feColorMatrix values="0 0 0 0 .6  0 0 0 0 .62  0 0 0 0 .72  0 0 0 1.6 -.75"/><feGaussianBlur stdDeviation="5"/></filter>
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
 <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
 <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
 <filter id="ripple" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".002 .09" numOctaves="2" seed="{seed}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="26" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="2.5"/></filter>
 <linearGradient id="concrete" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3D45"/><stop offset=".6" stop-color="#24262D"/><stop offset="1" stop-color="#121318"/></linearGradient>
 <linearGradient id="concrete2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2C2F37"/><stop offset=".5" stop-color="#3A3D46"/><stop offset="1" stop-color="#1B1D23"/></linearGradient>
 <linearGradient id="redglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A0A10"/><stop offset=".5" stop-color="#A3121C"/><stop offset="1" stop-color="#E0222C"/></linearGradient>
 <linearGradient id="door" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A0C14"/><stop offset="1" stop-color="#FF3A40"/></linearGradient>
 <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A22"/><stop offset="1" stop-color="#15100D"/></linearGradient>
 <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0E14"/><stop offset="1" stop-color="#030305"/></linearGradient>
 <radialGradient id="moonG" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#FF5A5E"/><stop offset=".7" stop-color="#C1121C"/><stop offset="1" stop-color="#6E060C"/></radialGradient>
</defs>
<rect width="{w}" height="{h}" fill="url(#sky)"/>
<rect width="{w}" height="{ground}" filter="url(#cloudB)" mask="url(#mb)" opacity=".9"/>
<rect width="{w}" height="{ground}" filter="url(#cloudR)" mask="url(#mr)"/>
<rect width="{w}" height="{ground}" filter="url(#cloudD)" opacity=".8"/>
<circle cx="{mx}" cy="{my}" r="{w*0.11}" fill="#FF2A33" opacity=".45" filter="url(#glow)"/>
<circle cx="{mx}" cy="{my}" r="{w*0.055}" fill="url(#moonG)"/>
<g opacity=".95"><path d="{d}" stroke="#FF2530" stroke-width="14" fill="none" opacity=".5" filter="url(#glow2)"/>
{''.join(f'<path d="{f}" stroke="#FF6B70" stroke-width="2" fill="none" opacity=".8"/>' for f in forks)}
<path d="{d}" stroke="#FFE0E2" stroke-width="3" fill="none"/></g>
<g>{bld}</g>
<rect y="{ground}" width="{w}" height="{h-ground}" fill="url(#floor)"/>
<g transform="translate(0 {2*ground}) scale(1 -1)" opacity=".38" filter="url(#ripple)">{bld}</g>
<rect y="{ground}" width="{w}" height="{h-ground}" fill="#000" opacity=".25"/>
<rect y="{ground-140}" width="{w}" height="300" filter="url(#fog)" opacity=".55"/>
{tree(seed+20, -20, ground*0.62, -0.95, 210, 22)}
{tree(seed+21, w+20, ground*0.55, -2.2, 230, 24)}
{tree(seed+22, -40, h*0.05, 0.35, 160, 16)}
{tree(seed+23, w+30, h*0.02, 2.75, 170, 16)}
{briefcase(w*0.05, case_y if case_y is not None else ground + (h-ground)*0.18, w/1080*0.95)}
</svg>"""


FOOT = """<div class="a foot" style="left:72px;right:72px;bottom:%dpx"><span>BANGTALLOG · IMMERSIVE</span><span>@bangtal_log</span></div>
<div class="a vig"></div><div class="a grain"></div></body></html>"""

INFO = "11.26–12.27 · KBS스포츠월드 생활체육관 · 85분 · 만 16세 이상 · 55,000원"
SRC = "2차 오픈 일시는 보도자료 기준이라 NOL 공지에서 한 번 더 확인해 주세요 · 배경 그림은 공식 포스터 분위기로 새로 그렸어요"


def story(name, kick, title, when, sub):
    w, h = 1080, 1920
    s = HEAD % {"w": w, "h": h}
    s += scene(w, h, ground=1180, moon=(0.82, 0.08), bolt_x=0.74, bscale=1.08, seed=3, case_y=1100)
    s += f"""
<div class="a kick" style="left:72px;right:72px;top:150px">{kick}</div>
<div class="a ttl" style="left:60px;right:60px;top:220px;font-size:108px;text-align:center">{title}</div>
<div class="a plate" style="left:72px;right:72px;top:1300px;padding:30px 40px 28px">
  <div style="font-family:M;font-weight:800;font-size:30px;letter-spacing:.3em;color:#D9C7A6">UNOFFICIAL KLASS · SPORTS CENTER</div>
  <div style="font-family:M;font-weight:800;font-size:58px;margin-top:6px">비공식클래스 <span style="font-size:36px;opacity:.8">기억표백의 진실편</span></div>
  <div class="big" style="font-size:104px;margin-top:6px">{when}</div>
  <div class="body" style="font-size:30px;margin-top:4px">{sub}</div>
  <div class="note" style="margin-top:14px">{INFO}</div>
</div>
<div class="a note" style="left:72px;right:72px;bottom:150px;font-size:19px;text-align:center">{SRC}</div>
"""
    s += FOOT % 92
    open(os.path.join(T, name), "w").write(s)


def feed(name, body, ground=900, seed=5, bscale=0.98, moon=(0.84, 0.09), case_y=None):
    w, h = 1080, 1350
    s = HEAD % {"w": w, "h": h}
    s += scene(w, h, ground=ground, moon=moon, bolt_x=0.76, bscale=bscale, seed=seed, case_y=case_y)
    s += body
    s += FOOT % 54
    open(os.path.join(T, name), "w").write(s)


story("tk-klass-d7.html", "D-7 · 2차 티켓 오픈", "다음 주 월요일,<br><em>신입 탐정</em> 2차 모집",
      "11.30 (월) 12:00", "NOL 티켓 단독 · 1차는 3초 만에 매진 · 미리 NOL 로그인·알림받기")
story("tk-klass-d1.html", "D-1 · 2차 티켓 오픈", "내일 낮 12시,<br>탐정 명단이<br><em>다시 열린다</em>",
      "내일 12:00", "NOL 티켓 단독 · 로그인·본인인증은 오늘 밤에 미리")
story("tk-klass-day.html", "D-DAY · 2차 티켓 오픈", "오늘 낮 12시,<br><em>2차 티켓</em> 오픈",
      "오늘 12:00", "NOL 티켓 단독 · 11:55 에 앱 켜 두기")

# 피드 1: 표지
feed("klass-f1.html", f"""
<div class="a kick" style="left:72px;right:72px;top:96px">UNOFFICIAL KLASS · SPORTS CENTER</div>
<div class="a ttl" style="left:50px;right:50px;top:150px;font-size:98px;text-align:center">3초 만에 매진된<br><em>고교 탐정</em> 이머시브</div>
<div class="a plate" style="left:72px;right:72px;top:975px;padding:22px 36px;text-align:center">
  <div class="body" style="font-size:30px">비공식클래스 · 기억표백의 진실편</div>
  <div class="big" style="font-size:78px;line-height:1.15">2차 티켓 11.30(월) 12:00</div>
  <div class="note" style="font-size:21px">NOL 티켓 단독 · 1차 3초 매진·2차 일시는 보도자료 기준</div>
</div>
<div class="a" style="right:72px;top:1212px;font-size:24px;font-weight:800;color:#D9C7A6;letter-spacing:.1em">넘겨서 정보·준비물 →</div>
""", ground=880, seed=5, case_y=800)

# 피드 2: 공연 정보 + 공식 포스터(작게, 출처)
rows = [
    ("기간", "2026.11.26(목) ~ 12.27(일)"),
    ("회차", "목·금 22:30 / 토·일 18:30, 21:30"),
    ("프리쇼", "본공연 20분 전 (22:10 / 18:10, 21:10)"),
    ("관람 시간", "85분"),
    ("관람 연령", "만 16세 이상"),
    ("가격", "55,000원"),
    ("드레스 코드", "교복 (권장)"),
    ("장소", "KBS스포츠월드 생활체육관"),
    ("예매", "NOL 티켓 단독"),
]
tbl = "".join(
    f'<div style="display:flex;gap:24px;padding:11px 0;border-bottom:1px solid rgba(217,199,166,.22)"><span style="width:170px;flex:none;color:#D9C7A6;font-size:26px;font-weight:800">{k}</span><span class="body" style="font-size:28px;line-height:1.35">{v}</span></div>'
    for k, v in rows
)
feed("klass-f2.html", f"""
<div class="a" style="inset:0;background:rgba(3,3,8,.55)"></div>
<div class="a kick" style="left:72px;right:72px;top:80px">PROGRAM</div>
<div class="a ttl" style="left:72px;top:126px;font-size:76px">공연 정보</div>
<div class="a" style="right:72px;top:96px;width:200px;text-align:center">
  <img src="../../../public/posters/immersive/4eba7208-dd09-4dd6-ba91-316972c36059.jpg" style="width:200px;border:2px solid rgba(217,199,166,.5);display:block">
  <div style="font-size:17px;margin-top:8px;opacity:.7">포스터: 블랙헤이븐 공식</div>
</div>
<div class="a plate" style="left:72px;right:72px;top:420px;padding:14px 34px 18px">{tbl}</div>
<div class="a note" style="left:72px;right:72px;top:1196px;font-size:20px">NOL 티켓 상품 상세 기준(11/15 확인) · 회차·가격은 바뀔 수 있어요</div>
""", ground=1000, seed=7, bscale=0.9, moon=(0.62, 0.07))

# 피드 3: 티켓팅 준비
steps = [
    ("01", "NOL 앱 로그인·본인인증", "당일엔 인증 문자가 늦게 올 수 있어요. 전날 미리."),
    ("02", "상품 페이지 '알림받기'", "NOL 앱에서 '비공식클래스' 검색 → 상품 열기."),
    ("03", "갈 날짜 2~3개 정해 두기", "1차로 연 12/13까지 회차는 이미 전석 매진(11/15 NOL 달력)."),
    ("04", "11:55 앱 켜고 대기", "12:00 정각에 새로고침 → 날짜 → 회차 → 예매하기."),
]
st = "".join(
    f'<div style="display:flex;gap:26px;padding:20px 0;border-bottom:1px solid rgba(217,199,166,.22)"><span class="big" style="font-size:54px;line-height:1;width:84px;flex:none">{n}</span><span><span style="display:block;font-size:34px;font-weight:800">{t}</span><span class="body" style="display:block;font-size:24px;opacity:.75;margin-top:4px">{d}</span></span></div>'
    for n, t, d in steps
)
feed("klass-f3.html", f"""
<div class="a" style="inset:0;background:rgba(3,3,8,.5)"></div>
<div class="a kick" style="left:72px;right:72px;top:80px">BEFORE 11.30 12:00</div>
<div class="a ttl" style="left:72px;right:72px;top:126px;font-size:76px">신입 탐정<br><em>입단 준비물</em></div>
<div class="a plate" style="left:72px;right:72px;top:440px;padding:6px 34px">{st}</div>
<div class="a" style="left:72px;right:72px;top:1130px;font-size:27px;font-weight:800;text-align:center">다른 이머시브 공연도 → bangtallog.com/immersive</div>
<div class="a note" style="left:72px;right:72px;top:1180px;font-size:19px;text-align:center">2차 오픈 일시는 보도자료 기준 · 배경 그림은 공식 포스터 분위기로 새로 그렸어요</div>
""", ground=1000, seed=11, bscale=0.9, moon=(0.18, 0.08))
print("ok")
