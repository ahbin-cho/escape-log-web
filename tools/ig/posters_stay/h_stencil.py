"""시안 H — 스텐실 그라피티: 콘크리트 벽에 '살아남아야 끝난다', 달리는 사람과 뒤쫓는 손, 빨간 11.29."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from stencil import Stencil, BLACK, RED, WHITE
from PIL import Image, ImageDraw, ImageFilter
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
s = Stencil(W, H, seed=19)
s.wall(ground=1780, ties=(360, None))
s.pavement()
def local(card, draw):
    im = Image.new('L', (card.w, card.h), 0); draw(ImageDraw.Draw(im), card.x0, card.y0)
    return np.asarray(im, np.float32) / 255
# headline card
c1 = s.card(60, 120, 1020, 560)
c1.cut(local(c1, lambda d, x0, y0: (d.text((70 - x0, 300 - y0), '살아남아야', font=F(AG, 168), fill=255, anchor='ls'),
                                     d.text((70 - x0, 520 - y0), '끝난다', font=F(AG, 200), fill=255, anchor='ls'))))
c1.bridges(width=4)
s.spray(c1, BLACK, coats=2.0, drips=0.8)
# figure card: runner + the reaching hand
c2 = s.card(60, 600, 1020, 1300)
def fig(d, x0, y0):
    o = lambda p: [(x - x0, y - y0) for x, y in p]
    d.ellipse((640 - x0, 700 - y0, 720 - x0, 780 - y0), fill=255)
    d.polygon(o([(650, 790), (720, 790), (760, 900), (830, 960), (812, 980), (740, 930), (720, 990), (790, 1100), (850, 1180), (820, 1200),
                 (740, 1110), (690, 1040), (650, 1120), (600, 1220), (565, 1205), (610, 1080), (640, 960), (600, 920), (560, 960), (540, 940), (600, 860)]), fill=255)
    d.polygon(o([(60, 760), (200, 740), (330, 780), (420, 760), (470, 790), (420, 812), (480, 830), (430, 852), (470, 880), (410, 890),
                 (440, 930), (350, 905), (250, 900), (60, 920)]), fill=255)
c2.cut(local(c2, fig)); c2.bridges(width=4)
s.spray(c2, BLACK, coats=2.2, drips=0.6)
# red card: encore + date + arrow
c3 = s.card(60, 1280, 1020, 1700)
def red(d, x0, y0):
    d.text((70 - x0, 1420 - y0), 'ENCORE', font=F(PB, 110), fill=255, anchor='ls')
    d.text((70 - x0, 1640 - y0), '~11.29', font=F(PB, 190), fill=255, anchor='ls')
    d.polygon([(800 - x0, 1330 - y0), (990 - x0, 1380 - y0), (800 - x0, 1430 - y0), (830 - x0, 1380 - y0)], fill=255)
c3.cut(local(c3, red)); c3.bridges(width=4)
s.spray(c3, RED, coats=2.0, drips=1.0)
s.save(out, quality=92)
im = Image.open(out).convert('RGB')
# wheat-pasted info flyer
fl = Image.new('RGB', (540, 236), (240, 234, 220)); fd = ImageDraw.Draw(fl)
fd.text((24, 46), 'STAY ALIVE IN MUSEUM', font=F(PB, 32), fill=(30, 28, 26), anchor='ls')
fd.text((24, 84), '롯데월드 민속박물관 · 이머시브 체이스', font=F(PM, 24), fill=(30, 28, 26), anchor='ls')
fd.text((24, 122), '앵콜 마지막 2주 · 배우 10명', font=F(PB, 26), fill=(176, 40, 32), anchor='ls')
for i, t in enumerate(['매일 19:30 (19:10 프리쇼) · 90분', '만 16세 이상 · 50,000원', '롯데월드 홈페이지 예매 · 보도자료 기준']):
    fd.text((24, 160 + i * 28), t, font=F(PM, 22), fill=(60, 56, 50), anchor='ls')
fl = fl.rotate(-3, expand=True, fillcolor=(0, 0, 0)); m = fl.convert('L').point(lambda v: 255 if v > 8 else 0)
sh = Image.new('L', fl.size, 0); sh.paste(m, (0, 0)); sh = sh.filter(ImageFilter.GaussianBlur(6))
im.paste((40, 38, 36), (502, 1672), sh.point(lambda v: v * 0.4)); im.paste(fl, (490, 1660), m)
d = ImageDraw.Draw(im)
d.text((70, 1880), '@bangtalkkak.note', font=F(PB, 26), fill=(30, 28, 26), anchor='ls')
im.save(out, quality=92)
