"""시안 D — 열화상: 정전된 박물관, 따뜻한 건 당신뿐. 문 앞엔 체온 없는 것."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from thermal import Thermal
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
t = Thermal(W, H, sensor=(270, 480), ss=2, seed=4, ambient=18)
t.room(top=18.6, bottom=17.2)
VX = 540
# corridor: back wall, floor, side walls
t.surface(t.poly([(0, 0), (W, 0), (W, H), (0, H)]), 18.0, grain=0.3)
t.surface(t.poly([(390, 560), (690, 560), (690, 980), (390, 980)]), 18.8, grain=0.2)
t.surface(t.poly([(390, 980), (690, 980), (W, 1700), (0, 1700)]), t.ramp((540, 980), 17.4, (540, 1700), 16.6), grain=0.25)
t.surface(t.poly([(0, 1700), (W, 1700), (W, H), (0, H)]), 16.4)
for side in (-1, 1):  # display cases (glass reflects the room) and statues along the walls
    for k, (x, y, w, h) in enumerate([(170, 760, 150, 560), (300, 690, 80, 330)]):
        cx = VX + side * (VX - x)
        t.surface(t.rect(cx - w / 2, y, cx + w / 2, y + h, r=6), 19.2, emissivity=0.55, grain=0.2)
        t.seam([(cx - w / 2 + 6, y + 6), (cx + w / 2 - 6, y + 6)], dT=0.8, width=2)
# emergency exit light above the far door
t.surface(t.rect(500, 600, 580, 630, r=4), 31.0)
t.soak(t.rect(500, 600, 580, 630), 26, reach=40, strength=0.5)
# the thing in the doorway: no body heat
g = [(540, 690), (566, 704), (580, 740), (588, 800), (640, 830), (680, 860), (664, 866), (624, 846), (594, 836),
     (598, 900), (606, 975), (474, 975), (482, 900), (486, 836), (456, 846), (416, 866), (400, 860), (440, 830),
     (492, 800), (500, 740), (514, 704)]
t.surface(t.shape(g), 8.5, soft=2, fuzz=0.3)
t.plume(t.rise(540, 700, 160, sway=18), 12.0, w0=10, w1=60, opacity=0.6)
# you, running toward the camera, warm
P = dict(head=(540, 1230, 46, 54), torso=[(500, 1290), (580, 1290), (596, 1420), (484, 1420)])
t.surface(t.ellipse(*P['head']), 35.0, limb=3, limb_px=10)
t.surface(t.poly(P['torso']), 33.0, limb=2)
for pts, w in [([(520, 1410), (488, 1520), (470, 1620)], 34), ([(562, 1410), (600, 1500), (650, 1560)], 34),
               ([(500, 1300), (452, 1370), (430, 1440)], 26), ([(580, 1300), (630, 1340), (660, 1290)], 26)]:
    t.surface(t.line(pts, w), 32.5, limb=1.5)
for i, (x, y) in enumerate([(560, 1180), (520, 1110), (556, 1050), (526, 1000)]):  # warm footprints behind you
    t.warm(t.ellipse(x, y, 14 - i * 2, 6 - i), 4.5 - i)
t.camera(palette='iron', curve=[(6, 0.0), (12, 0.04), (16.5, 0.12), (19.5, 0.24), (26, 0.5), (32, 0.78), (36, 1.0)], agc=0.15, netd=0.06, fpn=0.04, optics=0.8, pixel=0.2)
t.spot(540, 1340, label='Sp1', name='you')
t.spot(540, 880, label='Sp2', name='it', side='nw')
t.save(out, quality=92)
im = Image.open(out).convert('RGB'); d = ImageDraw.Draw(im)
WH, SOFT, RED = (244, 238, 228), (200, 190, 178), (232, 84, 64)
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
od.rectangle((0, 0, W, 470), fill=(8, 6, 14, 150)); od.rectangle((0, 1640, W, H), fill=(8, 6, 14, 190))
im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB'); d = ImageDraw.Draw(im)
spaced(d, (80, 120), 'ENCORE  ·  STAY ALIVE IN MUSEUM', F(PB, 26), SOFT, 4)
d.text((74, 300), '정전.', font=F(MJ, 170), fill=WH, anchor='ls')
d.text((80, 372), '진품 유물이 떨어지고 불이 꺼졌다.', font=F(PM, 34), fill=WH, anchor='ls')
d.text((80, 420), '따뜻한 건 당신뿐, 문 앞엔 체온 없는 것.', font=F(PM, 34), fill=SOFT, anchor='ls')
d.text((80, 1745), '~ 11.29', font=F(MJ, 96), fill=RED, anchor='ls')
d.text((440, 1700), '앵콜 마지막 2주', font=F(PB, 38), fill=WH, anchor='ls')
d.text((440, 1745), '롯데월드 민속박물관 · 이머시브 체이스', font=F(PM, 26), fill=SOFT, anchor='ls')
for i, s in enumerate(INFO): d.text((80, 1800 + i * 34), s, font=F(PM, 22), fill=SOFT, anchor='ls')
im.save(out, quality=92)
