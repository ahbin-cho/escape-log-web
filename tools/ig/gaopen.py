"""가오픈(시범 운영) 소식 카드 틀. JSON 한 개를 넣으면 피드 카드 1장(1080×1350) HTML 이 나온다.
사용: python3 tools/ig/gaopen.py 소식.json 나올.html   →  node tools/ig/shot.cjs 나올.html 나올.jpg
JSON 칸: store(매장) theme(테마) period(가오픈 기간) genre time players difficulty(0~5) fear(0~5, 없으면 null)
        teaser(공식 한 줄, 없으면 "") booking(예약 안내 한 줄) source(출처: "○○ 공식 인스타 11/21 게시물")
규칙: 매장 공식 공지·예약 페이지에서 확인한 것만 적는다. 게시물 날짜(연도까지)를 꼭 확인한다 — 지난 가오픈을 올리지 않기 위해.
      난이도·공포도는 매장 표기 그대로. 모르는 칸은 null 로 두면 "공식 표기 없음"으로 나온다."""
import sys, json, html
d = json.load(open(sys.argv[1], encoding="utf-8"))
e = lambda k: html.escape(str(d.get(k) or ""))
def stars(n):
    if n is None: return '<span class="none">공식 표기 없음</span>'
    return '<span class="st">' + "★" * int(n) + "<i>" + "★" * (5 - int(n)) + "</i></span>"
rows = [("장르", e("genre")), ("시간", e("time")), ("추천 인원", e("players")), ("난이도", stars(d.get("difficulty"))), ("공포도", stars(d.get("fear")))]
rows_html = "".join(f'<div class="row"><b>{k}</b><span>{v or "<span class=none>공식 표기 없음</span>"}</span></div>' for k, v in rows)
teaser = f'<div class="teaser">“{e("teaser")}”</div>' if d.get("teaser") else ""
open(sys.argv[2], "w", encoding="utf-8").write(f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:A;src:url(../../../assets/fonts/SBAggroB.woff)}}
@font-face{{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}}
@font-face{{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}}
*{{box-sizing:border-box;margin:0}}
html,body{{width:1080px;height:1350px;overflow:hidden;font-family:P;font-weight:500;color:#1D1D1D;background:#F5F0E6}}
.dots{{position:absolute;inset:0;background-image:radial-gradient(rgba(29,29,29,.06) 1.5px,transparent 1.6px);background-size:28px 28px}}
.top{{position:absolute;left:80px;right:80px;top:66px;display:flex;justify-content:space-between;align-items:center}}
.brand{{font-family:A;font-size:32px}}
.badge{{border:4px solid #1D1D1D;border-radius:999px;background:#E49A4A;color:#fff;font-weight:800;font-size:30px;padding:8px 26px;box-shadow:5px 5px 0 #1D1D1D;transform:rotate(3deg)}}
.store{{position:absolute;left:80px;top:170px;font-weight:800;font-size:32px;color:#C97A28}}
h1{{position:absolute;left:76px;right:76px;top:222px;font-family:A;font-weight:400;font-size:84px;line-height:1.16;word-break:keep-all}}
.period{{position:absolute;left:80px;right:80px;top:470px;border:4px solid #1D1D1D;border-radius:22px;background:#FFD84D;box-shadow:7px 7px 0 #1D1D1D;padding:20px 30px;transform:rotate(-1deg)}}
.period small{{display:block;font-weight:800;font-size:24px;letter-spacing:.1em}}
.period b{{font-family:A;font-weight:400;font-size:50px}}
.teaser{{position:absolute;left:84px;right:84px;top:642px;font-weight:800;font-size:31px;line-height:1.45;color:#3d342c}}
.card{{position:absolute;left:80px;right:80px;top:750px;background:#FFFCF6;border:4px solid #1D1D1D;border-radius:28px;box-shadow:9px 9px 0 #1D1D1D;padding:8px 36px}}
.row{{display:flex;justify-content:space-between;align-items:baseline;padding:17px 0;border-bottom:3px dashed rgba(29,29,29,.15);font-size:34px}}
.row:last-child{{border-bottom:0}}.row b{{font-size:28px;color:#5A5148}}.row span{{font-weight:800}}
.st{{color:#E49A4A;letter-spacing:.06em}}.st i{{font-style:normal;color:#1D1D1D;opacity:.15}}
.none{{font-weight:500!important;color:#8A8478;font-size:28px}}
.note{{position:absolute;left:84px;right:84px;top:1182px;font-size:24px;line-height:1.5;color:#5A5148}}
.foot{{position:absolute;left:80px;right:80px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-size:22px;color:#5A5148}}
.url{{font-family:A;font-size:26px;color:#1D1D1D}}
</style></head><body><div class="dots"></div>
<div class="top"><span class="brand">탈깍노트</span><span class="badge">가오픈 소식</span></div>
<div class="store">{e("store")}</div>
<h1>{e("theme")}</h1>
<div class="period"><small>가오픈 기간</small><b>{e("period")}</b></div>
{teaser}
<div class="card">{rows_html}</div>
<div class="note">{e("booking")}<br>가오픈은 운영이 바뀔 수 있어요. 방문 전에 꼭 매장 인스타·예약 페이지에서 확인!</div>
<div class="foot"><span>출처: {e("source")}</span><span class="url">talkkaknote.com</span></div>
</body></html>''')
