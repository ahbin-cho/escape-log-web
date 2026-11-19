import os, sys
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from lineart import LineArt, AMBER, GOLD
kind = sys.argv[2] if len(sys.argv) > 2 else 'night'
la = LineArt(1080, 1350, seed=7)
la.backdrop(kind)
S, P = LineArt.smooth, LineArt.poly
BL, BR, BT, BB = 360, 720, 690, 960      # lock body
LX, RX, ST = 452, 628, 520               # shackle legs, top of straight part
bow = LineArt.arc(210, 830, 66, 66, 180, 180 + 360 + 180)
ka = tuple(bow[-1])
shaft = P([ka, (296, 830), (296, 872), (314, 872), (314, 852), (330, 852), (330, 830), (BL, 830)], r=1.5, sharp=(1,2,3,4,5,6))
body = P([(BL, 830), (BL, BB), (BR, BB), (BR, BT), (BL, BT), (BL, 830)], r=10)
up = P([(BL, 830), (BL, BT), (LX, BT)], r=10)
shackle = np.vstack([P([(LX, BT), (LX, ST)], r=0), LineArt.arc((LX + RX) / 2, ST, (RX - LX) / 2, (RX - LX) / 2, 180, 360)[1:],
                     P([(RX, ST), (RX, 600)], r=0)])
path, marks = la.chain([('bow', bow), ('shaft', shaft), ('body', body), ('up', up), ('shackle', shackle)])
la.line(path, width=4.2, pressure=[(marks['up'], marks['shackle'], 0.6)])
la.draw_to(None)
kh = la.disc(540, 790, 24) + la.rect(530, 790, 550, 868, r=4)
la.accent(np.clip(kh, 0, 1), AMBER)
# click marks next to the open gap
for a in (-30, 0, 30):
    t = np.radians(a)
    x0, y0 = RX + 30 + 8 * np.cos(t), 640 + 40 * np.sin(t)
    la.hairline(x0, y0, x0 + 34 * np.cos(t), y0 + 34 * np.sin(t), width=3.0, colour=GOLD if kind == 'night' else '#2b2620', alpha=0.9)
ink = GOLD if kind == 'night' else '#2b2620'
sub = '#b9ab8a' if kind == 'night' else '#7a6e5c'
la.save(sys.argv[1])
from PIL import Image, ImageDraw, ImageFont
im = Image.open(sys.argv[1]); d = ImageDraw.Draw(im)
def hx(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
INKC = (233, 208, 150) if kind == 'night' else hx('#2b2620'); SUBC = hx(sub)
MJ = '/home/user/escape-log-web/public/fonts/nanum-myeongjo-korean-800-normal.woff2'
PR = '/home/user/escape-log-web/assets/fonts/Pretendard-Medium.woff'
def ct(t, y, f, c, sp=0):
    w = sum(d.textlength(ch, font=f) for ch in t) + sp * (len(t) - 1); x = 540 - w / 2
    for ch in t:
        d.text((x, y), ch, font=f, fill=c, anchor='ls'); x += d.textlength(ch, font=f) + sp
ct('방탈깍노트', 1150, ImageFont.truetype('/home/user/escape-log-web/assets/fonts/SBAggroB.woff', 108), INKC, 6)
ct('TALKKAK NOTE', 1206, ImageFont.truetype(PR, 24), SUBC, 10)
ct('방탈출 다녀온 날, 탈깍 한 줄', 1262, ImageFont.truetype(PR, 30), SUBC, 2)
im.save(sys.argv[1], quality=92)
