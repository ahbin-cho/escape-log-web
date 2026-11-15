"""쇼룸404 소개 캐러셀 6장(sr1~sr6.html). 내용은 공식 홈페이지(showroom404.com) 2026-11-15 확인분만.
사용: python3 tools/ig/drawings/showroom404_pages.py"""
import os
T = os.path.join(os.path.dirname(__file__), "..", "templates")
CSS = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:H;src:url(../assets/fonts/black-han-sans-korean-400-normal.woff2)}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
@font-face{font-family:A;src:url(../../../assets/fonts/SBAggroB.woff)}
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1350px;overflow:hidden;font-family:P;font-weight:500;color:#1b1714}
.bg{position:absolute;inset:0;width:1080px;height:1350px}
.a{position:absolute}
.red{color:#B8372B}
.pg{position:absolute;right:170px;top:104px;font-weight:800;font-size:24px;letter-spacing:.08em}
.kick{position:absolute;left:110px;top:200px;font-weight:800;font-size:28px;letter-spacing:.14em;color:#B8372B}
h1{position:absolute;left:108px;right:108px;top:246px;font-family:H;font-weight:400;font-size:104px;line-height:1.12;letter-spacing:-.01em}
.q{position:absolute;left:110px;right:110px;font-size:36px;line-height:1.5;font-weight:800}
.q:before{content:"“";font-family:H;color:#B8372B;font-size:70px;line-height:0;vertical-align:-22px;margin-right:6px}
.spec{position:absolute;left:110px;right:110px;border-top:5px solid #1b1714;border-bottom:5px solid #1b1714}
.row{display:flex;align-items:baseline;justify-content:space-between;padding:16px 6px;border-bottom:2px dashed rgba(27,23,20,.45);font-size:36px}
.row:last-child{border-bottom:0}
.row b{font-weight:800;font-size:30px;letter-spacing:.1em}
.row span{font-weight:800}
.st{font-size:34px;letter-spacing:.08em}.st i{font-style:normal;opacity:.22}
.note{position:absolute;left:110px;right:110px;font-size:27px;line-height:1.5;color:#3d342c}
.tag{display:inline-block;background:#B8372B;color:#F3E6C8;font-weight:800;font-size:27px;padding:6px 16px;margin-right:10px;transform:rotate(-1.5deg)}
.foot{position:absolute;left:110px;right:110px;top:1250px;display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:24px}
.foot .b{font-family:A;font-size:26px}
</style></head><body>'''
def stars(n): return '<span class="st">' + '★' * n + '<i>' + '★' * (5 - n) + '</i></span>'
def foot(src="정보: 쇼룸404 공식 홈페이지 (11.15 확인)"): return f'<div class="foot"><span>{src}</span><span class="b">탈깍.로그</span></div>'
DARK = '''<style>body{color:#F3E6C8;background:#0b0a0c}.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,7,9,.42) 0%,rgba(8,7,9,.14) 28%,rgba(8,7,9,.4) 50%,rgba(8,7,9,.66) 100%)}
.red{color:#FF6A55}.kick{color:#FF8A6E}.hd{position:absolute;left:110px;top:100px;font-family:A;font-size:28px;letter-spacing:.12em}
.spec{border-color:#F3E6C8;background:rgba(8,7,9,.6)}.row{border-bottom-color:rgba(243,230,200,.4);padding-left:18px;padding-right:18px}.note{color:#E2D5B8}
.tag{background:#E2412F;color:#fff}.st i{opacity:.3}.q:before{color:#FF6A55}.foot{color:#E2D5B8}
h1,.q,.kick,.note,.hd,.pg{text-shadow:0 2px 10px rgba(0,0,0,.85)}</style>'''
def page(n, kick, title, quote, rows, note, size=104, qtop=510, bg=None, accent=None):
    r = ''.join(f'<div class="row"><b>{k}</b><span>{v}</span></div>' for k, v in rows)
    if bg:
        acc = f'<style>.red,.q:before{{color:{accent}}}.kick{{color:{accent}}}.tag{{background:{accent};color:#0b0a0c}}</style>' if accent else ''
        head = CSS + DARK + acc + f'<img class="bg" src="../assets/{bg}"><div class="shade"></div><div class="hd">SHOWROOM 404</div>'
    else:
        head = CSS + '<img class="bg" src="../assets/sr404-page.jpg">'
    return (head + f'<div class="pg">{n} / 6</div><div class="kick">{kick}</div>'
            f'<h1 style="font-size:{size}px">{title}</h1><div class="q" style="top:{qtop}px">{quote}</div>'
            f'<div class="spec" style="top:660px">{r}</div><div class="note" style="top:1122px">{note}</div>' + foot() + '</body></html>')
P = {}
P['sr1'] = CSS + '''<img class="bg" src="../assets/sr404-cover.jpg">
<div class="a" style="left:110px;right:110px;top:880px;text-align:center;font-family:H;font-size:92px;line-height:1.16">배우가 나오는 방탈출,<br><span class="red">홍대에 있다고?</span></div>
<div class="a" style="left:110px;right:110px;top:1118px;text-align:center;font-weight:800;font-size:30px">쇼룸404 · 지금 예약 받는 쇼 4편 · 옆으로 →</div>
</body></html>'''
P['sr2'] = CSS + '''<img class="bg" src="../assets/sr404-page.jpg"><div class="pg">2 / 6</div>
<div class="kick">SHOW LINEUP</div>
<h1 style="font-size:92px">오늘의 <span class="red">쇼 라인업</span></h1>
<div class="note" style="top:372px;font-size:30px;color:#1b1714">공식 소개는 “몰입형 연출 + 배우 체험”.<br>문제만 푸는 방이 아니라, 배우 연기가 들어가는 곳이에요.</div>
<div class="spec" style="top:520px">
<div class="row" style="padding:26px 6px"><span style="font-family:H;font-weight:400;font-size:52px">한라아파트 4동 404호</span><span class="red">공포</span></div>
<div class="row" style="padding:26px 6px"><span style="font-family:H;font-weight:400;font-size:52px">PIG</span><span class="red">스릴러 · 추격</span></div>
<div class="row" style="padding:26px 6px"><span style="font-family:H;font-weight:400;font-size:52px">블랙홀</span><span class="red">B급 코믹</span></div>
</div>
<div class="note" style="top:960px">전부 60분 · 홍대 (서울 마포구 잔다리로 5-1, 5층)<br>테마마다 인원·나이 제한이 달라요. 다음 장부터 하나씩 →<br><span style="opacity:.75">※ 이 밖에 성인 전용(19세 이상) 테마가 1편 더 있어요.</span></div>''' + foot() + '</body></html>'
P['sr3'] = page(3, 'SHOW 01 · 공포', '한라아파트<br><span class="red">4동 404호</span>', '과연 귀신이 나온다는 소문이 진짜 일까?',
    [('난이도', stars(2)), ('공포', stars(2)), ('인원', '2~6명'), ('시간', '60분'), ('장치', '99.99%')],
    '<span class="tag">공포 ★2</span>공식 표기 기준이에요. 체감은 사람마다 달라요.<br>가격은 공식 FAQ에 안 적혀 있어요 → 예약 페이지에서 확인.', 96, bg='sr404-halla.jpg')
P['sr4'] = page(4, 'SHOW 02 · 스릴러 / 추격', '<span class="red">PIG</span>', '심야괴담 오늘의 이야기는 ‘비 내리는 밤, 미이산 연쇄실종사건’입니다.',
    [('난이도', stars(2)), ('공포', stars(4)), ('인원', '3~6명'), ('시간', '60분'), ('가격', '1인 29,000원')],
    '<span class="tag">고등학생 미만 이용 불가</span><br>공식 안내: 일부 공포 연출·배우 연기 포함, 심장이 약하면 주의.', 150, 450, bg='sr404-pig.jpg', accent='#FF7A3D')
P['sr5'] = page(5, 'SHOW 03 · B급 코믹 · 무서운 건 싫다면', '<span class="red">블랙홀</span>', '이수 : 피방 고? &nbsp;현석 : ㅇㅇ',
    [('난이도', stars(3)), ('공포', '공식 표기 없음'), ('인원', '2~6명'), ('시간', '60분'), ('가격', '1인 24,000원')],
    '<span class="tag">B급 코믹</span>공식 장르 그대로예요. 장치 99.99%.<br>셋 중에 난이도 별이 가장 많아요(★3).', 130, 520, bg='sr404-blackhole.jpg', accent='#5FE0FF')
P['sr6'] = CSS + '''<img class="bg" src="../assets/sr404-page.jpg"><div class="pg">6 / 6</div>
<div class="kick">BEFORE THE SHOW</div>
<h1 style="font-size:92px">가기 전에 <span class="red">딱 5개</span></h1>
<div class="spec" style="top:390px">
<div class="row" style="display:block"><span>① 매장 안에 화장실이 없어요</span><div class="note" style="position:static;font-size:26px">근처에서 미리 다녀오기</div></div>
<div class="row" style="display:block"><span>② 결제는 당일 현장에서</span><div class="note" style="position:static;font-size:26px">예약은 공식 홈페이지에서</div></div>
<div class="row" style="display:block"><span>③ 2시간 전 이후 취소는 위약금 가능</span><div class="note" style="position:static;font-size:26px">정당한 사유 없이 취소하면 2인 요금 기준</div></div>
<div class="row" style="display:block"><span>④ 혼자 플레이는 평일만</span><div class="note" style="position:static;font-size:26px">2인 요금 적용 (PIG는 3인 요금)</div></div>
<div class="row" style="display:block"><span>⑤ 나이 제한 확인</span><div class="note" style="position:static;font-size:26px">PIG는 고등학생 미만 ✕ · 성인 전용 테마는 19세 미만 ✕</div></div>
</div>
<div class="note" style="top:1090px;font-size:28px;font-weight:800;color:#1b1714">📌 저장해 두고 예약할 때 꺼내 보세요.<br><span style="font-weight:500;font-size:24px;color:#3d342c">방문 전에 꼭 매장 인스타·예약 페이지에서 다시 확인 · 다녀온 방은 탈깍.로그에 한 줄</span></div>''' + foot("먼저 써 보고 10초 가입 → 프로필 링크") + '</body></html>'
for k, v in P.items(): open(os.path.join(T, k + '.html'), 'w', encoding='utf-8').write(v)
