"""시안 A — 수묵: 봉인이 풀린 항아리에서 먹빛 요괴가 피어오른다."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from inkpaint import Painting, spline, blur
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
p = Painting(W, H, seed=1129); p.paper()
YY, XX, rng = p.YY, p.XX, p.rng
# floor wash
p.over(p.D, 0.18 * np.clip((YY - 1440) / 260, 0, 1) * (0.7 + 0.3 * p.noise2d(160, 3, 2)))
# jar profile
CX = 540
ys = np.array([930, 960, 1020, 1120, 1240, 1380, 1480]); rs = np.array([112, 150, 248, 270, 255, 200, 150])
yy = np.clip(YY, 930, 1480); r = np.interp(yy, ys, rs)
inside = (YY >= 930) & (YY <= 1480) & (np.abs(XX - CX) < r)
u = (XX - CX) / np.maximum(r, 1)
shade = 0.42 + 0.35 * np.clip(u, -1, 1) ** 2 + 0.25 * np.clip(u, 0, 1)
tex = 0.75 + 0.25 * p.noise2d(70, 4, 5)
jar = inside * shade * tex
jar *= 1 - 0.55 * np.exp(-((XX - (CX - 120)) ** 2 / (2 * 40 ** 2) + (YY - 1130) ** 2 / (2 * 130 ** 2)))  # highlight
p.over(p.D, blur(jar.astype(np.float32), 2.2) * 1.0)
# outline
left = [(CX - np.interp(y, ys, rs), y) for y in np.linspace(930, 1480, 30)]
right = [(CX + np.interp(y, ys, rs), y) for y in np.linspace(930, 1480, 30)]
p.stroke(spline(left, 30), 3.5, 0.85, dry=0.3); p.stroke(spline(right, 30), 4.5, 0.9, dry=0.3)
p.stroke(spline([(CX - 150, 1480), (CX, 1494), (CX + 150, 1480)], 12), 5, 0.9, dry=0.3)
rim = [(CX + 112 * np.cos(t), 930 + 22 * np.sin(t)) for t in np.linspace(0, 2 * np.pi, 40)]
p.stroke(rim, 5, 0.95, dry=0.25, taper=(0.05, 0.05))
for k in range(3):  # band lines on the shoulder
    yb = 1040 + k * 16
    rb = np.interp(yb, ys, rs) - 6
    p.stroke(spline([(CX - rb, yb), (CX, yb + 18), (CX + rb, yb)], 16), 1.8, 0.45, dry=0.5)
# lid knocked off, lying at the right
lid = [(860 + 120 * np.cos(t), 1500 + 28 * np.sin(t)) for t in np.linspace(0, 2 * np.pi, 40)]
p.stroke(lid, 5, 0.85, dry=0.3, taper=(0.05, 0.05))
p.over(p.D, 0.45 * np.exp(-((XX - 860) ** 2 / (2 * 110 ** 2) + (YY - 1508) ** 2 / (2 * 16 ** 2))))
# red talisman, torn, peeling off the belly
tal = [(CX - 70, 1110), (CX + 60, 1100), (CX + 72, 1330), (CX - 10, 1300), (CX - 58, 1340)]
from core import polygon_mask
m = polygon_mask(H, W, tal, 2)
YEL = m * 0
crack = [(CX + 40, 940), (CX + 10, 1010), (CX + 55, 1080), (CX - 5, 1170), (CX + 35, 1250), (CX - 20, 1340), (CX + 10, 1430)]
p.stroke(crack, 9, 0.95, dry=0.15, taper=(0.05, 0.4), red=True)
for a, b in [((CX + 10, 1010), (CX - 60, 1050)), ((CX - 5, 1170), (CX - 90, 1200)), ((CX + 35, 1250), (CX + 120, 1290))]:
    p.stroke([a, b], 5, 0.85, dry=0.2, taper=(0.05, 0.8), red=True)
# ink smoke: a wet billowing column from the mouth that widens into a face
cl = p.noise2d(120, 5, 31); cl2 = p.noise2d(45, 4, 33)
dens = np.zeros_like(p.D)
for t in np.linspace(0, 1, 70):
    y = 925 - t * 640
    x = CX + 70 * np.sin(t * 5.2) * t
    rr = 40 + 230 * t ** 1.3
    dens = np.maximum(dens, np.exp(-((XX - x) ** 2 + ((YY - y) * 1.15) ** 2) / (2 * rr ** 2)) * (1.0 - 0.15 * t) * (1 - 0.6 * np.clip((t - 0.75) / 0.25, 0, 1)))
smoke = dens * np.clip((cl * 0.7 + cl2 * 0.3 - 0.12) / 0.38, 0, 1) * np.clip((930 - YY) / 40, 0, 1)
p.over(p.D, blur(smoke.astype(np.float32), 2.5) * 0.95)
p.over(p.D, 0.5 * np.exp(-((XX - CX) ** 2 / (2 * 190 ** 2) + (YY - 640) ** 2 / (2 * 120 ** 2))) * (0.7 + 0.3 * cl2))
for i in range(5):
    pts = []; x, y = CX + rng.normal(0, 30), 920; a = -np.pi / 2 + rng.normal(0, 0.25); curl = rng.choice([-1, 1]) * rng.uniform(0.01, 0.03)
    for s_ in range(80):
        pts.append((x, y)); a += curl; x += 8 * np.cos(a); y += 8 * np.sin(a)
        if y < 330 or abs(x - CX) > 330: break
    p.stroke(spline(pts[::3], 4), rng.uniform(10, 18), rng.uniform(0.25, 0.4), dry=0.55, taper=(0.1, 0.8))
FY = 600
for ex, ey in [(CX - 95, FY), (CX + 85, FY - 8)]:
    e = np.clip(1.3 - (((XX - ex) / 44) ** 2 + ((YY - ey) / 15) ** 2), 0, 1)
    np.multiply(p.D, 1 - e, out=p.D)
    p.dot(ex + 8, ey + 1, 9, 0.98, squash=1.0, red=True)
g = np.zeros_like(p.D)
for t in np.linspace(-1, 1, 80):
    gx, gy = CX - 5 + t * 130, FY + 105 + 36 * (1 - t * t)
    g = np.maximum(g, np.exp(-((XX - gx) ** 2 + (YY - gy) ** 2) / (2 * (10 - 6 * abs(t)) ** 2)))
np.multiply(p.D, 1 - 0.95 * np.clip(g * 1.4, 0, 1), out=p.D)
img = p.composite()
arr = np.asarray(img).astype(np.float32); yl = YEL[..., None] * np.array([0, 18, 70], np.float32); img = Image.fromarray(np.clip(arr - yl, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(img)
INK, SOFT, RED = (28, 24, 22), (98, 88, 78), (166, 44, 36)
spaced(d, (86, 140), 'ENCORE · 앵콜 마지막 2주', F(PB, 26), SOFT, 4)
d.text((80, 270), '유물이', font=F(MJ, 128), fill=INK, anchor='ls')
d.text((80, 410), '깨졌다', font=F(MJ, 128), fill=INK, anchor='ls')
d.text((86, 470), '가을 특별공연을 준비하던 밤,', font=F(PM, 30), fill=INK, anchor='ls', stroke_width=5, stroke_fill=(236, 230, 218))
d.text((86, 512), '진품 유물이 떨어지고, 정전.', font=F(PM, 30), fill=INK, anchor='ls', stroke_width=5, stroke_fill=(236, 230, 218))
d.text((80, 1640), 'STAY ALIVE IN MUSEUM', font=F(MJ, 62), fill=INK, anchor='ls')
spaced(d, (84, 1690), '롯데월드 민속박물관 · 이머시브 체이스', F(PB, 26), SOFT, 3)
d.text((80, 1780), '~ 11.29', font=F(MJ, 78), fill=RED, anchor='ls')
d.text((390, 1774), '살아남아야 끝나요', font=F(PB, 34), fill=INK, anchor='ls')
for i, t in enumerate(INFO): d.text((84, 1828 + i * 34), t, font=F(PM, 22), fill=SOFT, anchor='ls')
img.save(out, quality=92)
