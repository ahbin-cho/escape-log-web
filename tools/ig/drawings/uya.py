"""우야(雨夜) — 비 오는 밤 성곽 아래 골목, 누군가 쫓기기 시작했다. 리노컷 2판(먹 + 붉은 우산)."""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from linocut import Linocut
from core import spline

out = sys.argv[1]
W, H = 1080, 1240
BX0, BY0, BX1, BY1 = 60, 60, 1020, 1180
L = Linocut(W, H, block=(BX0, BY0, BX1, BY1), seed=21)
rng = np.random.default_rng(3)
red = L.colour_block('#b8322a', offset=(3, -2))
lamp_c = None

# 성곽(여장) 윗선과 길바닥 선
WALL_TOP = 470; WALL_BOT = 700; GROUND = 700
sky = [(BX0-10, BY0-10), (BX1+10, BY0-10), (BX1+10, WALL_TOP), (BX0-10, WALL_TOP)]
road = [(BX0-10, GROUND), (BX1+10, GROUND), (BX1+10, BY1+10), (BX0-10, BY1+10)]

# 1. 큰 흰 면: 길바닥(젖은 빛)

# 2. 하늘: 굵게 내리꽂는 빗줄기(V 칼)
L.flow(sky, lambda x, y: 104 + 4*np.sin(x/180), n=420, length=(60, 260), width=(1.4, 3.6), step=3.0,
       density=lambda x, y: 0.55 + 0.45*np.sin(x/260)**2)

# 3. 성곽: 여장(凸 모양 톱니)과 벽돌 줄
x = BX0 - 10
while x < BX1 + 10:
    w = 64
    L.clear(L.rect(x + w, WALL_TOP - 1, x + w + 26, WALL_TOP + 34), chatter=0.2)   # 총안 사이 틈
    x += w + 26
