"""시안 F — 구성주의 포스터(빨강·검정 2판): 빨간 비상등, 사선, 뛰는 사람들, 문 앞의 역귀. '앵콜!'"""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from constructivism import Constructivism
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
c = Constructivism(W, H, seed=21, misreg=2.6)
c.paper()
def tm(t, x, y, f, rot=0, anchor='ls', sp=0):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im); spaced(d, (x, y), t, f, 255, sp, anchor)
    if rot: im = im.rotate(rot, center=(x, y), resample=Image.BICUBIC)
    return np.asarray(im, np.float32) / 255
# red emergency light
c.ink(c.circle(650, 700, 360), 'red')
c.waves(650, 700, 390, 540, 26, 5, -75, 5, plates=('black',), grow=-0.04)
# the thing standing in the red light
g = [(650, 470), (690, 490), (705, 560), (712, 640), (790, 690), (840, 740), (822, 748), (770, 712), (720, 690),
     (726, 790), (740, 900), (560, 900), (574, 790), (580, 690), (530, 712), (478, 748), (460, 740), (510, 690),
     (588, 640), (595, 560), (610, 490)]
c.ink(c.poly(g), 'black')
c.knock(c.circle(632, 540, 7)); c.knock(c.circle(668, 540, 7))
# red wedge: escape route
c.ink(c.wedge((40, 1500), 28, 7, 1100), 'red')
# black diagonal bar with reversed type
ang = 14
bar = c.bar(-40, 1260, 1120, 990, 210)
c.ink(bar, 'black', knock=tm('살아남아야 끝난다', 60, 1282, F(AG, 100), rot=13))
# runners on the bar
def runner(x, y, s):
    P = np.array([(0, -60), (10, -40), (8, -10), (30, 10), (26, 16), (4, 0), (-6, 22), (14, 48), (6, 52), (-16, 26),
                  (-24, 52), (-34, 48), (-20, 14), (-14, -14), (-34, -4), (-36, -10), (-12, -30), (-10, -40)], np.float32) * s
    c.ink(c.poly(P + [x, y]), 'black'); c.ink(c.circle(x + 2 * s, y - 72 * s, 13 * s), 'black')
for (x, s) in [(220, 1.5), (420, 1.25), (590, 1.05)]:
    y = 1260 - (x + 40) * (270 / 1160) - 105 - 52 * s
    runner(x, y, s)
# headline
c.ink(tm('앵콜!', 60, 300, F(AG, 210), rot=6), 'black')
c.ink(tm('ENCORE · STAY ALIVE IN MUSEUM', 66, 120, F(PB, 30), sp=3), 'red')
c.ink(tm('배우 10명 · 대한민국 최초 이머시브 체이스', 66, 380, F(PB, 30)), 'black')
# info
c.ink(tm('~ 11.29', 60, 1640, F(MJ, 130)), 'red')
c.ink(tm('마지막 2주', 520, 1585, F(AG, 64)), 'black')
c.ink(tm('롯데월드 민속박물관', 520, 1640, F(PB, 32)), 'black')
for i, s in enumerate(INFO): c.ink(tm(s, 60, 1720 + i * 38, F(PM, 26)), 'black')
c.ink(tm('TALKKAK NOTE  ·  @bangtalkkak.note', 60, 1860, F(PB, 24), sp=3), 'black')
c.age(folds=(1, 2), foxing=0.6)
c.save(out, quality=92)
