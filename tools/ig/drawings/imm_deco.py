"""이머시브(배우가 있는 방) 표지·스토리 배경 — 아르데코 극장 포스터(에어브러시): 금빛 프로시니엄, 붉은 막, 무대 조명,
모자 쓴 배우가 객석에서 올라온 사람에게 손을 내민다. 사진·공식 이미지를 쓰지 않고 새로 그린다.
사용: python3 tools/ig/drawings/imm_deco.py out.jpg [feed|story] [curtains: 1|0]"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from artdeco import ArtDeco

out = sys.argv[1]; kind = sys.argv[2] if len(sys.argv) > 2 else 'feed'; curtains = (sys.argv[3] if len(sys.argv) > 3 else '1') == '1'
W, H = (1080, 1350) if kind == 'feed' else (1080, 1920)
A = ArtDeco(W, H, seed=15)
OY = 0 if kind == 'feed' else 420          # 스토리는 무대를 아래로 내린다(위는 제목 자리)
STAGE = 1010 + OY                           # 무대 바닥 앞선
cx = 540

# 1. 극장 안 어둠: 남색 → 보라
A.sky([(0, '#070b1f'), (0.5, '#141a3c'), (1, '#241634')], top=0, bottom=H)
# 2. 무대 안쪽 벽과 금빛 방사선(무대 뒤 조명)
back = A.rect(150, 330 + OY, 930, STAGE)
A.fade(back, [(0, '#0d1230'), (0.6, '#27204e'), (1, '#5a2c52')], (0, 330 + OY), (0, STAGE))
A.burst(cx, STAGE - 60, rays=30, contrast=0.2, reach=560, colour='#f2cf8a', dark='#0b0f28', bottom=STAGE)
# 3. 조명(위에서 내려오는 빛)
pool = np.clip(1 - np.hypot((A.xx - (cx + 20)) / 300, (A.yy - (STAGE - 6)) / 46), 0, 1) ** 1.3
A.spray(pool * (A.yy < STAGE + 30), '#ffe9b4', density=0.9, grain=0.5, blend='screen')
# 4. 무대 바닥
floor = A.poly([(110, STAGE), (970, STAGE), (1010, STAGE + 60), (70, STAGE + 60)])
A.fade(floor, [(0, '#6a4a2c'), (1, '#2a1a16')], (0, STAGE), (0, STAGE + 60))
A.spray(A.rect(70, STAGE + 58, 1010, STAGE + 66), '#e2be6a', grain=0.3)
# 5. 배우(모자·망토)와 무대로 올라온 사람 — 실루엣, 빛 받는 쪽에 금빛 테두리
def fig(pts, col='#080a18'):
    m = A.poly(pts); A.spray(m, col, grain=0.3); return m
ax, ay = 430, STAGE
cloak = fig([(ax - 92, ay), (ax - 70, ay - 250), (ax - 34, ay - 330), (ax + 30, ay - 330), (ax + 62, ay - 250), (ax + 96, ay)])
fig([(ax - 2 + 0, ay - 310), (ax + 150, ay - 262), (ax + 152, ay - 248), (ax - 2, ay - 280)])               # 내민 팔
A.spray(A.disc(ax, ay - 366, 40), '#080a18', grain=0.3)
fig([(ax - 66, ay - 400), (ax + 66, ay - 400), (ax + 66, ay - 388), (ax - 66, ay - 388)])                     # 모자 챙
fig([(ax - 40, ay - 500), (ax + 40, ay - 500), (ax + 40, ay - 398), (ax - 40, ay - 398)])                     # 모자
A.spray(A.rect(ax - 40, ay - 424, ax + 40, ay - 410), '#c8323a', grain=0.3)                                   # 모자 띠
A.spray(np.clip(cloak - np.roll(cloak, -5, axis=1), 0, 1), '#f2cf8a', density=0.8, grain=0.3)                  # 오른쪽 가장자리 빛
gx, gy = 650, STAGE
body = fig([(gx - 36, gy - 70), (gx - 30, gy - 190), (gx + 30, gy - 190), (gx + 36, gy - 70)])
A.spray(A.disc(gx, gy - 226, 30), '#080a18', grain=0.3)
fig([(gx - 22, gy - 70), (gx - 6, gy - 70), (gx - 14, gy), (gx - 30, gy)]); fig([(gx + 6, gy - 70), (gx + 22, gy - 70), (gx + 40, gy + 6), (gx + 24, gy + 6)])
fig([(gx - 30, gy - 176), (gx - 96, gy - 150), (gx - 94, gy - 138), (gx - 30, gy - 156)])                     # 뻗은 팔
A.spray(np.clip(body - np.roll(body, 5, axis=1), 0, 1), '#f2cf8a', density=0.7, grain=0.3)
# 6. 프로시니엄(계단식 금빛 아치)과 막
for k, (inset, col) in enumerate(((0, '#8a6a2e'), (16, '#c9a04a'), (32, '#f0d489'))):
    x0, x1, y0 = 96 + inset, 984 - inset, 250 + OY + inset
    A.spray(A.rect(x0, y0, x1, y0 + 14), col, grain=0.3); A.spray(A.rect(x0, y0, x0 + 14, STAGE), col, grain=0.3); A.spray(A.rect(x1 - 14, y0, x1, STAGE), col, grain=0.3)
for sx in (cx - 210, cx - 105, cx, cx + 105, cx + 210):                                                    # 아치 위 부채 장식
    A.spray(A.disc(sx, 250 + OY, 46) * (A.yy < 250 + OY), '#e2be6a', grain=0.3)
    A.spray(A.disc(sx, 250 + OY, 30) * (A.yy < 250 + OY), '#0d1230', grain=0.3)
if curtains:
    for side in (-1, 1):
        xe = 150 if side < 0 else 930
        xi = xe + side * -1 * 0
        pts = [(xe, 300 + OY), (xe - side * -150, 300 + OY), (xe - side * -96, STAGE - 240), (xe - side * -40, STAGE), (xe, STAGE)]
        m = A.poly(pts)
        A.fade(m, [(0, '#5a0f1c'), (0.5, '#b2212e'), (1, '#6a1220')], (xe, 0), (xe - side * -150, 0))
        for f in range(1, 5):                                                                               # 주름
            fx = xe - side * -(f * 28)
            A.spray(A.rect(fx - 3, 300 + OY, fx + 3, STAGE) * m, '#3a0812', density=0.6, grain=0.4)
        A.spray(A.rect(min(xe, xe - side * -150), 300 + OY, max(xe, xe - side * -150), 318 + OY), '#e2be6a', grain=0.3)
# 7. 객석(머리 실루엣 두 줄) — 한 자리만 비어 있고 붉다
for row, (y, r, n) in enumerate(((STAGE + 150, 44, 9), (STAGE + 240, 56, 7))):
    if y - r > H: continue
    for i in range(n):
        x = (i + 0.5) * W / n
        empty = (row == 0 and i == 5)
        A.spray(A.rect(x - r * 1.25, y, x + r * 1.25, y + 96 if empty else H), '#b2212e' if empty else '#0a0d1e', grain=0.3)       # 등받이
        A.spray(A.disc(x, y, r * 1.25) * (A.yy < y + 2), '#b2212e' if empty else '#0a0d1e', grain=0.3)
        if not empty: A.spray(A.disc(x, y - r * 0.2, r * 0.62), '#04060f', grain=0.3)                          # 머리
        A.spray(A.disc(x, y, r * 1.25) * (A.yy < y - r * 0.95), '#e2be6a', density=0.5, grain=0.3)
A.border(inset=22, gap=8, width=2.2, colour='#e2be6a', step=34)
A.finish(paper='#efe4cc', tooth=0.03, warm=0.04, vignette=0.16)
A.save(out, quality=92)
print('ok', out)
