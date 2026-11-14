"""미명도감 — '포획한 어둑시니 표본' 정물(리소 인쇄). 밝은 부분은 종이를 남긴다(잉크는 겹쳐 찍힘)."""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from editorial import Editorial
from core import spline

out = sys.argv[1]
TEAL, SAL, INK, MUS, RED = '#5f9e98', '#e8907e', '#2b2a33', '#e0a93d', '#b8322a'
e = Editorial(1080, 1350, seed=77)
TABLE = 930
cl = lambda m: np.clip(m, 0, 1)

# 모양(마스크) 먼저
JX, JY0, JY1, JW = 540, 470, 930, 300
jar = e.rrect(JX - JW / 2, JY0 + 40, JX + JW / 2, JY1, 60)
lid = e.rrect(JX - JW / 2 - 20, JY0, JX + JW / 2 + 20, JY0 + 60, 14)
label = e.rrect(JX - 100, JY0 + 140, JX + 100, JY0 + 250, 8)
P = spline([(-20, 120), (300, 200), (560, 215), (820, 190), (1100, 110)], 30)
tags = []
for k, t in enumerate(np.linspace(0.08, 0.92, 7)):
    x, y = P[int(t * (len(P) - 1))]
    tags.append(((x, y), e.poly([(x - 27, y), (x + 27, y), (x + 31, y + 120), (x - 23, y + 120)])))
tagmask = cl(sum(m for _, m in tags))
bulb = e.circle(760, 370, 40)
cb_pts = [(70, 1030), (330, 980), (380, 1300), (120, 1350)]
clip = e.poly(cb_pts)
wall = cl(e.poly([(0, 0), (1080, 0), (1080, TABLE), (0, TABLE)]) - jar - lid - tagmask - bulb)
desk = cl(e.poly([(0, TABLE), (1080, TABLE - 20), (1080, 1350), (0, 1350)]) - clip - jar)

# 잉크 1: 청록 벽(아래로 갈수록 망점), 연어빛 책상
e.fill(wall, TEAL)
e.halftone(wall * cl((e.YY - 300) / 800), INK, cell=12, angle=0.5, amount=0.22)
e.fill(desk, SAL)
e.halftone(desk * cl((e.YY - TABLE) / 500), RED, cell=10, angle=0.3, amount=0.2)
# 병 유리: 옅은 청록 망점만(종이 비침)
e.halftone(jar * cl((e.XX - JX) / JW + 0.2), TEAL, cell=9, angle=0.7, amount=0.45)
e.fill(lid, MUS)
for (x, y), m in tags[1::2]: e.fill(m, MUS)
e.fill(bulb, MUS)
e.halftone(cl(e.circle(760, 400, 240) * (e.YY > 380) - jar), MUS, cell=12, angle=0.2, amount=0.35)

# 병 속 어둑시니(눈은 종이로 남김)
eyes = cl(e.ellipse(JX - 50, JY1 - 200, 26, 30) + e.ellipse(JX + 30, JY1 - 200, 26, 30))
e.fill(cl(e.blob(JX - 10, JY1 - 150, 120, 120, rough=0.18) - eyes - label), INK)
e.fill(e.circle(JX - 44, JY1 - 192, 11), RED); e.fill(e.circle(JX + 36, JY1 - 192, 11), RED)
e.fill(e.blob(JX + 120, JY1 - 300, 12, 18, rough=0.1), TEAL)

# 선(먹)
e.line(P, INK, width=4)
for (x, y), m in tags:
    e.line([(x - 27, y), (x + 27, y), (x + 31, y + 120), (x - 23, y + 120)], INK, width=3, closed=True)
    for j in range(3):
        e.line([(x - 12, y + 30 + j * 28), (x + 2, y + 20 + j * 28), (x + 16, y + 32 + j * 28)], RED, width=3, wobble=1.0)
e.line([(760, 0), (760, 330)], INK, width=3); e.line([(720, 370), (760, 330), (800, 370)], INK, width=3)
e.line([(JX - JW / 2, JY0 + 100), (JX - JW / 2, JY1 - 60), (JX - JW / 2 + 60, JY1), (JX + JW / 2 - 60, JY1),
        (JX + JW / 2, JY1 - 60), (JX + JW / 2, JY0 + 100)], INK, width=5)
e.line([(JX - JW / 2 + 36, JY0 + 120), (JX - JW / 2 + 36, JY1 - 80)], INK, width=2, breaks=0.5)
e.line([(JX - JW / 2 - 20, JY0), (JX + JW / 2 + 20, JY0), (JX + JW / 2 + 20, JY0 + 60), (JX - JW / 2 - 20, JY0 + 60)], INK, width=4, closed=True)
for x in range(JX - JW // 2, JX + JW // 2 + 1, 30): e.line([(x, JY0 + 8), (x, JY0 + 52)], INK, width=2)
e.line([(JX - 100, JY0 + 140), (JX + 100, JY0 + 140), (JX + 100, JY0 + 250), (JX - 100, JY0 + 250)], INK, width=3, closed=True)
e.line([(JX - 70, JY0 + 222), (JX + 70, JY0 + 222)], RED, width=3)
e.line([(0, TABLE), (1080, TABLE - 20)], INK, width=5)
for y in (1040, 1150, 1260): e.line([(380, y + 2), (1080, y - 10)], INK, width=2, wobble=2.2, breaks=0.3)
# 클립보드
e.line(cb_pts, INK, width=4, closed=True)
e.fill(e.rrect(170, 975, 260, 1010, 8), MUS)
for k in range(6):
    y = 1070 + k * 40
    e.line([(125 + k * 6, y + 10), (330 + k * 6, y - 30)], INK, width=2, wobble=1.4)
e.line([(150, 1262), (205, 1300), (300, 1205)], RED, width=6)
# 손전등과 빛
fl = [(820, 1040), (980, 990), (1000, 1050), (840, 1100)]
e.fill(e.poly(fl), INK)
e.fill(e.poly([(820, 1040), (840, 1100), (790, 1110), (775, 1030)]), MUS)
e.halftone(cl(e.poly([(780, 1035), (790, 1110), (650, 900), (700, 780)]) - jar), MUS, cell=10, angle=0.4, amount=0.55)
e.save(out)
print('ok')