for yy in range(WALL_TOP + 70, WALL_BOT - 10, 34):
    off = 0 if (yy // 34) % 2 else 40
    L.gouge([(BX0 - 10, yy), (BX1 + 10, yy)], 2.0, 'v', smooth=False)
    for bx in range(BX0 - 10 + off, BX1 + 10, 80):
        L.gouge([(bx, yy), (bx, yy + 30)], 1.8, 'v', smooth=False)

# 4. 가로등(왼쪽): 기둥과 빛 원뿔 — 원뿔 속 빗줄기는 하얗게
px = 230
L.leave(L.rect(px - 7, 300, px + 7, GROUND + 40))
L.leave(L.poly([(px - 40, 300), (px + 40, 300), (px + 26, 276), (px - 26, 276)]))
cone = [(px - 30, 304), (px + 30, 304), (px + 210, GROUND + 30), (px - 210, GROUND + 30)]
L.clear(L.poly(cone), chatter=0.7, angle=96)
L.hatch(cone, angle=96, spacing=13, width=2.2, dash=(40, 120), gap=(20, 60), cut=False,
        density=lambda x, y: np.clip(0.15 + (y - 304) / 900, 0, 0.6))

L.leave(L.rect(px - 6, 300, px + 6, GROUND + 70))
L.outline(L.rect(px - 6, 300, px + 6, GROUND + 70), 2.0)
L.leave(L.poly([(px - 40, 300), (px + 40, 300), (px + 26, 276), (px - 26, 276)]))
# 5. 길바닥: 젖은 반사(가로 점선), 등불 반사 기둥
L.hatch(road, angle=0, spacing=11, width=2.4, dash=(18, 110), gap=(14, 80), cut=True,
        density=lambda x, y: float(np.clip(0.18 + 0.5*np.exp(-((x - px)/170)**2) + 0.25*np.exp(-((x - 560)/260)**2) - 0.15*max(y - 1000, 0)/180, 0.06, 0.8)))
L.hatch([(px - 26, GROUND + 50), (px + 26, GROUND + 50), (px + 34, BY1), (px - 34, BY1)], angle=90, spacing=9, width=3,
        dash=(10, 28), gap=(6, 18), cut=True)

# 6. 멀리 골목 끝, 서 있는 형체(뒤쫓는 이) — 실루엣 + 희미한 두 눈
fx, fy = 820, GROUND + 4
figure = [(fx - 22, fy), (fx - 26, fy - 120), (fx - 18, fy - 150), (fx, fy - 172), (fx + 18, fy - 150), (fx + 26, fy - 120), (fx + 22, fy)]
L.outline(L.poly(figure), 2.4)
L.leave(figure)
L.clear(L.disc(fx - 7, fy - 150, 2.4), chatter=0); L.clear(L.disc(fx + 7, fy - 150, 2.4), chatter=0)
L.hatch([(fx - 22, fy + 4), (fx + 22, fy + 4), (fx + 28, fy + 110), (fx - 28, fy + 110)], angle=90, spacing=7, width=2.0,
        dash=(6, 16), gap=(6, 14), cut=True)

# 7. 후드를 쓴 사람이 앞으로 달려 나오며 어깨 너머로 돌아본다
wx, wy, K = 600, 1040, 1.7
F = lambda pts: [(wx + a*K, wy + b*K) for a, b in pts]
coat = F([(-6, -186), (10, -192), (24, -182), (30, -160), (36, -120), (52, -80), (70, -54), (40, -58), (14, -66), (-12, -64),
          (-40, -60), (-62, -48), (-44, -84), (-34, -120), (-26, -160)])
legs = [F([(10, -66), (40, -36), (70, -8), (84, -6)]), F([(-8, -66), (-30, -40), (-58, -30), (-70, -40)])]
arms = [F([(20, -160), (46, -132), (66, -150)]), F([(-14, -156), (-42, -130), (-66, -118)])]
parts = [np.array(spline(coat + [coat[0]], 6), np.float32)]
parts += [L.stroke(l, 17*K, 'brush', end=12*K) for l in legs]
parts += [L.stroke(a, 11*K, 'brush', end=7*K) for a in arms]
hood = [(0, -186), (-10, -206), (-4, -226), (14, -232), (30, -222), (34, -202), (24, -186)]
parts.append(np.array(spline(F(hood) + [F(hood)[0]], 6), np.float32))
wm = L.mask_of(parts)
L.outline(wm, 2.6)
L.leave(wm)
# 등불이 왼쪽 뒤에 있어 몸 왼쪽 가장자리에 빛 테두리
L.gouge(F([(-24, -170), (-32, -130), (-42, -92), (-58, -56)]), 3.4, 'v', smooth=True)
L.gouge(F([(-4, -224), (-10, -206), (-4, -190)]), 3.0, 'v', smooth=True)
L.gouge(F([(-14, -156), (-40, -130), (-62, -120)]), 2.6, 'v', smooth=True)
# 돌아본 얼굴 옆선만 하얗게(턱·코)
L.clear(L.poly(F([(26, -220), (34, -212), (36, -204), (31, -200), (33, -195), (27, -190), (24, -200)])), chatter=0)
L.gouge(F([(-6, -176), (-22, -110), (-40, -66)]), 2.6, 'v', smooth=True)
L.gouge(F([(12, -176), (30, -120), (50, -72)]), 2.6, 'v', smooth=True)
L.gouge(F([(-50, -54), (-80, -50)]), 2.2, 'v', smooth=False)
L.gouge(F([(56, -58), (86, -48)]), 2.2, 'v', smooth=False)
# 발밑 물 튀김
for k in range(14):
    a0 = rng.uniform(-2.6, -0.5); r0 = rng.uniform(16, 44)
    bx, by = F([(84, -4)])[0]
    L.gouge([(bx, by), (bx + np.cos(a0)*r0, by + np.sin(a0)*r0)], 1.8, 'v', smooth=False)
L.hatch([(wx - 60*K, wy), (wx + 90*K, wy), (wx + 170*K, wy + 44), (wx - 20*K, wy + 50)], angle=6, spacing=5, width=2.0,
        dash=(10, 30), gap=(2, 7), cut=True)

# 8. 떨어뜨린 우산(붉은 판) — 등불 빛 웅덩이 위
ux, uy = 330, 960
pool = [(ux - 230, uy - 20), (ux - 120, uy - 62), (ux + 80, uy - 66), (ux + 210, uy - 26), (ux + 170, uy + 40), (ux - 40, uy + 58), (ux - 200, uy + 34)]
L.clear(L.poly(spline(pool + [pool[0]], 8)), chatter=0.6, angle=2)
L.hatch(pool, angle=0, spacing=9, width=2.2, dash=(14, 70), gap=(10, 50), cut=False, density=lambda x, y: 0.22)
ux, uy = 330, 960
canopy = [(ux - 110, uy), (ux - 60, uy - 44), (ux, uy - 56), (ux + 60, uy - 44), (ux + 110, uy), (ux + 70, uy - 6), (ux + 36, uy + 4), (ux, uy - 2), (ux - 36, uy + 4), (ux - 70, uy - 6)]
L.outline(L.poly(canopy), 2.6)
L.leave(L.poly(canopy), on=red)
for a in (-70, -36, 0, 36, 70):
    L.gouge([(ux + a*0.2, uy - 54), (ux + a, uy)], 1.8, 'v', on=red, smooth=False)
L.gouge(spline([(ux + 4, uy - 50), (ux + 60, uy - 120), (ux + 92, uy - 140), (ux + 106, uy - 128)], 8), 4.0, 'brush', end=3.5, cut=False)
# 우산 그림자처럼 붉은 물웅덩이 반사
L.hatch([(ux - 90, uy + 30), (ux + 110, uy + 30), (ux + 120, uy + 70), (ux - 100, uy + 70)], angle=0, spacing=8, width=3.0,
        dash=(10, 40), gap=(6, 24), tool='u', on=red, density=lambda x, y: 0.55)

# 9. 가로등 불빛도 붉은 판으로 아주 조금(점등)
L.leave(L.disc(px, 296, 16), on=red)

# 10. 빗방울 튀김 — 검은 곳 위 흰 점
busy = np.clip(wm + L.poly(canopy), 0, 1)
L.speckle(np.clip(L.rect(BX0, BY0, BX1, WALL_TOP) - (busy > 0.01), 0, 1), n=500, size=(1.4, 3.4), angle=104, stars=0.0)

L.chop(BX1 - 26, BY1 - 30, size=26, seed=9)
L.save(out)
print('ok')
