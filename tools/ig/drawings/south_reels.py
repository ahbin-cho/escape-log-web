"""경기남부 '이 방의 이야기' 릴스 템플릿 4편(성지기숙학원·영안실·춘화각과 같은 짜임).
0~1.45초 후킹 → 1.9초부터 공식 줄거리 한 줄씩 → 6.3초 제목·매장(·공식 포스터 작게, 출처) → 8.3초 탈깍노트 카드.
배경은 south_moods.py 로 새로 그린 그림. 줄거리 글은 매장 공식 소개(catalog.teaser) 그대로 끊어 쓴다.
사용: python3 tools/ig/drawings/south_reels.py"""
import os, re
from poster_reels import BASE, line
T = os.path.join(os.path.dirname(__file__), "..", "templates")

FX = {
 # 엘리베이터 문이 양쪽으로 열리고, 복도 끝 303호 쪽으로 천천히 걸어 들어간다
 "bokdo": """
.cam{position:absolute;inset:0;transform-origin:50.9% 47%;animation:walk 10s cubic-bezier(.45,0,.75,1) forwards}
@keyframes walk{0%{transform:scale(1)}14%{transform:scale(1.02)}100%{transform:scale(1.6)}}
.cam .scene{animation:in .6s forwards,dim .8s 1.55s forwards}
.el{position:absolute;top:0;bottom:0;width:50%;background:linear-gradient(90deg,#2a2c2e,#55595c 40%,#3a3d40);box-shadow:inset 0 0 0 3px #1a1b1c;z-index:3}
.el.l{left:0;animation:ol 1.4s .15s cubic-bezier(.5,0,.2,1) forwards}.el.r{right:0;animation:or 1.4s .15s cubic-bezier(.5,0,.2,1) forwards}
@keyframes ol{to{transform:translateX(-82%)}}@keyframes or{to{transform:translateX(82%)}}
.lamp{position:absolute;inset:0;background:#000;opacity:0;z-index:4;animation:lp 2.4s 2.2s steps(1) infinite}
@keyframes lp{0%{opacity:0}8%{opacity:.55}10%{opacity:0}62%{opacity:.4}64%{opacity:0}}
""",
 # 달빛이 숨 쉬듯 밝아졌다 어두워지고, 침대 쪽으로 다가간다. 깜빡일 때 그림자 손이 조금씩 더 가까이
 "sagwi": """
.scene{transform-origin:50% 40%;animation:in .6s forwards,zoom2 10.5s linear forwards,dim .8s 1.55s forwards}
@keyframes zoom2{from{transform:scale(1.02)}to{transform:scale(1.3) translateY(40px)}}
.moon{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 18%,rgba(120,140,220,.28),transparent 60%);mix-blend-mode:screen;animation:br 3.2s ease-in-out infinite alternate;z-index:2}
@keyframes br{from{opacity:.4}to{opacity:1}}
""",
 # 옥수수밭 사이 흙길을 달린다(먼 밭·길·가까운 밭이 서로 다른 속도로 흘러감, 차는 덜컹). 4.55초 휘청 → 4.7초 쾅, 모든 게 멈추고 연기
 "scare": """
.world{position:absolute;inset:0;animation:dimw .8s 1.55s forwards}
@keyframes dimw{to{filter:brightness(.62)}}
.sclight{position:absolute;inset:0;background:radial-gradient(ellipse 300px 420px at 70.5% 41%,rgba(255,236,190,.22),transparent 70%);mix-blend-mode:screen;z-index:2;pointer-events:none}
.sky{position:absolute;inset:0;background:url(../assets/reel-scare-sky.jpg) center/cover;transform-origin:70% 40%;animation:zoom3 10.5s linear forwards}
@keyframes zoom3{from{transform:scale(1.02)}to{transform:scale(1.18)}}
.strip{position:absolute;left:0;right:0;background-repeat:repeat-x;animation:run var(--sp) linear infinite}
@keyframes run{from{background-position-x:0}to{background-position-x:2160px}}
.far{top:1080px;height:840px;background-image:url(../assets/reel-scare-corn-far.png);--sp:9s}
.road{top:1530px;height:170px;background-image:url(../assets/reel-scare-road.png);--sp:1.4s}
.near{top:1700px;height:220px;background-image:url(../assets/reel-scare-corn-near.png);background-size:2160px 320px;background-position-y:-40px;--sp:.9s}
.car{position:absolute;left:250px;top:1388px;width:520px;height:230px;background:url(../assets/reel-scare-car.png) center/contain no-repeat;transform-origin:20% 90%;animation:bump .28s ease-in-out infinite alternate}
@keyframes bump{from{transform:translateY(0)}to{transform:translateY(-5px) rotate(-.4deg)}}
.beam{position:absolute;left:-560px;top:1300px;width:860px;height:300px;background:radial-gradient(ellipse at 100% 62%,rgba(255,240,190,.55),rgba(255,230,170,.15) 45%,transparent 70%);mix-blend-mode:screen;transform-origin:100% 62%;clip-path:polygon(100% 55%,100% 70%,0 100%,0 0)}
.smoke{position:absolute;left:230px;top:1360px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(170,170,180,.45),transparent 65%);opacity:0}
.stopped .strip,.stopped .car{animation-play-state:paused}
.crash .car{transform:rotate(7deg) translate(-26px,8px)!important;animation:none}
.crash .beam{animation:hl 1.1s steps(1) infinite}
@keyframes hl{0%{opacity:1}30%{opacity:.15}35%{opacity:1}70%{opacity:0}75%{opacity:.8}}
.crash .smoke{animation:sm 2.6s ease-out infinite}
@keyframes sm{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(-80px,-320px) scale(1.8)}}
.shk{animation:shk .07s linear 6}
@keyframes shk{0%{translate:0 0}25%{translate:-14px 8px}50%{translate:12px -10px}75%{translate:-8px -6px}}
.crashfl{position:absolute;inset:0;background:#fff4dc;opacity:0;z-index:21}
""",
 # 네온이 지직거리고, 끝의 노래방 기계 화면이 붉게 숨 쉰다
 "kono": """
.scene{transform-origin:50% 44%;animation:in .6s forwards,zoom4 10.5s linear forwards,dim .8s 1.55s forwards}
@keyframes zoom4{from{transform:scale(1.02)}to{transform:scale(1.5)}}
.neon{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(220,30,60,.32),transparent 40%);mix-blend-mode:screen;z-index:2;animation:nb 1.3s ease-in-out infinite alternate,nf 3.1s 2s steps(1) infinite}
@keyframes nb{from{opacity:.5}to{opacity:1}}@keyframes nf{0%{filter:none}20%{filter:brightness(0)}23%{filter:none}55%{filter:brightness(0)}57%{filter:none}}
""",
 # 아래에서 카메라 플래시가 터지고, 붉은 꽃잎이 천천히 떨어진다. 위(옥상 끝)에서 아래를 내려다보듯 살짝 기울어짐
 "nakhwa": """
.scene{transform-origin:55% 78%;animation:in .6s forwards,zoom5 10.5s linear forwards,dim .8s 1.55s forwards}
@keyframes zoom5{from{transform:scale(1.02)}to{transform:scale(1.28) rotate(-1.5deg)}}
.fl{position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,0) 60%);opacity:0;z-index:3;mix-blend-mode:screen}
.pt{position:absolute;width:44px;height:33px;background:url(../assets/reel-nakhwa-petal.png) center/contain no-repeat;z-index:4;opacity:0}
""",
 # 아무것도 없는 어둠. 깜빡일 때마다 그녀가 한 걸음씩 가까이(춘화각과 같은 방식)
 "mongyeom": """
.scene{animation:in .6s forwards,dim .8s 1.55s forwards}
.her{position:absolute;inset:0;background:url(../assets/reel-mongyeom-her.png) center/cover;transform-origin:50% 66%;opacity:0;animation:in 1.2s .2s forwards,near 7s 3.4s steps(1) forwards;z-index:2}
@keyframes near{0%{transform:scale(1)}1%{transform:scale(1.35) translateY(30px)}27%{transform:scale(1.35) translateY(30px)}28%{transform:scale(1.9) translateY(80px)}100%{transform:scale(1.95) translateY(84px)}}
.flick{animation:fl .22s 3.38s,fl .3s 5.35s}
""",
}
LAYER = {"bokdo": '<div class="cam"><div class="scene"></div><div class="el l"></div><div class="el r"></div></div><div class="lamp"></div>',
         "sagwi": '<div class="scene"></div><div class="moon"></div>',
         "scare": '<div class="world" id="world"><div class="sky"></div><div class="strip far"></div><div class="strip road"></div><div class="beam"></div><div class="car"></div><div class="smoke"></div><div class="smoke" style="left:300px;animation-delay:.9s"></div><div class="strip near"></div></div><div class="sclight"></div><div class="crashfl" id="cf"></div>'
                  + '<script>setTimeout(()=>{document.querySelector(".car").style.transition="transform .15s";document.querySelector(".car").style.animation="none";document.querySelector(".car").style.transform="rotate(-6deg) translate(-20px,-6px)"},4550);'
                  + 'setTimeout(()=>{const w=document.getElementById("world");w.classList.add("stopped","crash");document.querySelector(".stage").classList.add("shk");const f=document.getElementById("cf");f.style.opacity=.85;f.style.transition="opacity .5s";requestAnimationFrame(()=>requestAnimationFrame(()=>f.style.opacity=0))},4700);</script>',
         "kono": '<div class="scene"></div><div class="neon"></div>',
         "nakhwa": '<div class="scene"></div>' + "".join(f'<div class="fl" style="left:{x}px;top:{y}px;animation:fp .5s {t}s"></div>' for x, y, t in
                   ((80, 1380, .3), (700, 1420, .9), (380, 1500, 1.6), (860, 1360, 2.4), (200, 1460, 3.1), (560, 1390, 3.9), (40, 1520, 4.6), (760, 1480, 5.2)))
                   + "".join(f'<div class="pt" style="left:{x}px;top:-60px;animation:fall {d}s {t}s linear forwards"></div>' for x, t, d in
                   ((160, 1.0, 6.5), (520, 2.2, 7), (840, 3.0, 6), (330, 4.1, 6.5), (700, 5.0, 5.5), (60, 5.8, 5))),
         "mongyeom": '<div class="scene"></div><div class="her"></div>'}
