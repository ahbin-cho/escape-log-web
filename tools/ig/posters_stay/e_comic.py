"""시안 E — 1940년대 만화책 표지: 'No.2 앵콜' 호. 유물이 깨지고 정전, 거대한 손이 뻗는다."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from comic import ComicCover, YELLOW, GOLD, ORANGE, RED, CRIMSON, NAVY, BLUE, SKIN, TAN, BROWN, CREAM, WHITE, GREY, LIGHT_GREY, SKY
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
c = ComicCover(W, H, seed=12, screen=10, misreg=3)
c.paper()
BLACK = (0, 0, 0, 1)
c.graded([(0, 0), (W, 0), (W, 1500), (0, 1500)], [YELLOW, GOLD, ORANGE, RED, CRIMSON, (0, 1, .7, .5)], (0, 360), (0, 1500))
# gallery floor and plinths
c.part([(0, 1260), (W, 1200), (W, 1500), (0, 1500)], (0, .6, .9, .55), width=5)
for x, w, h in [(120, 170, 260), (830, 190, 300)]:
    c.part([(x, 1260 - h), (x + w, 1260 - h), (x + w, 1255), (x, 1262)], TAN, width=5)
    c.hatch([(x + w * 0.6, 1260 - h), (x + w, 1260 - h), (x + w, 1255), (x + w * 0.6, 1258)], angle=-60, spacing=9)
# the giant shadow hand reaching from upper right
hand = [(1080, 420), (900, 520), (760, 640), (640, 700), (520, 690), (470, 720), (560, 760), (500, 800), (430, 840), (520, 860),
        (470, 920), (560, 905), (620, 950), (700, 900), (820, 860), (1080, 800)]
c.part(hand, (0, .3, .2, .95), width=6, smooth=True)
c.feather(*c.edge_normals(hand, smooth=True), length=26, width=2.6, spacing=10)
# broken artifact shards on the floor
for (x, y, s, r) in [(600, 1330, 1.0, 10), (700, 1360, 0.7, -30), (520, 1380, 0.6, 60)]:
    P = [(x + s * px * np.cos(np.radians(r)) - s * py * np.sin(np.radians(r)), y + s * px * np.sin(np.radians(r)) + s * py * np.cos(np.radians(r)))
         for px, py in [(-60, -10), (-10, -50), (50, -20), (40, 30), (-30, 25)]]
    c.part(P, CREAM, width=4)
# the hero, running toward us, looking back
c.part([(300, 1060), (380, 1040), (420, 1180), (330, 1200)], BLUE, width=5)          # torso
c.part([(330, 1190), (380, 1190), (330, 1330), (280, 1320)], NAVY, width=5)          # leg back
c.part([(370, 1180), (420, 1175), (460, 1300), (420, 1320)], NAVY, width=5)          # leg front
c.part(c.ellipse_pts(355, 990, 52, 58), SKIN, width=5)                               # head
c.part([(300, 950), (330, 925), (395, 925), (410, 965), (390, 948), (350, 958), (318, 975)], BROWN, width=4)  # hair
c.part([(312, 1060), (250, 1110), (232, 1160), (260, 1166), (280, 1122), (330, 1096)], BLUE, width=5)        # arm
c.part([(395, 1060), (470, 1010), (500, 960), (520, 972), (492, 1030), (420, 1090)], BLUE, width=5)
c.ink(c.circle(372, 985, 6)); c.ink(c.circle(340, 990, 6))
c.part(c.ellipse_pts(358, 1020, 12, 16), (0, .8, .8, .3), width=3)                   # open mouth
c.speed((360, 1100), (-1, 0.15), n=7, length=220, spread=220, width=4)
c.logo('STAY ALIVE', [(70, 150), (1010, 130), (990, 330), (90, 345)], vp=(540, 900), depth=26)
c.logo('IN MUSEUM', [(230, 360), (850, 352), (840, 455), (240, 462)], vp=(540, 900), depth=14, colours=(CREAM, LIGHT_GREY, GREY), shade=NAVY)
c.save(out, quality=92)
im = Image.open(out).convert('RGB'); d = ImageDraw.Draw(im)
INK = (24, 20, 18)
def outlined(xy, t, f, fill, sw=8, anchor='ls'):
    d.text(xy, t, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=INK)
# issue box
d.rectangle((830, 30, 1040, 112), fill=(250, 238, 210), outline=INK, width=5)
d.text((935, 66), 'No.2', font=F(PB, 34), fill=INK, anchor='mm'); d.text((935, 98), '앵콜 호', font=F(PB, 22), fill=(170, 40, 30), anchor='mm')
# caption box
d.rectangle((60, 500, 600, 640), fill=(252, 226, 90), outline=INK, width=5)
d.text((84, 552), '가을 특별공연 준비 중', font=F(PB, 32), fill=INK, anchor='ls')
d.text((84, 604), '진품 유물이 떨어졌다…!', font=F(PB, 34), fill=INK, anchor='ls')
outlined((640, 1180), '콰앙!', F(AG, 120), (255, 214, 60), sw=9, anchor='ms')
outlined((780, 1290), '…정전!', F(AG, 64), (255, 255, 255), sw=7, anchor='ms')
# speech balloon
d.ellipse((60, 700, 560, 860), fill=(255, 255, 255), outline=INK, width=5)
d.polygon([(300, 855), (350, 925), (360, 850)], fill=(255, 255, 255))
d.line([(300, 857), (350, 925), (360, 852)], fill=INK, width=5)
d.text((310, 768), '누군가를 살릴까,', font=F(PB, 34), fill=INK, anchor='mm'); d.text((310, 812), '내가 살아남을까?!', font=F(PB, 34), fill=INK, anchor='mm')
# bottom info strip
d.rectangle((0, 1500, W, H), fill=(250, 238, 210)); d.line((0, 1500, W, 1500), fill=INK, width=6)
d.text((70, 1620), '~ 11.29', font=F(MJ, 110), fill=(176, 36, 30), anchor='ls')
d.text((470, 1572), '앵콜 마지막 2주', font=F(AG, 48), fill=INK, anchor='ls')
d.text((470, 1622), '롯데월드 민속박물관 · 이머시브 체이스', font=F(PB, 28), fill=INK, anchor='ls')
for i, s in enumerate(INFO): d.text((70, 1700 + i * 36), s, font=F(PM, 24), fill=(70, 60, 50), anchor='ls')
spaced(d, (70, 1850), 'TALKKAK NOTE', F(PB, 22), (110, 96, 80), 4)
d.text((1010, 1850), '@talkkak.note', font=F(PB, 22), fill=(110, 96, 80), anchor='rs')
im.save(out, quality=92)
