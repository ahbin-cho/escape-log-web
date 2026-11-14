"""자동 릴스 3편의 배경 판화(리노컷, 1080×1920). 먹판 + 색판 1개. 공식 포스터·사진을 쓰지 않고 줄거리 첫 문장에서 떠오르는 장면을 새로 새긴다.
사용: python3 tools/ig/drawings/reel_scenes.py <sungji|morgue|chunhwa> out.jpg"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from linocut import Linocut

which, out = sys.argv[1], sys.argv[2]
W, H = 1080, 1920
L = Linocut(W, H, block=(0, 0, W, H), seed={'sungji': 5, 'morgue': 8, 'chunhwa': 13}[which])
rng = np.random.default_rng(4)
line = lambda a, b, w=2.6: L.gouge([a, b], w, 'v', smooth=False)

def quad_lines(pts, w=2.6):
    for i in range(len(pts)): line(pts[i], pts[(i + 1) % len(pts)], w)

if which == 'sungji':
    # 기숙학원 복도: 한 점 투시, 양쪽에 번호 없는 방문, 천장등 하나, 복도 끝에 열린 문
    red = L.colour_block('#b8322a', offset=(3, -2))
    vx, vy = 540, 1090
    far = (430, 960, 650, 1240)             # 복도 끝 벽
    near = (-60, 520, 1140, 1980)
    corners_n = [(near[0], near[1]), (near[2], near[1]), (near[2], near[3]), (near[0], near[3])]
    corners_f = [(far[0], far[1]), (far[2], far[1]), (far[2], far[3]), (far[0], far[3])]
    for a, b in zip(corners_n, corners_f): line(a, b, 3.2)
    quad_lines(corners_f, 3.0)
    lerp = lambda a, b, t: (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
    # 방문: 벽을 따라 줄어드는 사각형
    for side in (0, 1):
        top_n, top_f = (corners_n[0], corners_f[0]) if side == 0 else (corners_n[1], corners_f[1])
        bot_n, bot_f = (corners_n[3], corners_f[3]) if side == 0 else (corners_n[2], corners_f[2])
        for t0, t1 in ((0.18, 0.40), (0.50, 0.66), (0.73, 0.84), (0.88, 0.95)):
            a, b = lerp(top_n, top_f, t0), lerp(top_n, top_f, t1)
            c, d = lerp(bot_n, bot_f, t1), lerp(bot_n, bot_f, t0)
            dt = lambda p, q, k: lerp(p, q, k)
            door = [dt(a, d, 0.22), dt(b, c, 0.22), c, d]
            quad_lines(door, 2.6)
            # 문 위 작은 창(불 꺼짐)과 손잡이
            win = [dt(door[0], door[3], 0.08), dt(door[1], door[2], 0.08), dt(door[1], door[2], 0.22), dt(door[0], door[3], 0.22)]
            quad_lines(win, 1.8)
            k = dt(dt(door[0], door[3], 0.55), dt(door[1], door[2], 0.55), 0.82 if side == 0 else 0.18)
            L.clear(L.disc(k[0], k[1], 5 * (1 - t0) + 2), chatter=0)
    # 바닥: 젖은 듯한 가로 반사
    floor = [corners_n[3], corners_n[2], corners_f[2], corners_f[3]]
    L.hatch(floor, angle=0, spacing=13, width=2.4, dash=(16, 90), gap=(20, 110), cut=True,
            density=lambda x, y: float(np.clip(0.75 * np.exp(-((x - vx) / 150) ** 2), 0.03, 0.8)))
    # 천장등과 빛 원뿔
    lx, ly = 540, 770
    L.clear(L.rect(lx - 70, ly - 12, lx + 70, ly + 6), chatter=0)
    cone = [(lx - 60, ly + 8), (lx + 60, ly + 8), (lx + 250, 1900), (lx - 250, 1900)]
    L.hatch(cone, angle=90, spacing=17, width=2.0, dash=(30, 160), gap=(40, 200), cut=True,
            density=lambda x, y: float(np.clip(0.5 - (y - ly) / 2600, 0.08, 0.5)))
    # 복도 끝: 열린 문(환한 틈) 안에 선 사람
    L.clear(L.rect(505, 1030, 585, 1238), chatter=0.25, angle=90)
    fig = [(532, 1238), (528, 1140), (534, 1108), (545, 1092), (556, 1108), (562, 1140), (558, 1238)]
    L.leave(L.poly(fig))
    L.leave(L.disc(545, 1082, 13))
    # 맨 앞 왼쪽 문 하나만 살짝 열림 — 붉은 틈
    gap = L.poly([(92, 900), (124, 916), (124, 1786), (92, 1856)])
    L.clear(gap, chatter=0); L.leave(gap, on=red)
    L.speckle(L.rect(0, 0, W, 700), n=160, size=(1.2, 2.6), angle=90, stars=0.0)

elif which == 'morgue':
    # 영안실: 스테인리스 냉장 서랍 벽(3×4), 가운데 한 칸만 열려 있고 발에 꼬리표
    teal = L.colour_block('#3f8f86', offset=(3, -2))
    X0, Y0, CW, CH = 90, 760, 300, 215
    for r in range(4):
        for c in range(3):
            x, y = X0 + c * CW, Y0 + r * CH
            if (r, c) == (2, 1): continue
            quad_lines([(x + 10, y + 10), (x + CW - 10, y + 10), (x + CW - 10, y + CH - 10), (x + 10, y + CH - 10)], 2.8)
            L.clear(L.rect(x + CW / 2 - 46, y + CH - 60, x + CW / 2 + 46, y + CH - 48), chatter=0)          # 손잡이
            L.clear(L.rect(x + 28, y + 30, x + 86, y + 58), chatter=0.15)                                       # 이름표
            L.hatch([(x + 20, y + 20), (x + CW - 20, y + 20), (x + CW - 20, y + CH - 20), (x + 20, y + CH - 20)], angle=78,
                    spacing=22, width=1.8, dash=(20, 90), gap=(60, 200), cut=True, density=lambda xx, yy: 0.16)
    # 열린 칸: 안쪽은 새까맣고, 판이 앞으로 나와 있다
    x, y = X0 + CW, Y0 + 2 * CH
    quad_lines([(x + 10, y + 10), (x + CW - 10, y + 10), (x + CW - 10, y + CH - 10), (x + 10, y + CH - 10)], 4.0)
    tray = [(x + 26, y + CH - 40), (x + CW - 26, y + CH - 40), (x + CW + 70, y + CH + 250), (x - 70, y + CH + 250)]
    L.clear(L.poly(tray), chatter=0.5, angle=4)
    L.outline(L.poly(tray), 3.0)
    # 천을 덮은 발 두 개(먹) + 꼬리표(색판)
    for fx in (x + CW / 2 - 60, x + CW / 2 + 50):
        foot = [(fx - 34, y + CH + 205), (fx - 30, y + CH + 60), (fx - 14, y + CH + 20), (fx + 14, y + CH + 20), (fx + 30, y + CH + 60), (fx + 34, y + CH + 205)]
        L.leave(L.poly(foot, smooth=True))
        L.gouge([(fx - 12, y + CH + 70), (fx - 14, y + CH + 190)], 2.2, 'v', smooth=False)
        L.gouge([(fx + 10, y + CH + 80), (fx + 12, y + CH + 190)], 2.0, 'v', smooth=False)
    # 천장 형광등과 차가운 빛
    L.clear(L.rect(300, 600, 780, 622), chatter=0)
    cone = [(300, 626), (780, 626), (1010, 1900), (70, 1900)]
    L.hatch(cone, angle=90, spacing=19, width=1.8, dash=(26, 150), gap=(60, 240), cut=True,
            density=lambda xx, yy: float(np.clip(0.34 - (yy - 620) / 4200, 0.06, 0.34)))
    # 바닥 타일
    FY = Y0 + 4 * CH + 20
    line((0, FY), (W, FY), 3.2)
    for i in range(-8, 9): line((540 + i * 90, FY), (540 + i * 260, 1930), 1.8)
    for yy in (FY + 60, FY + 150, FY + 270): line((0, yy), (W, yy), 1.8)
    L.leave(L.poly([(x + CW / 2 + 92, y + CH + 96), (x + CW / 2 + 150, y + CH + 110), (x + CW / 2 + 140, y + CH + 190), (x + CW / 2 + 82, y + CH + 176)]), on=teal)
    L.speckle(L.rect(0, 0, W, 560), n=120, size=(1.2, 2.4), angle=90, stars=0.0)

else:
    # 춘화각: 달 뜬 밤의 누각 대문, 처마 끝 붉은 등 둘, 문에 붙은 부적, 끝방 문만 열려 있다
    red = L.colour_block('#c2452a', offset=(3, -2))
    L.flow([(0, 0), (W, 0), (W, 980), (0, 980)], lambda x, y: 4 + 5 * np.sin(y / 130), n=150, length=(120, 420), width=(1.2, 2.6), step=3.0,
           density=lambda x, y: 0.22 + 0.25 * np.exp(-((y - 700) / 220) ** 2))
    L.moon(800, 640, 92)
    # 지붕(먹): 처마 끝이 들린 팔작지붕
    roof = [(-40, 1120), (60, 1040), (220, 960), (540, 900), (860, 960), (1020, 1040), (1120, 1120), (1010, 1150), (540, 1128), (70, 1150)]
    rm = L.poly(roof, smooth=True)
    L.outline(rm, 3.2); L.leave(rm)
    for i in range(-11, 12):
        xa = 540 + i * 40; xb = 540 + i * 52
        L.gouge([(xa, 930 + abs(i) * 5.5), (xb, 1120 - abs(i) * 0.5)], 1.8, 'v', smooth=False)
    L.gouge([(60, 1132), (540, 1112), (1020, 1132)], 3.2, 'v', smooth=True)
    # 기둥과 문짝
    BY = 1150
    for px in (120, 400, 680, 960):
        L.clear(L.rect(px - 16, BY, px + 16, 1900), chatter=0.3, angle=90)
    for i, x0 in enumerate((152, 432, 712)):
        x1 = x0 + 216
        if i == 2:
            # 끝방: 문이 열려 있고 안에서 붉은 빛
            L.clear(L.rect(x0 + 10, BY + 60, x1 - 10, 1880), chatter=0)
            L.leave(L.rect(x0 + 10, BY + 60, x1 - 10, 1880), on=red)
            L.leave(L.poly([(x0 + 96, 1880), (x0 + 90, 1640), (x0 + 100, 1590), (x0 + 112, 1570), (x0 + 124, 1590), (x0 + 134, 1640), (x0 + 128, 1880)]))
            L.leave(L.disc(x0 + 112, 1556, 20))
            L.leave(L.poly([(x0 + 76, 1548), (x0 + 148, 1548), (x0 + 132, 1532), (x0 + 92, 1532)]))   # 갓
            continue
        quad_lines([(x0 + 10, BY + 60), (x1 - 10, BY + 60), (x1 - 10, 1880), (x0 + 10, 1880)], 2.6)
        for gx in range(x0 + 46, x1 - 20, 36): line((gx, BY + 70), (gx, 1500), 1.6)
        for gy in range(BY + 110, 1500, 46): line((x0 + 14, gy), (x1 - 14, gy), 1.6)
        # 부적
        tx = x0 + 108
        L.clear(L.rect(tx - 24, 1560, tx + 24, 1730), chatter=0.2, angle=90)
        L.leave(L.rect(tx - 12, 1580, tx + 12, 1588), on=red); L.leave(L.rect(tx - 4, 1596, tx + 4, 1700), on=red)
        L.leave(L.rect(tx - 14, 1640, tx + 14, 1648), on=red)
    # 처마 끝 등 둘(색판) — 영상에서 불빛이 흔들린다
    for lx in (200, 880):
        line((lx, 1100), (lx, 1180), 2.0)
        L.clear(L.poly([(lx - 34, 1190), (lx + 34, 1190), (lx + 42, 1250), (lx + 34, 1310), (lx - 34, 1310), (lx - 42, 1250)], smooth=True), chatter=0)
        L.leave(L.poly([(lx - 30, 1194), (lx + 30, 1194), (lx + 38, 1250), (lx + 30, 1306), (lx - 30, 1306), (lx - 38, 1250)], smooth=True), on=red)
    L.speckle(L.rect(0, 0, W, 560), n=260, size=(1.2, 2.8), angle=90, stars=0.03)

L.save(out, quality=92)
print('ok', out)
