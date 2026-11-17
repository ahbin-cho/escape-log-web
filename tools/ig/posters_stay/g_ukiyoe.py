"""시안 G — 우키요에 목판화: 붉은 달, 기와지붕 위로 머리 긴 원령이 떠오르고, 지붕 끝에서 단원이 달린다(일본에서 온 유물)."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from ukiyoe import Ukiyoe
from core import spline
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
u = Ukiyoe(W, H, seed=8)
NIGHT, RED, INK = '#1e2a44', '#b5352a', '#241d1b'
u.bokashi(u.rect(0, 0, W, 1500), NIGHT, 0, 1300, strength=0.95)
u.block(u.circle(700, 560, 250), RED)
u.cloud_band(-40, 620, 860, 70, colour='#e9d9b6')
u.cloud_band(520, 1120, 300, 60, colour='#e9d9b6')
# roof: hanok giwa roof with upturned eave tips
ridge = spline([(-20, 1170), (300, 1160), (540, 1158), (780, 1160), (1100, 1170)], 20)
eave = spline([(-20, 1250), (60, 1300), (300, 1330), (540, 1336), (780, 1330), (1020, 1300), (1100, 1250)], 20)
roof = list(map(tuple, ridge)) + list(map(tuple, eave[::-1]))
u.block(u.poly(roof), '#4a4542')
for k in range(1, 6):  # tile courses following the curve
    f = k / 6
    row = [(x, (1 - f) * np.interp(x, ridge[:, 0], ridge[:, 1]) + f * np.interp(x, eave[:, 0], eave[:, 1])) for x in range(-20, 1101, 30)]
    u.key(row, width=2, colour='#1d1817')
for x in range(-10, W, 26):
    u.key([(x, np.interp(x, eave[:, 0], eave[:, 1]) - 12), (x, np.interp(x, eave[:, 0], eave[:, 1]) + 6)], width=7, colour='#2a2523')
u.block(u.rect(-20, 1130, 1100, 1172), '#2e2927')
u.key(list(map(tuple, ridge)), width=5); u.key(list(map(tuple, eave)), width=5)
u.block(u.poly([(0, 1330), (W, 1330), (W, 1500), (0, 1500)]), '#2a2523')
for x in range(40, W, 120): u.block(u.rect(x, 1340, x + 18, 1500), '#5a3a2a')
# the onryo: long black hair over the face, white robe trailing into a wisp, hands drooping forward
robe = list(map(tuple, spline([(560, 800), (630, 860), (660, 960), (650, 1040), (600, 1090), (520, 1120), (440, 1130), (380, 1110),
                               (440, 1090), (500, 1050), (500, 960), (510, 860)], 10)))
u.block(u.poly(robe), '#f2ebdd')
u.key(robe + [robe[0]], width=3)
u.block(u.circle(560, 760, 36), '#efe6d6')
hair = list(map(tuple, spline([(520, 735), (560, 712), (604, 735), (618, 800), (630, 900), (614, 960), (596, 900), (584, 830),
                               (570, 860), (556, 830), (540, 870), (526, 820), (512, 900), (494, 950), (500, 860), (508, 790)], 10)))
u.block(u.poly(hair), '#121010')
for arm, hand in (([(600, 860), (660, 880), (700, 900)], [(700, 900), (712, 930), (706, 950)]), ([(518, 860), (470, 880), (430, 900)], [(430, 900), (420, 930), (426, 950)])):
    u.key(arm, width=16, colour='#f2ebdd'); u.key(arm, width=2)
    u.key(hand, width=5, colour='#efe6d6')
for k in range(5):
    x = 380 + k * 80; y = 1000 - (k % 2) * 70
    u.block(u.circle(x, y, 11), '#8ec3d6'); u.key([(x, y + 10), (x - 8, y + 44)], width=3, colour='#8ec3d6')
# runner on the ridge
rx, ry = 880, 1158
u.key([(rx, ry - 70), (rx - 6, ry - 30)], width=12, colour=INK)
u.block(u.circle(rx + 2, ry - 84, 12), INK)
u.key([(rx - 6, ry - 30), (rx - 30, ry - 2)], width=8, colour=INK); u.key([(rx - 6, ry - 30), (rx + 20, ry - 4)], width=8, colour=INK)
u.key([(rx, ry - 60), (rx + 28, ry - 72)], width=7, colour=INK); u.key([(rx, ry - 60), (rx - 26, ry - 44)], width=7, colour=INK)
u.save(out)
im = Image.open(out).convert('RGB'); d = ImageDraw.Draw(im)
PAPER, SOFT, REDC = (244, 234, 210), (200, 186, 160), (196, 56, 44)
# vertical title cartouche, top-left
d.rectangle((70, 80, 200, 760), fill=(242, 228, 196), outline=(36, 29, 27), width=4)
y = 150
for ch in '살아남아야끝난다':
    d.text((135, y), ch, font=F(MJ, 76), fill=(36, 29, 27), anchor='mm'); y += 80
d.rectangle((222, 80, 300, 300), fill=REDC)
y = 120
for ch in '앵콜': d.text((261, y), ch, font=F(MJ, 52), fill=PAPER, anchor='mm'); y += 70
d.rectangle((0, 1500, W, H), fill=(242, 228, 196))
d.text((70, 1610), 'STAY ALIVE IN MUSEUM', font=F(MJ, 60), fill=(36, 29, 27), anchor='ls')
d.text((70, 1660), '일본에서 온 유물이 떨어진 밤 · 롯데월드 민속박물관', font=F(PB, 26), fill=(110, 92, 70), anchor='ls')
d.text((70, 1770), '~ 11.29', font=F(MJ, 90), fill=REDC, anchor='ls')
d.text((450, 1740), '앵콜 마지막 2주 · 이머시브 체이스', font=F(PB, 30), fill=(36, 29, 27), anchor='ls')
for i, s in enumerate(INFO): d.text((450 if i < 0 else 70, 1820 + i * 34), s, font=F(PM, 22), fill=(110, 92, 70), anchor='ls')
im.save(out, quality=92)
