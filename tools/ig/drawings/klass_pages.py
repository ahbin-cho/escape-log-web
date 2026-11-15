"""비공식클래스(SPORTS CENTER) 2차 티켓 오픈 — 스토리 3장 + 피드 캐러셀 3장.

배경은 klass_bg.py 가 공식 포스터 분위기로 새로 그린 그림(먼저 실행). 여기선 글자와 K 가방만 얹는다.
공식 포스터 원본은 피드 2장째에만 작게(출처 표기) 쓴다.

정보 출처
- NOL 티켓 상품 상세(운영자 캡처 11/15): 11.26~12.27 · 목·금 22:30 / 토·일 18:30, 21:30 · 85분 · 만 16세 이상
  · 55,000원 · NOL 단독 · 프리쇼 20분 전 · 드레스 코드 교복
- NOL 달력(운영자 캡처 11/15): 12/13까지 열린 회차 전석 0, 12/14 이후는 아직 안 열림
- 2차 티켓 11/30(월) 12:00 · 1차 3초 매진: 보도자료(전자신문 11/13) → 카드에 '보도자료 기준' 표기

python3 tools/ig/drawings/klass_pages.py  → tools/ig/templates/tk-klass-{d7,d1,day}.html, klass-f{1,2,3}.html
"""
import os

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


def briefcase(x, y, s):
    return f"""<g transform="translate({x} {y}) scale({s})">
<ellipse cx="110" cy="152" rx="130" ry="14" fill="#000" opacity=".7"/>
<path d="M78 10 Q78 -8 110 -8 Q142 -8 142 10" stroke="#1B1310" stroke-width="10" fill="none"/>
<rect x="0" y="10" width="220" height="140" rx="12" fill="url(#leather)" stroke="#0B0705" stroke-width="3"/>
<rect x="8" y="38" width="204" height="4" fill="#0B0705" opacity=".6"/>
<rect x="30" y="28" width="16" height="22" rx="3" fill="#6B5634"/><rect x="174" y="28" width="16" height="22" rx="3" fill="#6B5634"/>
<text x="110" y="120" text-anchor="middle" font-family="M" font-weight="800" font-size="62" fill="#8C7445" opacity=".9">K</text>
</g>"""


def scene(w, h, ground, moon=None, bolt_x=None, bscale=None, seed=None, case_y=None):
    """배경 그림(klass_bg.py 로 그린 것) + K 가방."""
    bg = "klass-bg-story.jpg" if h > 1500 else "klass-bg-feed.jpg"
    cy = case_y if case_y is not None else ground + 40
    return (f'<img class="a" src="../assets/{bg}" style="inset:0;width:{w}px;height:{h}px">'
            f'<svg class="a" style="inset:0" width="{w}" height="{h}"><defs>'
            '<linearGradient id="leather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A22"/><stop offset="1" stop-color="#120D0B"/></linearGradient>'
            f'</defs>{briefcase(w*0.05, cy, w/1080*0.95) if cy > 0 else ""}</svg>')


FOOT = """<div class="a foot" style="left:72px;right:72px;bottom:%dpx"><span>TALKKAK.LOG · IMMERSIVE</span><span>@talkkak.log</span></div>
<div class="a vig"></div><div class="a grain"></div></body></html>"""

INFO = "11.26–12.27 · KBS스포츠월드 생활체육관 · 85분 · 만 16세 이상 · 55,000원"
SRC = "2차 오픈 일시는 보도자료 기준이라 NOL 공지에서 한 번 더 확인해 주세요 · 배경 그림은 공식 포스터 분위기로 새로 그렸어요"


def story(name, kick, title, when, sub):
    w, h = 1080, 1920
    s = HEAD % {"w": w, "h": h}
    s += scene(w, h, ground=1180, case_y=1150)
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
""", ground=900, case_y=850)

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
""", ground=900, case_y=-1)

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
<div class="a" style="left:72px;right:72px;top:1130px;font-size:27px;font-weight:800;text-align:center">다른 이머시브 공연도 → talkkak.com/immersive</div>
<div class="a note" style="left:72px;right:72px;top:1180px;font-size:19px;text-align:center">2차 오픈 일시는 보도자료 기준 · 배경 그림은 공식 포스터 분위기로 새로 그렸어요</div>
""", ground=900, case_y=-1)
print("ok")
