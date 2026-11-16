"""릴스 '마지막 자물쇠' 점토 스톱모션 장면. python3 scene.py <out_dir>  (claude-drawing-skill 의 clay 사용)"""
import os, sys, time
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from clay import Clay
from core import spline

W, H = 1080, 1920
WOOD, WOOD2, METAL, BRASS, DARK = '#9a6338', '#7d4e2a', '#b9b3a6', '#eaa838', '#2b2420'


def scene(digits='0000', dy=0, opened=False, ghost='idle', seed=1):
    c = Clay(W, H, seed=seed, light=(-0.45, -0.6, 0.62))
    rng = c.rng
    # 벽
    c.backdrop('#6b4d3c')
    for x in range(-20, W, 216):
        c.pad(c.rrect(x + 6, -40, x + 210, 1460, 10), '#74543f' if (x // 216) % 2 else '#6d4e3b', height=9, round=7)
    # 바닥
    c.pad(c.rrect(-40, 1440, W + 40, H + 40, 10), '#4a362b', height=16, round=8, marble=('#3d2c23', 0.3))
    for y in (1600, 1770):
        c.groove([(0, y), (W, y + 6)], 7, 4)
    # 타이머 판(숫자는 영상에서 얹는다)
    c.pad(c.rrect(230, 270, 850, 560, 40), '#3a3f47', height=30, round=18)
    c.pad(c.rrect(268, 306, 812, 524, 26), '#15171a', height=3, round=6, texture=0.3)
    for (x, y) in [(250, 290), (830, 290), (250, 540), (830, 540)]:
        c.ball(x, y, 9, METAL)
    # 벽 소품: 걸린 열쇠, 액자
    c.ball(140, 600, 12, METAL)
    c.snake([(140, 612), (136, 680), (140, 740)], 5, '#d9b34a')
    c.pad(c.circle(140, 768, 30), '#d9b34a', height=12, round=8); c.poke(140, 768, 12, 10)
    c.snake([(140, 798), (140, 880)], 8, '#d9b34a'); c.snake([(140, 850), (166, 850)], 6, '#d9b34a'); c.snake([(140, 876), (162, 876)], 6, '#d9b34a')
    c.pad(c.rrect(820, 700, 1000, 930, 14), '#4d3526', height=22, round=10)
    c.pad(c.rrect(846, 726, 974, 904, 8), '#c9b68f', height=3, round=5)
    c.snake([(872, 860), (900, 800), (930, 840), (952, 780)], 5, '#b0563f')
    # 상자
    c.pad(c.rrect(110, 1010, 970, 1200, 70), WOOD, height=60, round=40, marble=(WOOD2, 0.35))          # 뚜껑
    c.pad(c.rrect(130, 1160, 950, 1600, 26), WOOD, height=52, round=20, marble=(WOOD2, 0.35))           # 몸통
    for y in (1300, 1440):
        c.groove([(140, y), (940, y + 4)], 8, 7)
    c.groove([(132, 1178), (948, 1178)], 12, 12)
    for x in (210, 800):
        c.pad(c.rrect(x, 1004, x + 70, 1606, 12), METAL, height=14, round=7)
        for y in (1050, 1230, 1400, 1560):
            c.ball(x + 35, y, 13, '#8f897d')
    c.pad(c.rrect(482, 1090, 598, 1260, 16), METAL, height=16, round=8)                                 # 걸쇠
    c.pad(c.circle(540, 1228, 34), '#8f897d', height=14, round=8); c.poke(540, 1228, 16, 14)
    # 자물쇠
    sy = dy - (100 if opened else 0)
    rleg = 1250 if opened else 1440
    shackle = [(430, 1440 + sy), (430, 1200 + sy), (470, 1130 + sy), (540, 1104 + sy), (610, 1130 + sy), (650, 1200 + sy), (650, rleg + sy)]
    c.snake(shackle, 30, '#cfd3d6', gloss=2.2)
    by = dy + (26 if opened else 0)
    c.pad(c.rrect(310, 1280 + by, 770, 1590 + by, 50), BRASS, height=64, round=34, marble=('#d58f25', 0.3), gloss=1.6)
    c.pad(c.rrect(336, 1306 + by, 744, 1352 + by, 22), '#f6c868', height=8, round=10)                    # 윗면 띠
    for i, d in enumerate(digits):
        x0 = 352 + i * 97
        c.pad(c.rrect(x0, 1384 + by, x0 + 82, 1540 + by, 14), DARK, height=4, round=6, texture=0.3)
        c.text(d, x0 + 41, 1464 + by, 118, '#f3ead8', height=12, round=5)
    # 탈출귀
    g(c, 930 if ghost == 'joy' else 890, 1690, ghost)
    return c


def g(c, cx, cy, pose):
    if pose == 'joy': cy -= 70
    WHT = '#fbf6ea'
    up = pose == 'joy'
    for s in (-1, 1):                                              # 팔
        tip = (cx + s * 150, cy - (120 if up else -10))
        c.snake([(cx + s * 70, cy - 10), (cx + s * 118, cy - (60 if up else 20)), tip], 34, WHT, taper=(1.0, 0.75))
    body = [(cx - 112, cy + 60), (cx - 118, cy - 50), (cx - 84, cy - 150), (cx, cy - 190), (cx + 84, cy - 150), (cx + 118, cy - 50), (cx + 116, cy + 60),
            (cx + 150, cy + 150), (cx + 96, cy + 128), (cx + 60, cy + 168), (cx + 14, cy + 124), (cx - 34, cy + 168), (cx - 74, cy + 124), (cx - 112, cy + 150)]
    P = spline(body + [body[0]], 12)
    c.pad(c.poly(P), WHT, height=66, round=30, gloss=1.4)
    ey = cy - 70
    for s in (-1, 1):
        c.pad(c.circle(cx + s * 62, ey + 44, 22), '#f7c9a8', height=2, round=8)            # 볼
        if pose == 'worry':
            c.pad(c.ellipse(cx + s * 38, ey, 15, 20), '#2a2320', height=8, round=6, gloss=3)
            c.snake([(cx + s * 62, ey - 30), (cx + s * 24, ey - 46)], 5, '#2a2320')            # 걱정 눈썹
        elif pose == 'joy':
            c.snake([(cx + s * 38 - 18, ey + 6), (cx + s * 38, ey - 12), (cx + s * 38 + 18, ey + 6)], 6, '#2a2320')
        else:
            c.pad(c.ellipse(cx + s * 38, ey, 16, 21), '#2a2320', height=8, round=6, gloss=3)
        if pose != 'joy': c.ball(cx + s * 38 - 5, ey - 7, 5, '#ffffff')
    if pose == 'worry':
        c.snake([(cx - 18, ey + 54), (cx - 6, ey + 46), (cx + 6, ey + 54), (cx + 18, ey + 46)], 4.5, '#2a2320')
        c.pad(c.poly(spline([(cx + 96, ey - 70), (cx + 112, ey - 40), (cx + 96, ey - 26), (cx + 80, ey - 40), (cx + 96, ey - 70)], 8)), '#9ad3f0', height=10, round=6)
    elif pose == 'joy':
        c.pad(c.ellipse(cx, ey + 52, 26, 22), '#7a2f2a', height=3, round=6)
        c.pad(c.ellipse(cx, ey + 62, 15, 10), '#f08a7a', height=4, round=5)
    else:
        c.snake([(cx - 16, ey + 44), (cx, ey + 54), (cx + 16, ey + 44)], 4.5, '#2a2320')
        c.pad(c.ellipse(cx + 2, ey + 60, 9, 8), '#f08a7a', height=5, round=4)


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    only = sys.argv[2] if len(sys.argv) > 2 else None
    # (이름, 숫자, 당김, 열림, 표정)
    S = [('a0', '0000', 0, False, 'idle'), ('a0j', '0000', 24, False, 'idle'),
         ('b1', '1000', 0, False, 'idle'), ('b2', '1100', 0, False, 'idle'), ('b3', '1120', 0, False, 'idle'),
         ('c4', '1124', 0, False, 'worry'), ('c4j', '1124', 24, False, 'worry'),
         ('c7', '1127', 0, False, 'worry'), ('c7j', '1127', 24, False, 'worry'),
         ('c8', '1128', 0, False, 'worry'), ('c8j', '1128', 24, False, 'worry'),
         ('d9', '1129', 0, False, 'worry'), ('e9', '1129', 0, True, 'joy')]
    for name, d, dy, op, gh in S:
        if only and name != only: continue
        for v in (1, 2):
            t = time.time()
            scene(d, dy, op, gh, seed=v * 7 + 3).composite().save(f'{out}/{name}_{v}.jpg', quality=90)
            print(name, v, round(time.time() - t, 1), flush=True)