EXTRA_KF = "@keyframes fp{0%{opacity:0}15%{opacity:1}100%{opacity:0}}@keyframes fall{0%{opacity:0;transform:translate(0,0) rotate(0)}8%{opacity:1}100%{opacity:.9;transform:translate(120px,2000px) rotate(540deg)}}"

def make(name, poster=None, credit=None, **k):
    s = BASE
    for key, v in k.items(): s = s.replace(f"__{key}__", str(v))
    s = s.replace("</style>", FX[name] + EXTRA_KF + "</style>").replace('<div class="scene"></div>', LAYER[name], 1)
    post = re.search(r'<div class="post">.*?</div></div>', s).group(0)
    s = s.replace(post, f'<div class="post"><img src="../assets/{poster}"><div>포스터: {credit} 공식</div></div>' if poster else "")
    open(os.path.join(T, f"reel-{name}.html"), "w", encoding="utf-8").write(s)

make("bokdo", BG="reel-bokdo.jpg", ORIGIN="50% 47%", PALE="#EFE6D2", ACC="#D63A33", ACCGLOW="rgba(214,58,51,.4)",
     HOOKTOP=1180, H1="평소처럼 탄 엘리베이터,", H2="그날은 달랐다.", TSIZE=130, EXTRA=".hook .b{font-size:90px}.meta .t{font-family:M;color:#EFE6D2;letter-spacing:.2em}.meta .t i{font-style:normal;color:#D63A33}",
     LINES="\n".join([line(220, 60, 1.9, "상문빌라의 입주민 회장인 당신은"), line(330, 74, 2.8, "평소처럼 자신의 집"), line(440, 74, 3.6, "303호로 올라가는"),
                      line(900, 66, 4.5, "엘리베이터를 탄다."), line(1010, 60, 5.3, "그런데 뒤에서 들려오는 비명소리..", acc=True, d=.8)]),
     TITLE='<div class="t">복도끝<i>.</i></div>', STORE="상상의문 수원점", SPEC="공포 · 난이도 4/5 · 공포도 4/5", NOTE="")
