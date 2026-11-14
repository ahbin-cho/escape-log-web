"""신스틸러(서울이스케이프룸 리틀보이 · 잠입 · '이봐 신입, 이번 작전은 말이지...') — 콘크리트 벽 위 스텐실 그라피티.
붉은 레이저 사이로 몸을 낮춘 선배 요원, 뒤에서 손전등을 켠 채 꼿꼿이 선 신입(곧 레이저에 걸릴 것 같다)."""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from stencil import Stencil, BLACK, WHITE, GREY, RED

out = sys.argv[1]
GROUND = 1210
s = Stencil(1080, 1350, seed=31)
s.wall(ground=GROUND)
s.pavement()

# 오래된 흔적: 반쯤 지워진 태그
s.freehand([(80, 300), (120, 240), (150, 300), (170, 250), (210, 300)], '#7d90b8', width=9, coats=1.0, drips=0.2)
s.buff(40, 210, 330, 340)

# 붉은 레이저(손으로 뿌린 가는 선)
for p0, p1 in (((0, 640), (1080, 520)), ((0, 860), (1080, 760)), ((0, 1010), (1080, 1060))):
    s.freehand([p0, ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 6), p1], RED, width=4.5, coats=2.2, drips=0.4, spits=2)

def agent(c, crouch):
    U = np.maximum
    if crouch:   # 선배: 레이저 아래로 몸을 거의 눕힌 자세, 왼손을 들어 '쉿'
        body = c.poly([(-140, -170), (40, -210), (70, -160), (-120, -118)], smooth=True)
        head = c.ellipse((-180, -178), 34, 31)
        cap = c.poly([(-214, -186), (-200, -214), (-166, -218), (-146, -200), (-150, -186)], smooth=True)
        legs = U(U(c.capsule((40, -190), (120, -110), 24, 20), c.capsule((120, -110), (170, -8), 20, 16)),
                 U(c.capsule((10, -170), (40, -80), 22, 18), c.capsule((40, -80), (10, -6), 18, 16)))
        feet = U(c.capsule((170, -8), (210, -4), 14, 12), c.capsule((10, -6), (-30, -2), 14, 12))
        arms = U(c.capsule((-110, -170), (-170, -100), 16, 14), c.capsule((-170, -100), (-176, -10), 14, 12))
        hush = U(c.capsule((-80, -190), (-60, -260), 15, 12), c.capsule((-60, -260), (-50, -300), 11, 9))
        black = U(U(U(body, head), U(cap, legs)), U(U(feet, arms), hush))
        grey = U(c.capsule((-120, -150), (40, -186), 6, 6), c.ellipse((-186, -176), 10, 8))
        return black, grey
    # 신입: 꼿꼿이 서서 손전등을 앞으로, 머리는 레이저 높이
    body = c.poly([(-36, -330), (36, -330), (44, -170), (-44, -170)], smooth=True)
    head = c.ellipse((0, -372), 32, 34)
    legs = U(c.capsule((-20, -176), (-28, -6), 18, 15), c.capsule((20, -176), (30, -6), 18, 15))
    feet = U(c.capsule((-28, -6), (-62, -2), 13, 11), c.capsule((30, -6), (-4, -2), 13, 11))
    arm = U(c.capsule((-30, -310), (-86, -250), 14, 12), c.capsule((-86, -250), (-140, -262), 12, 11))
    torch = c.capsule((-140, -262), (-176, -268), 13, 15)
    black = U(U(U(body, head), U(legs, feet)), arm)
    grey = U(torch, c.poly([(-24, -170), (24, -170), (20, -240), (-20, -240)]))
    return black, grey

for crouch, origin, k in ((True, (430, GROUND - 2), 1.15), (False, (900, GROUND - 2), 1.0)):
    box = (origin[0] - 290 * k, origin[1] - 420 * k, origin[0] + 260 * k, origin[1] + 4)
    cb = s.card(*box, origin=origin, scale=k)
    cg = s.card(*box, origin=origin, scale=k)
    b, g = agent(cb, crouch)
    cb.cut(b); cb.bridges()
    cg.cut(g)
    s.spray(cg, GREY, coats=2.0, misreg=0.0, drips=0.2)
    s.spray(cb, BLACK, coats=2.2, misreg=1.6, drips=0.6)

# 손전등 빛(흰색, 옅게) — 레이저를 향해
s.freehand([(722, 940), (520, 900), (420, 870)], WHITE, width=26, coats=0.7, drips=0.0, spits=0)
s.freehand([(722, 950), (540, 960), (430, 975)], WHITE, width=20, coats=0.5, drips=0.0, spits=0)

# 글자
t1 = s.card(60, 120, 1040, 300, origin=(60, 120))
t1.cut(t1.text('SHHH...', 40, 150, 150, spacing=8))
s.spray(t1, BLACK, coats=2.0, misreg=0.0, drips=1.0, wet=2.2)
t2 = s.card(560, 330, 1040, 430, origin=(560, 330))
t2.cut(t2.text('ROOKIE!', 30, 80, 70, spacing=4))
s.spray(t2, RED, coats=2.0, misreg=0.0, drips=0.6)
s.save(out)
print('ok')
