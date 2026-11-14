"""자동 릴스 3편 템플릿(tools/ig/templates/reel-*.html) 만들기 — 테마마다 글씨·연출을 화풍에 맞춘다.
  sungji : 칠판 분필 글씨(손글씨, 써지는 듯 나타남)
  morgue : CCTV 자막(점 글꼴, 한 글자씩 찍힘)
  chunhwa: 붓글씨 세로쓰기(먹이 번지듯 나타남)
문구는 매장 공식 줄거리 문장을 그대로 쓴다. 사용: python3 tools/ig/drawings/reel_templates.py"""
import os
T = os.path.join(os.path.dirname(__file__), "..", "templates")
FONTS = '''@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
@font-face{font-family:Dokdo;src:url(../assets/fonts/east-sea-dokdo-korean-400-normal.woff2)}
@font-face{font-family:Myeongjo;src:url(../assets/fonts/nanum-myeongjo-korean-800-normal.woff2)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;background:#000;overflow:hidden;font-family:P}
.stage{position:relative;width:1080px;height:1920px;overflow:hidden}
.scene{position:absolute;inset:0;background-position:center;background-size:cover;transform-origin:50% 60%;animation:zoom 10.5s linear forwards}
@keyframes zoom{from{transform:scale(1)}to{transform:scale(1.1)}}
@keyframes fade{to{opacity:1}}
@keyframes out{to{opacity:0}}
.cta{position:absolute;left:72px;right:72px;top:1600px;display:flex;align-items:center;gap:24px;background:#F5F0E6;border:5px solid #1D1D1D;border-radius:30px;padding:22px 30px;box-shadow:8px 9px 0 #1D1D1D;opacity:0;transform:translateY(50px);animation:card .6s 8.3s cubic-bezier(.22,1,.36,1) forwards;z-index:40}
@keyframes card{to{opacity:1;transform:none}}
.cta .x{color:#1D1D1D;font-weight:800;font-size:44px;letter-spacing:-.03em}.cta .x b{color:#E0782A}
.cta .s{color:#6B665D;font-weight:500;font-size:28px;margin-top:6px}
'''
CTA = '<div class="cta"><img src="../../../public/mascot.png" width="110" height="110"><div><div class="x">다녀왔다면 <b>한 줄 기록</b></div><div class="s">줄거리·후기는 프로필 링크 · bangtallog.com</div></div></div>'

def page(key, css, body, script=""):
    open(os.path.join(T, f"reel-{key}.html"), "w").write(
        f'<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}{css}</style></head><body><div class="stage">{body}{CTA}</div>{script}</body></html>')

# ── 성지기숙학원: 칠판 분필 ──
page("sungji", '''.scene{background-image:url(../assets/reel-sungji.jpg);animation:zoom 10.5s linear forwards,dim 1s 1.5s forwards}
@keyframes dim{to{filter:brightness(.3) blur(4px)}}
.chalk{font-family:Dokdo;color:#F4F1E8;filter:url(#rough);text-shadow:0 0 6px rgba(244,241,232,.35)}
.hook{position:absolute;left:90px;right:60px;top:560px;font-size:190px;line-height:1.02;animation:out .3s 1.45s forwards;z-index:30}
.hook b{font-weight:400;color:#F2776A}
.hook small{display:block;font-family:P;font-weight:800;font-size:38px;color:#D9D4C4;margin-top:30px;filter:none}
.w{position:absolute;left:90px;white-space:nowrap;clip-path:inset(-20% 100% -20% 0);animation:write var(--d,.8s) var(--t) steps(14) forwards}
@keyframes write{to{clip-path:inset(-20% -5% -20% 0)}}
.under{position:absolute;left:90px;height:10px;background:#F2776A;border-radius:6px;width:0;animation:ul .5s 6.1s forwards;filter:url(#rough)}
@keyframes ul{to{width:700px}}
.meta{position:absolute;left:94px;top:1210px;opacity:0;animation:fade .6s 6.3s forwards}
.meta .t{font-family:Dokdo;font-size:132px;line-height:1;color:#FFE27A;filter:url(#rough)}
.meta .k{font-weight:800;font-size:36px;color:#F4F1E8;margin-top:22px}
.meta .c{font-weight:800;font-size:34px;color:#CFE0D3;margin-top:10px}
.erase{position:absolute;inset:0;background:linear-gradient(100deg,transparent 40%,rgba(244,241,232,.16) 50%,transparent 60%);transform:translateX(-120%);animation:sw .5s 1.45s forwards}
@keyframes sw{to{transform:translateX(120%)}}''',
'''<svg width="0" height="0" style="position:absolute"><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></svg>
<div class="scene"></div><div class="erase"></div>
<div class="hook chalk">눈을 떴는데,<br><b>또 여기라면?</b><small>줄거리 10초 ▶</small></div>
<div class="w chalk" style="top:330px;font-size:150px;--t:1.9s">같은 기척,</div>
<div class="w chalk" style="top:500px;font-size:150px;--t:2.8s">같은 냄새,</div>
<div class="w chalk" style="top:670px;font-size:150px;--t:3.7s">같은 어둠.</div>
<div class="w chalk" style="top:880px;font-size:96px;color:#F2776A;--t:4.7s;--d:1.2s">나는 또다시 이 기숙학원에서</div>
<div class="w chalk" style="top:990px;font-size:96px;color:#F2776A;--t:5.5s;--d:.6s">깨어났다.</div>
<div class="under" style="top:1100px"></div>
<div class="meta"><div class="t">성지기숙학원 : 특수교정반</div><div class="k">상상의문 수원 2호점</div><div class="c">공포 · 난이도 4/5 · 공포도 4/5</div></div>''')

