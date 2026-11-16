import sys
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from watercolor import Watercolor, hexc
from PIL import Image, ImageDraw, ImageFont, ImageFilter
out = sys.argv[1]
W, H = 1080, 1350
wc = Watercolor(W, H, seed=12, paper_tone='#F5F0E6')
wc.paper()
BL, BR, BT, BB = 210, 610, 720, 1010
LX, RX, ST = 300, 520, 560
def rr(x0, y0, x1, y1, r, n=12):
    pts = []
    for cx, cy, a0 in [(x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)]:
        for t in np.linspace(a0, a0 + 90, n):
            pts.append((cx + r * np.cos(np.radians(t)), cy + r * np.sin(np.radians(t))))
    return pts
# soft shadow on the "table"
wc.glaze(wc.shape([(x, 1030 + 26 * np.sin(np.pi * (x - 190) / 460)) for x in np.linspace(190, 650, 20)] + [(650, 1030), (190, 1030)], soft=18), hexc('#b9a98e'), strength=0.35, edge=0.1)
# shackle: thick steel band, open (right leg lifted)
arc = [((LX + RX) / 2 + (RX - LX) / 2 * np.cos(np.radians(a)), ST + (RX - LX) / 2 * np.sin(np.radians(a))) for a in np.linspace(180, 360, 30)]
path = [(LX, BT + 10)] + arc + [(RX, 640)]
sh = wc.band(path, 40)
wc.glaze(sh, hexc('#c7b79a'), strength=0.75, edge=0.5, gran=0.3)
wc.glaze(wc.band([(p[0] + 9, p[1]) for p in path], 12), hexc('#8d7a5c'), strength=0.4, edge=0.2)
wc.lift(wc.band([(p[0] - 9, p[1]) for p in path], 7), 0.5)
# body
body = wc.shape(rr(BL, BT, BR, BB, 46), soft=2.2, ragged=0.1)
wc.glaze(body, hexc('#E49A4A'), strength=0.9, edge=0.7, gran=0.35, variation=0.3)
low = wc.shape(rr(BL, BT + 150, BR, BB, 46), soft=26, ragged=0.2)
wc.glaze(low * body, hexc('#c46a2a'), strength=0.4, edge=0.1)
wc.lift(wc.shape(rr(BL + 34, BT + 26, BL + 200, BT + 64, 18), soft=10), 0.45)
# keyhole
kh = wc.shape([(410 + 34 * np.cos(t), 830 + 34 * np.sin(t)) for t in np.linspace(0, 2 * np.pi, 30)], soft=1.5) + \
     wc.shape([(392, 840), (428, 840), (442, 935), (378, 935)], soft=1.5)
wc.glaze(np.clip(kh, 0, 1), hexc('#4a2c1a'), strength=0.9, edge=0.3)
# brown outlines, like the mascot's
OUT = hexc('#7a4a24')
wc.line(rr(BL, BT, BR, BB, 46) + [rr(BL, BT, BR, BB, 46)[0]], 3.4, OUT, 0.8)
wc.line([(LX - 20, BT)] + [((LX + RX) / 2 + ((RX - LX) / 2 + 20) * np.cos(np.radians(a)), ST + ((RX - LX) / 2 + 20) * np.sin(np.radians(a))) for a in np.linspace(180, 360, 30)] + [(RX + 20, 640)], 3, OUT, 0.7)
wc.line([(LX + 20, BT)] + [((LX + RX) / 2 + ((RX - LX) / 2 - 20) * np.cos(np.radians(a)), ST + ((RX - LX) / 2 - 20) * np.sin(np.radians(a))) for a in np.linspace(180, 360, 30)] + [(RX - 20, 640)], 3, OUT, 0.7)
wc.line([(RX - 20, 640), (RX + 20, 640)], 3, OUT, 0.7)
# "탈깍" marks
for a in (-40, -12, 16):
    t = np.radians(a); x0, y0 = 590 + 14 * np.cos(t), 620 + 14 * np.sin(t)
    wc.stroke([(x0, y0), (x0 + 50 * np.cos(t), y0 + 50 * np.sin(t))], 7, hexc('#7a4a24'), strength=0.85, dry=0.15)
wc.save(out)
im = Image.open(out).convert('RGBA')
m = Image.open('/home/user/escape-log-web/public/mascot.png').convert('RGBA').resize((560, 560), Image.LANCZOS).rotate(-10, resample=Image.BICUBIC)
im.alpha_composite(m, (520, 250))
d = ImageDraw.Draw(im)
F = lambda p, s: ImageFont.truetype(p, s)
d.text((540, 1180), '탈깍노트', font=F('/home/user/escape-log-web/assets/fonts/SBAggroB.woff', 110), fill=(29, 29, 29), anchor='ms')
d.text((540, 1244), '방탈출 다녀온 날, 탈깍 한 줄', font=F('/home/user/escape-log-web/assets/fonts/Pretendard-Medium.woff', 32), fill=(110, 96, 78), anchor='ms')
im.convert('RGB').save(out, quality=92)