make("sagwi", poster="poster-sagwi-official.jpg", credit="마스터키", BG="reel-sagwi.jpg", ORIGIN="50% 40%", PALE="#E2E4F2", ACC="#D2283A", ACCGLOW="rgba(210,40,58,.45)",
     HOOKTOP=1180, H1="분명 잠들었는데,", H2="왜 내 침대가 보이지?", TSIZE=150, EXTRA=".hook .b{font-size:86px}.meta .t{font-family:M;color:#D2283A;letter-spacing:.1em}",
     LINES="\n".join([line(240, 80, 1.9, "분명 내 방에서"), line(360, 80, 2.8, "잠들었던 것 같은데.."), line(880, 88, 3.9, "잠깐,"),
                      line(990, 72, 4.7, "그럼 내 침대 위에"), line(1090, 80, 5.4, "누워있는 건..", acc=True, d=.9)]),
     TITLE='<div class="t">사귀</div><div class="s">邪鬼</div>', STORE="마스터키 평택점", SPEC="공포 · 난이도 4/5 · 공포도 4/5", NOTE="")
make("scare", BG="reel-scare.jpg", ORIGIN="70% 40%", PALE="#EFE3CC", ACC="#E07A2A", ACCGLOW="rgba(224,122,42,.45)",
     HOOKTOP=1180, H1="한밤의 시골길,", H2="옥수수밭만 끝없이", TSIZE=130, EXTRA=".hook .b{font-size:92px}.meta .t{font-family:M;color:#EFE3CC;letter-spacing:.14em}",
     LINES="\n".join([line(560, 62, 1.9, "미국 서부 어느 지역"), line(660, 74, 2.8, "차를 타고 이동 중에.."), line(780, 74, 3.7, "옥수수밭 근처에서"),
                      line(1040, 80, 4.7, "사고가 나고 마는데..", acc=True, d=1.0)]),
     TITLE='<div class="t">허수아비</div>', STORE="둠이스케이프 FEAR점 (수원)", SPEC="공포 · 난이도 4/5 · 공포도 4/5", NOTE="")
