"""이머시브 표지 — 객석에서 한 사람이 일어나 무대로 올라가고, 배우가 손을 내민다. 빈 좌석 하나만 붉다. 리노컷 2판."""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from linocut import Linocut
from core import spline

out = sys.argv[1]
W, H = 1080, 1350
BX0, BY0, BX1, BY1 = 30, 30, 1050, 1320
L = Linocut(W, H, block=(BX0, BY0, BX1, BY1), seed=44)
red = L.colour_block('#b8322a', offset=(3, -2))
rng = np.random.default_rng(8)
STAGE_Y = 900; FRONT = 1000

# 1. 무대 바닥과 조명(흰 면)
floor = [(150, STAGE_Y), (930, STAGE_Y), (1010, FRONT), (70, FRONT)]
L.clear(L.poly(floor), chatter=0.5, angle=0)
cone = [(500, 420), (580, 420), (820, STAGE_Y + 40), (260, STAGE_Y + 40)]
L.clear(L.poly(cone), chatter=0.75, angle=90)
L.hatch(cone, angle=90, spacing=12, width=2.0, dash=(40, 140), gap=(20, 70), cut=False,
        density=lambda x, y: float(np.clip(0.1 + (y - 420) / 1400, 0, 0.45)))
for y in range(STAGE_Y + 22, FRONT, 26):                                  # 무대 마루
    L.gouge([(60, y), (1020, y)], 2.0, 'v', cut=False, smooth=False)
L.gouge([(70, FRONT), (1010, FRONT)], 5.0, 'knife', cut=False, smooth=False)

# 2. 붉은 막(양옆, 위 휘장)
for side in (-1, 1):
    x0 = BX0 if side < 0 else BX1
    side = -side   # 안쪽 방향
    pts = [(x0, 300), (x0 + side * 210, 300), (x0 + side * 150, 520), (x0 + side * 120, STAGE_Y), (x0, STAGE_Y)]
    L.clear(L.poly(pts), chatter=0.3, angle=90)
    L.leave(L.poly(pts), on=red)
    for k in range(5):
        xx = x0 + side * (30 + k * 36)
        L.gouge([(xx, 310), (xx + side * (-10 + k * 4), STAGE_Y - 10)], 3.2, 'v', smooth=True)
val = [(BX0, 300), (BX1, 300), (BX1, 360), (BX0, 360)]
L.clear(L.poly(val), chatter=0.2); L.leave(L.poly(val), on=red)
for x in range(BX0 + 20, BX1, 60):
    L.gouge([(x, 362), (x + 30, 392), (x + 60, 362)], 3.0, 'u', cut=False, smooth=True)

# 3. 배우(왼쪽, 긴 코트·모자) — 손을 내민다
ax, ay, K = 420, STAGE_Y + 4, 1.7
F = lambda pts: [(ax + a * K, ay + b * K) for a, b in pts]
coat = F([(-22, -210), (14, -214), (30, -190), (38, -120), (48, -8), (-52, -8), (-40, -120), (-30, -190)])
parts = [np.array(spline(coat + [coat[0]], 6), np.float32)]
parts.append(np.array(F([(-34, -246), (40, -246), (40, -238), (-34, -238)]), np.float32))
parts.append(np.array(F([(-16, -280), (24, -280), (22, -246), (-14, -246)]), np.float32))
parts.append(L.stroke(F([(26, -180), (70, -150), (112, -146)]), 11 * K, 'brush', end=8 * K))
am = np.clip(L.mask_of(parts) + L.disc(*F([(4, -232)])[0], 18 * K), 0, 1); L.outline(am, 2.6); L.leave(am)
L.gouge(F([(-6, -190), (-14, -20)]), 2.6, 'v', smooth=False)

# 4. 객석에서 무대로 오르는 사람(오른쪽, 작게, 계단 위)
for k in range(3):                                                         # 무대 앞 계단
    y = FRONT + 10 + k * 34
    L.clear(L.rect(560 + k * 30, y, 720 + k * 30, y + 22), chatter=0.3)
px, py, K2 = 640, STAGE_Y + 4, 1.45
G = lambda pts: [(px + a * K2, py + b * K2) for a, b in pts]
body = G([(-18, -150), (16, -152), (24, -120), (28, -64), (-26, -64), (-24, -120)])
pp = [np.array(spline(body + [body[0]], 6), np.float32)]
pp += [L.stroke(G([(10, -64), (18, -30), (30, 0)]), 13 * K2, 'brush', end=10 * K2),
       L.stroke(G([(-10, -64), (-6, -30), (-26, 30), (-34, 60)]), 13 * K2, 'brush', end=10 * K2),
       L.stroke(G([(-18, -134), (-48, -110), (-74, -106)]), 10 * K2, 'brush', end=8 * K2)]
pm = np.clip(L.mask_of(pp) + L.disc(*G([(0, -170)])[0], 16 * K2), 0, 1); L.outline(pm, 2.6); L.leave(pm)

# 5. 앞쪽 객석(검은 등받이 줄), 비어 있는 자리 하나만 붉게
for r, (y0, sw, sh) in enumerate(((1080, 120, 84), (1190, 140, 100), (1300, 160, 116))):
    off = (r % 2) * sw / 2
    for x in np.arange(BX0 - sw + off, BX1 + sw, sw + 8):
        seat = spline([(x, y0 + sh), (x + 6, y0 + 10), (x + sw / 2, y0 - 6), (x + sw - 6, y0 + 10), (x + sw, y0 + sh)], 8)
        m = L.poly(list(seat))
        L.outline(m, 2.4)
        if r == 0 and abs(x + sw / 2 - 690) < sw / 2:
            L.clear(m, chatter=0.4); L.leave(m, on=red)               # 방금 일어난 빈자리
        else:
            L.leave(m)
            L.gouge([(x + 14, y0 + 20), (x + sw / 2, y0 + 6), (x + sw - 14, y0 + 20)], 2.4, 'v', smooth=True)

L.leave(L.disc(540, 420, 14), on=red)                                      # 조명기
L.save(out)
print('ok')
