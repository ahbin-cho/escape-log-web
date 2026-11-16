"""시안 C — 리놀륨 판화(검정 + 빨강 1도): 장승이 늘어선 박물관 복도, 끝 문에서 역귀가 손을 뻗고 단원은 달린다."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from linocut import Linocut
from PIL import ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
BX0, BY0, BX1, BY1 = 70, 70, 1010, 1330
L = Linocut(W, H, block=(BX0, BY0, BX1, BY1), seed=7, paper='#efe8d6')
rng = np.random.default_rng(3)
red = L.colour_block('#b3302a', offset=(4, -3))
DX0, DY0, DX1, DY1 = 452, 470, 628, 760          # far doorway
VX, VY = 540, 620
# far doorway: cut white, red glow
door = [(DX0, DY1), (DX0, DY0 + 40), (540, DY0), (DX1, DY0 + 40), (DX1, DY1)]
L.clear(door, chatter=0.2, angle=90)
L.leave(door, on=red)
# floor: converging white lines + tile seams in perspective
floor = [(DX0, DY1), (DX1, DY1), (BX1 + 10, BY1 + 10), (BX0 - 10, BY1 + 10)]
for k in np.linspace(-1, 1, 15):
    x0 = 540 + k * 84; x1 = 540 + k * 620
    L.gouge([(x0, DY1 + 4), (x1, BY1 + 20)], 3 + 7 * abs(k), tool='v', taper=(0.05, 0.02))
for i in range(1, 9):
    y = DY1 + (BY1 - DY1) * (i / 9) ** 1.7
    half = 90 + (y - DY1) / (BY1 - DY1) * 560
    L.gouge([(540 - half, y), (540 + half, y + rng.normal(0, 2))], 2 + i * 0.7, tool='v')
# red spill of light on the near floor
spill = [(DX0, DY1), (DX1, DY1), (690, 925), (390, 925)]
L.leave(spill, on=red)
# ceiling beams
for i in range(1, 6):
    y = DY0 - (DY0 - BY0) * (i / 6) ** 1.6
    half = 100 + (DY0 - y) / (DY0 - BY0) * 520
    L.gouge([(540 - half, y), (540 + half, y)], 2 + i, tool='v')
# the yeokgwi in the doorway: hunched, long arms reaching out toward us
g = [(540, 505), (568, 520), (585, 560), (598, 610), (640, 640), (690, 690), (700, 712), (676, 700), (636, 668), (602, 650),
     (600, 700), (612, 760), (468, 760), (480, 700), (478, 650), (444, 668), (404, 700), (380, 712), (390, 690), (440, 640),
     (482, 610), (495, 560), (512, 520)]
L.leave(g)
L.leave(g, on=red)  # nothing: red under black stays black
for ex in (524, 556):
    L.clear(L.disc(ex, 545, 5), chatter=0)
# jangseung: two each side, carved faces
def jang(x, top, h, w):
    base = top + h
    body = [(x - w / 2, base), (x - w / 2, top + w * 0.6), (x - w * 0.38, top + w * 0.15), (x, top), (x + w * 0.38, top + w * 0.15), (x + w / 2, top + w * 0.6), (x + w / 2, base)]
    L.outline(body, width=4)
    L.leave(body)
    hat = [(x - w * 0.55, top + w * 0.3), (x + w * 0.55, top + w * 0.3), (x + w * 0.4, top + w * 0.42), (x - w * 0.4, top + w * 0.42)]
    L.gouge([(x - w * 0.5, top + w * 0.36), (x + w * 0.5, top + w * 0.36)], w * 0.05, tool='knife')
    ey = top + w * 0.72
    for s in (-1, 1):
        L.clear(L.disc(x + s * w * 0.2, ey, w * 0.11), chatter=0)
        L.leave(L.disc(x + s * w * 0.2, ey, w * 0.045))
        L.gouge([(x + s * w * 0.36, ey - w * 0.2), (x + s * w * 0.08, ey - w * 0.12)], w * 0.05, tool='v')
    L.gouge([(x - w * 0.05, ey + w * 0.05), (x, ey + w * 0.38), (x + w * 0.05, ey + w * 0.05)], w * 0.05, tool='v')
    my = ey + w * 0.6
    mouth = [(x - w * 0.3, my), (x + w * 0.3, my), (x + w * 0.22, my + w * 0.16), (x - w * 0.22, my + w * 0.16)]
    L.clear(mouth, chatter=0)
    for s in (-1, 1):
        L.leave([(x + s * w * 0.2, my), (x + s * w * 0.12, my), (x + s * w * 0.16, my + w * 0.14)])
    for k in range(4):
        yy = my + w * 0.4 + k * w * 0.45
        if yy > base - 20: break
        L.gouge([(x, yy), (x + rng.normal(0, 2), yy + w * 0.3)], w * 0.08, tool='v')
jang(170, 300, 1060, 150); jang(910, 300, 1060, 150)
jang(330, 470, 520, 84); jang(750, 470, 520, 84)
# the runner, near, running toward us
R0 = (540, 1060)
body = [(522, 990), (558, 990), (572, 1060), (598, 1120), (612, 1180), (592, 1186), (566, 1130), (548, 1110), (528, 1140),
        (500, 1200), (478, 1194), (500, 1130), (510, 1060)]
L.outline(body, width=9, cut=False)
L.clear(body, chatter=0); L.clear(L.disc(540, 960, 26), chatter=0)
L.outline(L.disc(540, 960, 26), width=9, cut=False)
arms = [[(520, 1005), (480, 1050), (470, 1090)], [(560, 1005), (608, 1040), (628, 1010)]]
for a in arms:
    L.gouge(a, 22, tool='brush', end=14, cut=True)
L.leave([(512, 990), (568, 990), (566, 1010), (514, 1010)], on=red)
L.speckle(region=L.rect(BX0, BY0, BX1, 300), n=120, size=(2, 4), stars=0.02)
img = L.pull()
d = ImageDraw.Draw(img)
INK, RED = (28, 26, 25), (170, 46, 40)
d.text((80, 1440), '잡히면 역귀가 된다', font=F(MJ, 96), fill=INK, anchor='ls')
spaced(d, (84, 1500), 'STAY ALIVE IN MUSEUM  ·  롯데월드 민속박물관 이머시브 호러', F(PB, 24), (90, 82, 72), 1)
d.text((80, 1640), '~ 11.29', font=F(MJ, 110), fill=RED, anchor='ls')
d.text((520, 1590), '앵콜 마지막 2주', font=F(PB, 40), fill=INK, anchor='ls')
d.text((520, 1640), '살아남아야 끝나요', font=F(PB, 34), fill=(90, 82, 72), anchor='ls')
for i, t in enumerate(INFO): d.text((84, 1720 + i * 36), t, font=F(PM, 24), fill=(90, 82, 72), anchor='ls')
spaced(d, (84, 1860), 'TALKKAK NOTE', F(PB, 22), (120, 110, 98), 4)
d.text((996, 1860), '@talkkak.note', font=F(PB, 22), fill=(120, 110, 98), anchor='rs')
img.save(out, quality=92)