# ── 영안실: CCTV 자막 ──
page("morgue", '''.scene{background-image:url(../assets/reel-morgue.jpg);filter:brightness(1.7);animation:zoom 10.5s linear forwards,roll 3.7s steps(1) infinite}
@keyframes roll{0%,100%{transform:scale(1.04)}48%{transform:scale(1.04) translateY(0)}49%{transform:scale(1.04) translateY(-34px)}50%{transform:scale(1.04) translateY(22px)}51%{transform:scale(1.04)}}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,transparent 2px 6px);z-index:5}
.bar{position:absolute;left:0;right:0;height:140px;background:linear-gradient(transparent,rgba(200,255,240,.13),transparent);animation:barm 4.2s linear infinite;z-index:6}
@keyframes barm{from{top:-160px}to{top:1920px}}
.osd{font-family:Unifont,monospace;color:#EAF7F1;text-shadow:3px 3px 0 #000,-1px -1px 0 #000;letter-spacing:.02em}
.hook{position:absolute;left:80px;right:60px;top:600px;font-family:P;font-weight:800;font-size:100px;line-height:1.28;letter-spacing:-.02em;animation:out .1s 1.5s forwards;z-index:30}
.hook b{color:#7FE0CF}.hook small{display:block;font-family:Unifont,monospace;font-weight:400;font-size:44px;margin-top:26px;color:#BFD6CF}
.sub{position:absolute;left:60px;right:60px;top:1010px;background:rgba(0,0,0,.72);border-left:10px solid #7FE0CF;padding:34px 36px 40px;opacity:0;animation:fade .2s 1.7s forwards;z-index:20}
.sub .who{font-size:40px;color:#7FE0CF;margin-bottom:18px}
.sub .tx{font-size:64px;line-height:1.5;min-height:480px;word-break:keep-all}
.cur{display:inline-block;width:30px;height:58px;background:#EAF7F1;vertical-align:-8px;animation:bl .5s steps(1) infinite}
@keyframes bl{50%{opacity:0}}
.meta{position:absolute;left:70px;top:330px;opacity:0;animation:fade .1s 6.4s forwards;z-index:20}
.meta .t{font-family:P;font-weight:800;font-size:150px;color:#fff;letter-spacing:.08em}.meta{background:rgba(0,0,0,.6);padding:20px 30px 26px;left:50px!important}.meta .k{font-family:P;font-weight:800;font-size:44px;color:#7FE0CF;margin-top:8px}.meta .c{font-family:P;font-weight:800;font-size:40px;margin-top:10px;color:#EAF7F1}
.glitch{position:absolute;inset:0;background:#DFFFF4;opacity:0;animation:gl 10s steps(1) forwards;z-index:35;mix-blend-mode:screen}
@keyframes gl{15%{opacity:.5}15.6%{opacity:0}64%{opacity:.35}64.5%{opacity:0}}''',
'''<div class="scene"></div><div class="scan"></div><div class="bar"></div><div class="glitch"></div>
<div class="hook osd">이 병원,<br><b>밤에 가 본 적 있어요?</b><small>줄거리 10초 ▶</small></div>
<div class="meta osd"><div class="t">영안실</div><div class="k">상상의문 수원점</div><div class="c">공포 · 난이도 4/5 · 공포도 4/5</div></div>
<div class="sub osd"><div class="who">♪ 안내 방송</div><div class="tx"><span id="tx"></span><span class="cur"></span></div></div>''',
'''<script>
const full="안녕하십니까, 고객님의 마지막 여정을 함께하는 인계병원 영안실입니다.\\n편안한 밤 되시길 바랍니다.";
const el=document.getElementById('tx');let i=0;
setTimeout(()=>{const iv=setInterval(()=>{i++;el.innerHTML=full.slice(0,i).replace(/\\n/g,'<br><br>');if(i>=full.length)clearInterval(iv);},68);},1900);
</script>''')