make("kono", poster="poster-kono-official.jpg", credit="꿈소풍", BG="reel-kono.jpg", ORIGIN="50% 44%", PALE="#ECE0FA", ACC="#E8344E", ACCGLOW="rgba(232,52,78,.45)",
     HOOKTOP=1180, H1="매뉴얼만 따라서 하면", H2="쉬울 거라고 했는데…", TSIZE=130, EXTRA=".hook .b{font-size:84px}.meta .t{font-family:B;color:#E8344E;line-height:.95}",
     LINES="\n".join([line(200, 58, 1.9, "고등학교 동창의 부탁으로"), line(300, 66, 2.7, "급하게 코인노래방 알바 대타로"), line(410, 66, 3.5, "근무하게 된 당신."),
                      line(960, 62, 4.5, "들어선 코인노래방은"), line(1060, 60, 5.3, "스산하고 이상한 분위기가 감돈다.", acc=True, d=.9)]),
     TITLE='<div class="t">안산 코노</div>', STORE="꿈소풍 안산1호점", SPEC="공포 · 난이도 3/5 · 공포도 3/5", NOTE="")
make("nakhwa", BG="reel-nakhwa.jpg", ORIGIN="55% 78%", PALE="#F3E8EE", ACC="#E0334F", ACCGLOW="rgba(224,51,79,.45)",
     HOOKTOP=1180, H1="가장 높은 곳에서,", H2="꽃이 졌다.", TSIZE=150, EXTRA=".hook .b{font-size:96px}.meta .t{font-family:B;color:#E0334F;line-height:.9}",
     LINES="\n".join([line(220, 72, 1.9, "수천 개의 플래시가"), line(330, 72, 2.7, "날 향하던 그 밤,"), line(450, 80, 3.5, "나는 꼭대기에 있었다."),
                      line(820, 58, 4.4, "누구보다 찬란했던 그 순간부터—"), line(930, 62, 5.1, "어쩌면 끝은 이미", acc=True, d=.8), line(1030, 62, 5.6, "정해져 있었는지도 모른다.", acc=True, d=.8)]),
     TITLE='<div class="t">낙화</div><div class="s">떨어지는 꽃</div>', STORE="상상의문 수원 2호점", SPEC="추리 · 난이도 2/5 · 공포도 4/5",
     NOTE='<div class="n">12세 미만은 이용할 수 없는 테마(매장 공식 안내)</div>')
make("mongyeom", BG="reel-mongyeom.jpg", ORIGIN="50% 60%", PALE="#E2E8F4", ACC="#C9D6F0", ACCGLOW="rgba(201,214,240,.5)",
     HOOKTOP=1420, H1="매일 밤 같은 꿈,", H2="같은 그녀.", TSIZE=150, EXTRA=".hook .b{font-size:96px}.meta{top:1300px}.meta .t{font-family:M;color:#E2E8F4;letter-spacing:.2em}",
     LINES="\n".join([line(200, 76, 1.9, "나는 매일 꿈을 꾸었다."), line(320, 64, 2.7, "온통 어두운 곳에서"), line(420, 64, 3.4, "그녀가 날 바라보는 꿈."),
                      line(560, 56, 4.2, "그녀와 나의 거리는 항상 멀었고,"), line(650, 56, 4.8, "우리 사이엔 아무런 행동조차"), line(740, 56, 5.2, "오가지 않았다."), line(870, 70, 5.8, "그저 바라만 보고 있었다.", acc=True, d=.9)]),
     TITLE='<div class="t">몽염</div><div class="s">도망칠 수 없는 꿈</div>', STORE="상상의문 분당서현점", SPEC="공포 · 난이도 4/5 · 공포도 4/5", NOTE="")
print("ok")
