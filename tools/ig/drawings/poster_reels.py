"""영안실·춘화각 릴스 템플릿(reel-morgue.html, reel-chunhwa.html)을 만든다. 성지기숙학원(reel-sungji.html)과 같은 짜임:
0~1.45초 후킹 → 1.9초부터 줄거리 한 줄씩 → 6.3초 제목·매장·공식 포스터(작게, 출처) → 8.3초 탈깍노트 카드.
배경은 poster_moods.py 로 새로 그린 그림. 사용: python3 tools/ig/drawings/poster_reels.py"""
import os
T = os.path.join(os.path.dirname(__file__), "..", "templates")
BASE = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
@font-face{font-family:M;src:url(../assets/fonts/nanum-myeongjo-korean-800-normal.woff2)}
@font-face{font-family:B;src:url(../assets/fonts/nanum-brush-script-korean-400-normal.woff2)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;background:#000;overflow:hidden;font-family:P}
.stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000}
.scene{position:absolute;inset:0;background:url(../assets/__BG__) center/cover;opacity:.6;transform-origin:__ORIGIN__;
  animation:in .6s forwards,zoom 10.5s linear forwards,dim .8s 1.55s forwards}
@keyframes in{to{opacity:1}} @keyframes zoom{from{transform:scale(1.03)}to{transform:scale(1.15)}}
@keyframes dim{to{filter:brightness(.45)}} @keyframes out{to{opacity:0}}
.grain{position:absolute;inset:-50%;background-image:radial-gradient(rgba(255,255,255,.06) 1px,transparent 1.4px);background-size:7px 9px;animation:gr .18s steps(3) infinite;mix-blend-mode:screen;z-index:5}
@keyframes gr{0%{transform:translate(0,0)}33%{transform:translate(-11px,7px)}66%{transform:translate(9px,-5px)}}
.flick{position:absolute;inset:0;background:#000;opacity:0;z-index:20;animation:fl .22s 3.55s,fl .3s 5.35s}
@keyframes fl{0%,100%{opacity:0}30%{opacity:.85}60%{opacity:.2}}
.pale{font-family:M;color:__PALE__;letter-spacing:.12em;text-shadow:0 2px 14px rgba(0,0,0,.9)}
.acc{color:__ACC__;text-shadow:0 0 18px __ACCGLOW__}
.hook{position:absolute;left:0;right:0;top:__HOOKTOP__px;text-align:center;animation:out .25s 1.45s forwards;z-index:30}
.hook .a{font-size:74px} .hook .b{font-size:104px;margin-top:20px}
.w{position:absolute;left:0;right:0;text-align:center;white-space:nowrap;opacity:0;filter:blur(10px);letter-spacing:.28em;animation:wr var(--d,.9s) var(--t) cubic-bezier(.2,.7,.3,1) forwards;z-index:25}
@keyframes wr{to{opacity:1;filter:blur(0);letter-spacing:.1em}}
.meta{position:absolute;left:84px;top:1225px;opacity:0;animation:in .7s 6.3s forwards;z-index:25}
.meta .t{font-size:__TSIZE__px;line-height:1.05}
.meta .s{font-family:M;font-size:40px;margin-top:10px;letter-spacing:.3em;color:__PALE__}
.meta .k{font-weight:800;font-size:34px;color:#EDE6DA;margin-top:24px}
.meta .c{font-weight:800;font-size:31px;color:#A9A39A;margin-top:8px}
.meta .n{font-weight:500;font-size:24px;color:#8F897F;margin-top:8px}
.post{position:absolute;right:84px;top:1232px;width:218px;opacity:0;animation:in .7s 6.6s forwards;z-index:25}
.post img{display:block;width:218px;border:2px solid rgba(237,230,218,.3)}
.post div{font-weight:500;font-size:20px;color:#8F897F;margin-top:8px;text-align:right}
.cta{position:absolute;left:72px;right:72px;top:1600px;display:flex;align-items:center;gap:24px;background:#F5F0E6;border:5px solid #1D1D1D;border-radius:30px;padding:22px 30px;box-shadow:8px 9px 0 #1D1D1D;opacity:0;transform:translateY(50px);animation:card .6s 8.3s cubic-bezier(.22,1,.36,1) forwards;z-index:40}
@keyframes card{to{opacity:1;transform:none}}
.cta .x{color:#1D1D1D;font-weight:800;font-size:44px;letter-spacing:-.03em}.cta .x b{color:#E0782A}
.cta .s{color:#6B665D;font-weight:500;font-size:28px;margin-top:6px}
__EXTRA__
</style></head><body><div class="stage">
<div class="scene"></div><div class="grain"></div><div class="flick"></div>
<div class="hook pale"><div class="a">__H1__</div><div class="b acc">__H2__</div></div>
__LINES__
<div class="meta">__TITLE__<div class="k">__STORE__</div><div class="c">__SPEC__</div>__NOTE__</div>
<div class="post"><img src="../assets/__POSTER__"><div>포스터: 상상의문 공식</div></div>
<div class="cta"><img src="../../../public/mascot.png" width="110" height="110"><div><div class="x">다녀왔다면 <b>한 줄 기록</b></div><div class="s">줄거리·후기는 프로필 링크 · talkkaknote.com</div></div></div>
</div></body></html>'''
WALK = """
.bob{position:absolute;inset:0;animation:bob .62s 1.6s ease-in-out 12 alternate}
@keyframes bob{from{transform:translateY(0) rotate(0)}to{transform:translateY(9px) rotate(.25deg)}}
.cam{position:absolute;inset:0;transform-origin:71.8% 42.4%;animation:walk 10s cubic-bezier(.45,0,.75,1) forwards}
@keyframes walk{0%{transform:scale(1)}14%{transform:scale(1.04)}100%{transform:scale(1.95)}}
.cam .scene{animation:in .6s forwards,dim .8s 1.55s forwards}
@keyframes dim{to{filter:brightness(.58)}}
.door{position:absolute;left:400px;top:170px;width:610px;height:1520px;background:linear-gradient(90deg,#030504,#0a120e 80%,#1c3328);
  box-shadow:inset -6px 0 0 rgba(150,230,190,.18);transform-origin:0 50%;transform:perspective(1400px) rotateY(-14deg);animation:open 1.25s .1s cubic-bezier(.3,0,.2,1) forwards}
@keyframes open{to{transform:perspective(1400px) rotateY(-86deg)}}
"""
CURSE = """
.scene{animation:in .6s forwards,dim .8s 1.55s forwards}
@keyframes dim{to{filter:brightness(.6)}}
.woman,.rope{position:absolute;inset:0;background-size:cover;background-position:center}
.woman{background-image:url(../assets/reel-chunhwa-woman.png);transform-origin:52% 58%;animation:wdim .8s 1.55s forwards,gone 6s 3.6s steps(1) forwards}
@keyframes wdim{to{filter:brightness(.62)}}
@keyframes gone{0%{opacity:0}30%{opacity:0}30.5%{opacity:1;transform:scale(1.42) translateY(110px);filter:brightness(.75)}100%{opacity:1;transform:scale(1.48) translateY(118px);filter:brightness(.75)}}
.rope{background-image:url(../assets/reel-chunhwa-rope.png);transform-origin:50% 0;animation:sway 2.6s ease-in-out infinite alternate,rdim .8s 1.55s forwards}
@keyframes sway{0%{transform:rotate(-.7deg) skewX(-.6deg)}50%{transform:rotate(.35deg) skewX(.3deg) translateY(4px)}100%{transform:rotate(.8deg) skewX(.7deg)}}
@keyframes rdim{to{filter:brightness(.7)}}
.candle{position:absolute;inset:0;background:radial-gradient(ellipse at 52% 52%,rgba(255,150,70,.22),rgba(255,120,60,.06) 45%,transparent 70%);mix-blend-mode:screen;animation:cf 1.7s steps(9) infinite}
@keyframes cf{0%{opacity:.9}12%{opacity:.55}25%{opacity:1}38%{opacity:.7}50%{opacity:.95}62%{opacity:.5}75%{opacity:.85}88%{opacity:.65}100%{opacity:.9}}
.meta .t{clip-path:inset(-10% 100% -10% 0);animation:brush .9s 6.3s cubic-bezier(.3,0,.2,1) forwards}
@keyframes brush{to{clip-path:inset(-10% -5% -10% 0)}}
"""
def line(top, size, t, text, acc=False, d=None):
    cls = "w pale acc" if acc else "w pale"
    dd = f";--d:{d}s" if d else ""
    return f'<div class="{cls}" style="top:{top}px;font-size:{size}px;--t:{t}s{dd}">{text}</div>'
def make(name, walk=False, curse=False, **k):
    s = BASE
    for key, v in k.items(): s = s.replace(f"__{key}__", str(v))
    if walk:   # 문이 열리고 복도 안으로 걸어 들어가는 듯한 화면 이동(영안실)
        s = s.replace('<div class="scene"></div>', '<div class="bob"><div class="cam"><div class="scene"></div><div class="door"></div></div></div>')
        s = s.replace("</style>", WALK + "</style>")
    if curse:  # 춘화각: 카메라는 그대로, 촛불이 일렁이고 금줄이 바람에 흔들리고, 깜빡일 때 여인이 사라졌다가 더 가까이 나타난다
        s = s.replace('<div class="scene"></div>', '<div class="scene"></div><div class="candle"></div><div class="woman"></div><div class="rope"></div>')
        s = s.replace("</style>", CURSE + "</style>")
    open(os.path.join(T, f"reel-{name}.html"), "w", encoding="utf-8").write(s)

if __name__ == "__main__":
    make("morgue", walk=True, BG="reel-morgue-hall.jpg", ORIGIN="70% 40%", PALE="#E4EFE8", ACC="#D63A33", ACCGLOW="rgba(214,58,51,.35)",
         HOOKTOP=1180, H1="안내 방송이 나오면,", H2="이미 늦은 거예요.", TSIZE=104, EXTRA=".meta .t{font-family:M;color:#E4EFE8;letter-spacing:.3em}.meta .t i{font-style:normal;color:#D63A33}",
         LINES="\n".join([line(240, 92, 1.9, "안녕하십니까,"), line(380, 70, 2.8, "고객님의 마지막 여정을"), line(490, 70, 3.7, "함께하는"),
                          line(880, 74, 4.7, "인계병원 영안실입니다.", d=1.0), line(1010, 72, 5.5, "편안한 밤 되시길 바랍니다.", acc=True, d=.8)]),
         TITLE='<div class="t">영안실<i>.</i></div>', STORE="상상의문 수원점", SPEC="공포 · 난이도 4/5 · 공포도 4/5", NOTE="", POSTER="poster-morgue-official.jpg")
    make("chunhwa", curse=True, BG="reel-chunhwa-empty.jpg", ORIGIN="52% 48%", PALE="#EBDDF0", ACC="#E0333A", ACCGLOW="rgba(224,51,58,.4)",
         HOOKTOP=1200, H1="그 소문 들었어?", H2="그 여인과 하룻밤을 지내면…", TSIZE=150, EXTRA=".hook .b{font-size:76px}.meta .t{font-family:B;color:#E0333A;line-height:.9}",
         LINES="\n".join([line(240, 86, 1.9, "자네도 장원 급제를"), line(370, 86, 2.8, "위해서 이 춘화각을"), line(500, 86, 3.7, "찾았는가?"),
                          line(1030, 70, 4.9, "이쪽 끝방으로 들어가시게.", acc=True, d=1.0)]),
         TITLE='<div class="t">춘화각</div><div class="s">피할 수 없는 저주</div>', STORE="상상의문 수원 2호점", SPEC="공포 · 난이도 3/5 · 공포도 4/5",
         NOTE='<div class="n">직원 NPC와 함께하는 테마(매장 공식 안내)</div>', POSTER="poster-chunhwa-official.jpg")
    print("ok")