# ── 춘화각: 붓글씨 세로쓰기 ──
page("chunhwa", '''.scene{background-image:url(../assets/reel-chunhwa.jpg);filter:invert(1) hue-rotate(180deg) brightness(1.45) contrast(1.15)}
.glowr{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,110,50,.6),transparent 65%);mix-blend-mode:screen;animation:lan 1.9s ease-in-out infinite}
@keyframes lan{0%,100%{opacity:.45;transform:scale(.9)}40%{opacity:1;transform:scale(1.1)}65%{opacity:.3}}
.veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,6,6,.8) 0%,rgba(8,6,6,.25) 55%,rgba(8,6,6,.1) 75%,rgba(8,6,6,.5) 100%)}
.br{font-family:Myeongjo;color:#F3EBDD}
.hook{position:absolute;left:90px;right:60px;top:300px;font-size:116px;line-height:1.3;animation:out .5s 1.4s forwards;z-index:30}
.hook b{color:#F08A3C}.hook small{display:block;font-family:P;font-weight:800;font-size:38px;margin-top:26px;color:#D9CFC0}
.v{position:absolute;top:150px;writing-mode:vertical-rl;font-size:98px;letter-spacing:.06em;line-height:1;opacity:0;filter:blur(14px);animation:ink 1.1s var(--t) forwards,inkout .5s 6s forwards}
@keyframes inkout{to{opacity:0;filter:blur(10px)}}
@keyframes ink{to{opacity:1;filter:blur(0)}}
.v.s{font-size:64px;color:#F08A3C}
.seal{position:absolute;left:80px;top:150px;opacity:0;animation:fade .7s 6.5s forwards}
.seal .t{writing-mode:vertical-rl;font-family:Myeongjo;font-size:120px;color:#fff;background:#B5341F;padding:34px 20px;border-radius:10px;letter-spacing:.04em;box-shadow:0 0 0 6px rgba(181,52,31,.35)}
.meta{position:absolute;left:270px;top:170px;opacity:0;animation:fade .7s 6.9s forwards}
.meta .n{font-family:Myeongjo;font-size:84px;color:#F3EBDD;line-height:1.3}
.meta .k{font-weight:800;font-size:44px;color:#F08A3C;margin-top:22px}.meta .c{font-weight:800;font-size:40px;color:#EDE4D6;margin-top:12px;line-height:1.5}''',
'''<div class="scene"></div>
<div class="glowr" style="left:124px;top:1188px;width:300px;height:300px"></div><div class="glowr" style="left:696px;top:1188px;width:300px;height:300px;animation-delay:.7s"></div>
<div class="glowr" style="left:484px;top:1150px;width:420px;height:420px;animation-duration:2.7s"></div><div class="glowr" style="left:520px;top:260px;width:520px;height:520px;animation-duration:3.6s"></div>
<div class="veil"></div>
<div class="hook br">자네도,<br><b>급제하러 왔는가?</b><small>줄거리 10초 ▶</small></div>
<div class="v br" style="right:110px;--t:1.9s">자네도 장원 급제를</div>
<div class="v br" style="right:260px;--t:2.9s">위해서 이 춘화각을</div>
<div class="v br" style="right:410px;--t:3.9s">찾았는가?</div>
<div class="v br s" style="right:600px;top:210px;--t:5s">이쪽 끝방으로 들어가시게.</div>
<div class="seal"><div class="t">춘화각</div></div>
<div class="meta"><div class="n">피할 수 없는 저주</div><div class="k">상상의문 수원 2호점</div><div class="c">공포 · 난이도 3/5 · 공포도 4/5<br>직원 NPC와 함께하는 테마</div></div>''')
print("reel-sungji/morgue/chunhwa written")
