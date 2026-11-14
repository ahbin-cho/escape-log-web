"""박스오피스(서울이스케이프룸 리틀보이 · 코믹/추리 · '누가 박스를 옮겼을까?') — 1940년대 만화 잡지 표지 화풍.
창고: 쌓인 상자, 바닥에 '사라진 상자' 자국(점선), 돋보기 속 작은 발자국, 문틈으로 살금살금 도망가는 상자 하나."""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from comic import (ComicCover, WHITE, CREAM, PALE, YELLOW, GOLD, ORANGE, RED, PINK, SKIN, TAN, BROWN, DARK_BROWN,
                   LIGHT_BLUE, BLUE, NAVY, LIGHT_GREY, SILVER)
from core import spline

out = sys.argv[1]
c = ComicCover(1080, 1350, seed=12, screen=10.0, misreg=3.6, slop=1.4)
rng = np.random.default_rng(4)
c.paper()
smooth, ell = c.smooth, c.ellipse_pts
FLOOR = 900

# 벽 · 바닥
c.part([(0, 0), (1080, 0), (1080, FLOOR), (0, FLOOR)], LIGHT_BLUE, width=0, line=False)
c.part([(0, FLOOR), (1080, FLOOR), (1080, 1350), (0, 1350)], TAN, width=0, line=False)
c.pen([(0, FLOOR), (1080, FLOOR)], width=5)
for y in range(FLOOR + 60, 1350, 70):                         # 바닥 판자
    c.pen([(0, y), (1080, y + 6)], width=2.0)
# 벽의 선반 그림자 줄
# 벽시계(새벽 3시) — 아무도 없던 시간
c.part(ell(200, 560, 74, 74), CREAM, width=6.5, heavy=1.1)
c.brush([(200, 560), (200, 506)], width=6); c.brush([(200, 560), (240, 560)], width=6); c.dot(200, 560, 7)
for k in range(12):
    a = k * np.pi / 6
    c.pen([(200 + 60 * np.cos(a), 560 + 60 * np.sin(a)), (200 + 68 * np.cos(a), 560 + 68 * np.sin(a))], width=3)

# 뒤쪽 문(열려 있음) — 문틈으로 상자가 살금살금
DX0, DX1, DTOP = 600, 820, 430
c.part([(DX0, DTOP), (DX1, DTOP), (DX1, FLOOR), (DX0, FLOOR)], NAVY, width=5.5)
c.part([(DX1, DTOP), (DX1 + 70, DTOP + 30), (DX1 + 70, FLOOR + 22), (DX1, FLOOR)], GOLD, width=5)
c.dot(DX1 + 52, 680, 7)

def box(x, y, w, h, colour=TAN, tilt=0.0, tape=True):
    p = [(x, y), (x + w, y + tilt), (x + w, y + h + tilt), (x, y + h)]
    c.part(p, colour, width=5.5, heavy=1.0)
    top = [(x, y), (x + 0.22 * w, y - 0.18 * h), (x + 1.22 * w, y - 0.18 * h + tilt), (x + w, y + tilt)]
    c.part(top, CREAM, width=5)
    side = [(x + w, y + tilt), (x + 1.22 * w, y - 0.18 * h + tilt), (x + 1.22 * w, y + 0.82 * h + tilt), (x + w, y + h + tilt)]
    c.part(side, BROWN, width=5)
    if tape:
        c.part([(x + w * 0.42, y - 1), (x + w * 0.58, y - 1), (x + w * 0.58, y + h * 0.35), (x + w * 0.42, y + h * 0.35)], GOLD, width=3)
    return p

# 도망가는 상자: 문틈 앞, 작은 다리 두 개, 땀방울, 속도선
bx, by, bw, bh = 650, 770, 120, 92
box(bx, by, bw, bh, tilt=-6)
for lx, dx in ((bx + 26, -20), (bx + 86, 18)):
    c.brush([(lx, by + bh - 2), (lx + dx * 0.5, by + bh + 26), (lx + dx, by + bh + 40)], width=7)
    c.part(ell(lx + dx + 6, by + bh + 44, 14, 7), RED, width=4)
