"""릴스 '마지막 자물쇠' 손그림(만화) 장면. python3 scene_cartoon.py <out_dir> [name]"""
import os, sys, time
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from cartoon import Cartoon

W, H = 1080, 1920
R = Cartoon.rrect_pts
E = Cartoon.ellipse_pts
WOOD, WOOD_D, METAL, METAL_D, BRASS, BRASS_D = '#b9773f', '#93582b', '#cfcabd', '#a39d8f', '#f2b23e', '#d18a1f'
STATES = [('a0', '0000', 0, False), ('a0j', '0000', 24, False), ('b1', '1000', 0, False), ('b2', '1100', 0, False),
          ('b3', '1120', 0, False), ('c4', '1124', 0, False), ('c4j', '1124', 24, False), ('c7', '1127', 0, False),
          ('c7j', '1127', 24, False), ('c8', '1128', 0, False), ('c8j', '1128', 24, False), ('d9', '1129', 0, False),
          ('e9', '1129', 0, True)]


def scene(digits, dy, opened, seed):
    c = Cartoon(W, H, seed=seed)
    c.paper('#7a5a48')
    # 벽 널빤지·바닥
    c.fill(R(-20, -20, W + 20, 1450, 0), '#86634e', slop=0)
    for x in range(0, W + 1, 216):
        c.line([(x, -10), (x + 3, 1450)], 5, rough=False)
    for (x, y, l) in [(60, 300, 90), (300, 900, 70), (700, 180, 110), (930, 1150, 80), (480, 620, 60)]:
        c.line([(x, y), (x + 4, y + l)], 3, rough=False)
    c.shape(R(-20, 1440, W + 20, H + 20, 0), '#5a4033', width=6)
    for y in (1620, 1790):
        c.line([(0, y), (W, y + 6)], 4, rough=False)
    # 타이머 판
    c.shape(R(230, 270, 850, 560, 36), '#4a505a', shade=('#363b43', -10, -10), width=8)
    c.shape(R(268, 306, 812, 524, 20), '#14161a', width=5)
    # 벽 소품
    c.line([(140, 600), (138, 700)], 4)
    c.shape(E(140, 740, 34, 34), '#e2bb4b', width=5); c.shape(E(140, 740, 12, 12), '#86634e', width=4)
    c.shape(R(128, 772, 152, 880, 6), '#e2bb4b', width=5)
    c.shape(R(150, 836, 178, 852, 3), '#e2bb4b', width=4); c.shape(R(150, 862, 172, 878, 3), '#e2bb4b', width=4)
    c.shape(R(820, 700, 1000, 930, 12), '#5c3f2d', shade=('#48301f', -8, -8), width=7)
    c.shape(R(846, 726, 974, 904, 6), '#eadfc4', width=4)
    c.line([(872, 860), (900, 800), (930, 840), (952, 780)], 6)
    # 상자
    c.hatch(R(150, 1596, 960, 1640, 10), spacing=12)
    c.shape(R(130, 1160, 950, 1600, 22), WOOD, shade=(WOOD_D, -14, -14), width=9)
    for y in (1300, 1440):
        c.line([(150, y), (930, y + 4)], 5, rough=False)
    c.shape(R(110, 1010, 970, 1190, (80, 80, 14, 14)), WOOD, shade=(WOOD_D, -12, -12), width=9)
    c.glint([(170, 1052), (300, 1040), (420, 1038)], 9)
    for x in (210, 800):
        c.shape(R(x, 1004, x + 70, 1606, 8), METAL, shade=(METAL_D, -8, -8), width=7)
        for y in (1050, 1230, 1400, 1560):
            c.dot(x + 35, y, 8)
    c.shape(R(482, 1090, 598, 1260, 12), METAL, shade=(METAL_D, -6, -6), width=6)
    c.shape(E(540, 1228, 28, 28), METAL_D, width=5); c.dot(540, 1228, 10)
    # 자물쇠
    sy = dy - (100 if opened else 0)
    rleg = 1250 if opened else 1320
    th = np.linspace(np.pi, 0, 24)
    cy = 1214 + sy
    outer = ([(396, 1440 + sy)] + [(540 + 144 * np.cos(t), cy - 144 * np.sin(t)) for t in th] + [(684, rleg + sy), (620, rleg + sy)]
             + [(540 + 80 * np.cos(t), cy - 80 * np.sin(t)) for t in th[::-1]] + [(460, 1440 + sy)])
    c.shape(np.array(outer, np.float32), '#e3e7ea', shade=('#b4bbc1', -9, -9), width=8)
    by = dy + (26 if opened else 0)
    c.shape(R(310, 1280 + by, 770, 1590 + by, 46), BRASS, shade=(BRASS_D, -16, -16), width=10)
    c.glint([(350, 1322 + by), (470, 1312 + by), (600, 1312 + by)], 11)
    for i, d in enumerate(digits):
        x0 = 352 + i * 97
        c.shape(R(x0, 1384 + by, x0 + 82, 1540 + by, 12), '#2b2420', width=5)
        c.note(d, x0 + 41, 1506 + by, 118, colour='#fff6e0', anchor='m', tilt=5.0)
    if opened:
        c.pop_lines(540, 1150, 150, 210, [200, 235, 270, 305, 340], width=7)
        c.sparkle(300, 1130, 34); c.sparkle(800, 1220, 26)
    return c


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, d, dy, op in STATES:
        if only and name != only: continue
        for v in (1, 2):
            t = time.time()
            scene(d, dy, op, seed=v * 7 + 3).save(f'{out}/{name}_{v}.jpg', quality=80)
            print(name, v, round(time.time() - t, 1), flush=True)
