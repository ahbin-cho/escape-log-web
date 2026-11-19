"""다음 주말 예약, 언제 열려? — 강남·홍대·건대 매장의 공식 예약 오픈 규칙(catalog.booking_open)으로
토요일 예약이 열리는 날짜·시각을 계산해 캐러셀(표지 + 지역 3장 + 읽는 법)을 만든다.
인기·순위는 쓰지 않는다(기준: 매장 이름에 강남·홍대·건대가 들어 있고, 오픈 규칙이 확인된 곳).

python3 tools/ig/drawings/weekend_open.py <catalog.json> 2026-11-28 "2026-11-20 19:00"
 → tools/ig/templates/wk-1.html … wk-5.html
"""
import datetime as dt
import json
import os
import re
import sys

T = os.path.join(os.path.dirname(__file__), "..", "templates")
WD = "월화수목금토일"
AREAS = [("강남", ["강남"]), ("홍대", ["홍대", "홍익"]), ("건대", ["건대"])]


def parse_time(text):
    if "자정" in text:
        return 0
    m = re.search(r"(오전|오후|밤|낮|새벽|저녁|아침)?\s*(\d{1,2})시(?:\s*(\d{1,2})분)?", text)
    if not m:
        return None
    h, mi, ap = int(m.group(2)), int(m.group(3) or 0), m.group(1) or ""
    if ap in ("오후", "밤", "저녁") and h < 12:
        h += 12
    if ap == "낮" and h < 7:
        h += 12
    if ap in ("오전", "새벽", "아침") and h == 12:
        h = 0
    return h * 60 + mi if h < 24 else None


def open_moment(rule, target):
    """target(date) 예약이 열리는 (datetime | date, 시각을 아는지). 규칙을 못 읽으면 None"""
    r = rule.strip()
    if not r or "약" in r or re.search(r"몇\s*달|넉넉|상시", r):
        return None
    w = re.search(r"매주\s*([일월화수목금토])요일", r)
    if w:
        wd = "월화수목금토일".index(w.group(1))
        span = int((re.search(r"(\d+)\s*일치", r) or [0, 7])[1])
        mins = parse_time(r) or 0
        # 그 요일에 열면 O+7 … O+6+span 이 열린다 → target 을 포함하는 가장 늦은 O
        o = target - dt.timedelta(days=(target.weekday() - wd) % 7)
        while not (o + dt.timedelta(days=7) <= target <= o + dt.timedelta(days=6 + span)):
            o -= dt.timedelta(days=7)
        return dt.datetime.combine(o, dt.time()) + dt.timedelta(minutes=mins), True
    d = re.search(r"(\d+)\s*일\s*전", r)
    if not d:
        return None
    day = target - dt.timedelta(days=int(d.group(1)))
    mins = parse_time(r)
    if mins is None:
        return day, False
    return dt.datetime.combine(day, dt.time()) + dt.timedelta(minutes=mins), True


def label(x, known):
    if not known:
        return f"{x.month}/{x.day}({WD[x.weekday()]})", "시각은 예약 페이지에서"
    if x.hour == 0 and x.minute == 0:  # 자정 = 전날 밤 12시
        p = x - dt.timedelta(days=1)
        return f"{p.month}/{p.day}({WD[p.weekday()]})", "밤 12시"
    h, m = x.hour, x.minute
    ap = "오전" if h < 12 else "오후"
    if h >= 21:
        ap = "밤"
    hh = h % 12 or 12
    return f"{x.month}/{x.day}({WD[x.weekday()]})", f"{ap} {hh}시{f' {m}분' if m else ''}"


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;")


HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-ExtraBold.woff);font-weight:800}
@font-face{font-family:P;src:url(../../../assets/fonts/Pretendard-Medium.woff);font-weight:500}
@font-face{font-family:A;src:url(../../../assets/fonts/SBAggroB.woff)}
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1350px;overflow:hidden;font-family:P;font-weight:500;color:#1D1D1D;letter-spacing:-.02em;background:#F5F0E6}
body:before{content:"";position:absolute;inset:0;background-image:radial-gradient(#1D1D1D14 1.6px,transparent 1.6px);background-size:28px 28px}
.top{position:absolute;left:72px;right:72px;top:60px;display:flex;justify-content:space-between;align-items:center;font-size:26px}
.logo{font:30px A}.n{color:#8A8478;font-weight:800}
h1{position:absolute;left:72px;right:72px;font:800 70px/1.16 P;letter-spacing:-.035em}
h1 em{font-style:normal;color:#E07A2B}
.foot{position:absolute;left:72px;right:72px;bottom:54px;display:flex;justify-content:space-between;align-items:center;font-size:24px;font-weight:800}
.note{position:absolute;left:72px;right:72px;bottom:104px;font-size:19px;color:#8A8478;line-height:1.5}
.card{position:absolute;left:72px;right:72px;background:#FFFCF6;border:4px solid #1D1D1D;border-radius:28px;box-shadow:8px 8px 0 #1D1D1D}
.row{display:flex;align-items:center;gap:18px;padding:15px 28px;border-bottom:2px dashed #1D1D1D22}
.row:last-child{border-bottom:0}
.c{flex:1;min-width:0}.c b{display:block;font-size:27px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.c span{display:block;font-size:19px;color:#8A8478;margin-top:2px}
.t{text-align:right;flex:none}.t b{display:block;font-size:27px;font-weight:800}.t span{display:block;font-size:21px;color:#E07A2B;font-weight:800}
.t span.u{color:#8A8478;font-weight:500;font-size:18px}
.tag{display:inline-block;background:#E49A4A;border:3px solid #1D1D1D;border-radius:12px;padding:4px 14px;font-size:22px;font-weight:800}
.open{position:absolute;left:72px;right:72px;font-size:21px;line-height:1.55;color:#4A453E}
.open b{color:#1D1D1D}
</style></head><body>"""


def page(n, total, body):
    return HEAD + f'<div class="top"><span class="logo">방탈깍노트</span><span class="n">{n} / {total}</span></div>' + body + "</body></html>"


def main():
    catalog_path, target_s, now_s = sys.argv[1], sys.argv[2], sys.argv[3]
    target = dt.date.fromisoformat(target_s)
    now = dt.datetime.fromisoformat(now_s)
    sun = target + dt.timedelta(days=1)
    cat = json.load(open(catalog_path))
    pages = []
    total = 5
    # 표지
    pages.append(page(1, total, f"""
<div class="tag" style="position:absolute;left:72px;top:150px">강남 · 홍대 · 건대</div>
<h1 style="top:230px;font-size:96px">다음 주말 예약,<br><em>언제 열려?</em></h1>
<div style="position:absolute;left:72px;top:500px;font-size:34px;font-weight:800">{target.month}/{target.day}(토) · {sun.month}/{sun.day}(일) 예약 오픈 시각표</div>
<div style="position:absolute;left:72px;right:72px;top:580px;font-size:27px;line-height:1.6;color:#4A453E">매장마다 예약이 열리는 날·시각이 다 달라요.<br>공식 예약 페이지의 오픈 규칙으로 계산해 한 장씩 정리했어요.<br><b style="color:#1D1D1D">📌 저장해 두고 그 시간에 맞춰 들어가세요.</b></div>
<img src="../../../public/mascot.png" style="position:absolute;right:90px;bottom:170px;width:200px;transform:rotate(8deg)">
<div class="foot"><span>넘겨 보세요 →</span><span>talkkaknote.com</span></div>"""))
    for i, (area, kws) in enumerate(AREAS, 2):
        cafes = {}
        for t in cat:
            c = t.get("cafe") or ""
            if any(k in c for k in kws):
                cafes.setdefault(c, set()).add((t.get("booking_open") or "").strip())
        rows, opened, unknown = [], [], []
        for c, rules in sorted(cafes.items()):
            rules = {r for r in rules if r}
            if len(rules) != 1:
                unknown.append(c)
                continue
            rule = rules.pop()
            om = open_moment(rule, target)
            if not om:
                unknown.append(c)
                continue
            x, known = om
            cmp = x if known else dt.datetime.combine(x, dt.time(23, 59))
            if cmp <= now:
                opened.append(c)
                continue
            d, tm = label(x, known)
            rows.append((x if known else dt.datetime.combine(x, dt.time(23, 58)), c, rule, d, tm, known))
        rows.sort()
        n = max(1, len(rows))
        rh = min(92, int(760 / n))  # 줄 높이: 매장이 많으면 작게
        fs = 27 if rh >= 84 else 24 if rh >= 70 else 21
        rows_html = "".join(
            f'<div class="row" style="height:{rh}px;padding:0 26px"><div class="c"><b style="font-size:{fs}px">{esc(c)}</b><span style="font-size:{fs-8}px">공식 규칙: {esc(rule)}</span></div>'
            f'<div class="t"><b style="font-size:{fs}px">{d}</b><span class="{"" if known else "u"}" style="font-size:{fs-6 if known else fs-9}px">{tm}</span></div></div>'
            for _, c, rule, d, tm, known in rows
        )
        extra = ""
        if opened:
            extra += f'<div style="font-size:20px;line-height:1.5;color:#4A453E;margin-top:22px"><b style="color:#1D1D1D">✅ 이미 열려 있어요 (지금 예약 가능)</b><br>{esc(" · ".join(opened))}</div>'
        if unknown:
            extra += f'<div style="font-size:17px;line-height:1.5;color:#8A8478;margin-top:10px">오픈 규칙이 공개되지 않았거나 테마마다 달라 뺀 곳: {esc(" · ".join(unknown))}</div>'
        pages.append(page(i, total, f"""
<h1 style="top:130px">{area} <em>{target.month}/{target.day}(토)</em> 예약 오픈</h1>
<div style="position:absolute;left:72px;top:228px;font-size:22px;color:#8A8478">일요일({sun.month}/{sun.day})은 하루 뒤 같은 시각에 열려요 · 빠른 순</div>
<div style="position:absolute;left:72px;right:72px;top:276px;bottom:120px;display:flex;flex-direction:column">
<div class="card" style="position:relative;left:0;right:0">{rows_html or '<div class="row"><div class="c"><b>다음 주말 예약은 이미 다 열려 있어요</b></div></div>'}</div>
{extra}</div>
<div class="foot"><span>예약 전 공식 페이지에서 한 번 더 확인</span><span>talkkaknote.com</span></div>"""))
    pages.append(page(5, total, f"""
<h1 style="top:150px">방켓팅, <em>이렇게</em><br>준비해요</h1>
<div class="card" style="top:400px;padding:14px 0">
<div class="row"><div class="c"><b>1. 오픈 5분 전 로그인</b><span>예약 사이트·앱 로그인과 본인인증은 미리</span></div></div>
<div class="row"><div class="c"><b>2. 갈 테마 2~3개 정해 두기</b><span>첫 번째가 차면 바로 다음 테마로</span></div></div>
<div class="row"><div class="c"><b>3. 시각 맞춰 새로고침</b><span>"밤 12시"는 그 날짜가 바뀌는 순간이에요</span></div></div>
<div class="row"><div class="c"><b>4. 다녀오면 한 줄 기록</b><span>방탈깍노트에 남기면 다이어리·리뷰 시트로 쌓여요</span></div></div>
</div>
<div class="note">기준: 매장 이름에 강남·홍대·건대가 들어 있고, 공식 예약 페이지에서 오픈 규칙이 확인된 곳(인기·순위 아님).<br>오픈 규칙은 매장 사정으로 바뀔 수 있어요. 예약 전에 공식 페이지에서 한 번 더 확인해 주세요. ({now.month}/{now.day} 기준)</div>
<div class="foot"><span>먼저 써 보고 10초 가입 → 프로필 링크</span><span>talkkaknote.com</span></div>"""))
    for k, html in enumerate(pages, 1):
        open(os.path.join(T, f"wk-{k}.html"), "w").write(html)
    print("ok", len(pages))


if __name__ == "__main__":
    main()
