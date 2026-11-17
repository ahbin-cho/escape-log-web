"""스얼뮤 시안 공통 글자(공식 보도자료 기준 정보만)."""
from PIL import ImageDraw, ImageFont
FD = '/home/user/escape-log-web/assets/fonts/'
MJ = '/home/user/escape-log-web/public/fonts/nanum-myeongjo-korean-800-normal.woff2'
AG, PB, PM = FD + 'SBAggroB.woff', FD + 'Pretendard-ExtraBold.woff', FD + 'Pretendard-Medium.woff'
def F(p, s): return ImageFont.truetype(p, s)
def spaced(d, xy, t, f, fill, sp=0, anchor='ls'):
    x, y = xy
    if anchor[0] == 'm':
        w = sum(d.textlength(c, font=f) for c in t) + sp * (len(t) - 1); x -= w / 2
    for c in t:
        d.text((x, y), c, font=f, fill=fill, anchor='l' + anchor[1]); x += d.textlength(c, font=f) + sp
INFO = ['매일 19:30 (19:10 프리쇼) · 본공연 90분 · 만 16세 이상 · 50,000원',
        '롯데월드 홈페이지 예매 · 보도자료 기준, 예매처에서 다시 확인']