c.dot(bx + 40, by + 34, 6); c.dot(bx + 78, by + 32, 6)               # 놀란 눈
c.part(smooth([(bx + 128, by - 8), (bx + 140, by - 34), (bx + 152, by - 8), (bx + 140, by + 2)], 6), LIGHT_BLUE, width=3)
c.speed((bx + 170, by + 40), (1.0, 0.0), n=5, length=120, spread=70, width=3.4, seed=2)

# 오른쪽 앞: 쌓인 상자 더미
box(830, 760, 170, 140); box(860, 630, 150, 120, colour=CREAM); box(820, 520, 130, 104)
# 바닥: 사라진 상자 자리(먼지 없는 사각형 + 점선) 와 물음표
gap = [(210, 990), (430, 990), (480, 1060), (250, 1060)]
c.part(gap, PALE, width=0, line=False)
P = np.array(gap + [gap[0]], np.float32)
for (x0, y0), (x1, y1) in zip(P[:-1], P[1:]):
    for t in np.linspace(0, 1, 9)[:-1]:
        c.pen([(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t), (x0 + (x1 - x0) * (t + 0.07), y0 + (y1 - y0) * (t + 0.07))], width=4)
c.letter('?', 345, 1018, 64, face='heavy', colour=RED)

# 바닥 위 작은 발자국(상자 다리 자국)이 문 쪽으로
for k, (fx, fy) in enumerate([(470, 1000), (520, 975), (560, 950), (600, 930), (640, 912)]):
    c.part(ell(fx, fy, 9 - k * 0.6, 5 - k * 0.3), DARK_BROWN, width=0, line=False)

# 앞쪽: 탐정의 손과 큰 돋보기(렌즈 안 발자국 확대)
LX, LY, LR = 330, 1180, 150
c.part(ell(LX, LY, LR, LR), PALE, width=9, heavy=1.2)
c.part(ell(LX, LY, LR - 18, LR - 18), CREAM, width=3)
for k, (fx, fy) in enumerate([(280, 1210), (340, 1170), (400, 1140)]):
    c.part(ell(fx, fy, 24, 13), DARK_BROWN, width=3)
c.part(smooth([(LX + 110, LY + 100), (LX + 210, LY + 200), (LX + 250, LY + 170), (LX + 140, LY + 76)], 6), DARK_BROWN, width=6)
c.part(smooth([(LX + 200, LY + 150), (LX + 300, LY + 120), (LX + 330, LY + 200), (LX + 250, LY + 250)], 6), SKIN, width=5.5)
c.brush([(LX - 70, LY - 90), (LX - 30, LY - 120)], width=10)        # 렌즈 반짝임
c.part([(LX + 300, LY + 110), (LX + 420, LY + 60), (LX + 420, LY + 260), (LX + 320, LY + 250)], ORANGE, width=5.5)  # 소매

# 글자: 로고, 캡션, 말풍선, 효과음
c.logo('WHO MOVED', [(60, 52), (1020, 40), (1020, 160), (60, 168)], vp=(540, 2400), depth=20)
c.logo('THE BOX?', [(150, 176), (930, 168), (930, 288), (150, 296)], vp=(540, 2400), depth=20,
       colours=(PINK, RED, RED), shade=NAVY)
c.caption(40, 330, 470, 430, 'A MYSTERY AT THE\nLITTLE BOY OFFICE!', 26)
c.balloon('IT WAS RIGHT\nHERE A MINUTE\nAGO!!', 220, 820, 30, tail=(330, 1010), kind='yell', seed=5)
c.sfx('TIPTOE...', 700, 700, 46, colour=YELLOW, rot=-8, width=5)
c.brown_edges(width=45, amount=0.8)
c.corner('br', radius=60)
c.save(out)
print('ok')
