"""대구 여행 포스터(아르데코, 에어브러시) — 대프리카 노을, 두류산 위 83타워, 계산성당 쌍첨탑, 수성못 물빛.
사진을 쓰지 않고 랜드마크의 생김새만 참고해 새로 그린다. 위쪽 38% 는 제목 자리라 하늘만.
사용: python3 tools/ig/drawings/daegu_deco.py out.jpg [variant]   variant: cover | end"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
from artdeco import ArtDeco

out = sys.argv[1]; variant = sys.argv[2] if len(sys.argv) > 2 else "cover"
W, H = 1080, 1350
A = ArtDeco(W, H, seed=83)
HOR = 1010  # 수성못 수면

# 1. 하늘: 위는 짙은 남보라 → 자홍 → 주황 → 수평선 금빛 (대프리카 노을)
A.sky([(0, '#1b1440'), (0.32, '#5a2a6a'), (0.55, '#c8456a'), (0.75, '#f07a3e'), (1, '#ffc86a')], top=0, bottom=HOR)
# 해와 햇살(아르데코 방사선)
sx, sy = 640, 760
A.burst(sx, sy, rays=36, contrast=0.17, reach=900, colour='#ffd98a', dark='#7a2a4a', glow=0.6, bottom=HOR)
A.glow(sx, sy, 420, '#ffcf70', strength=0.55, power=1.6)
A.spray(A.disc(sx, sy, 120), '#ffe7a0', grain=0.5)
A.glow(sx, sy, 160, '#fff3c8', strength=0.6, power=2.0)
# 아지랑이 띠(더위)
for k, y in enumerate((640, 690, 735)):
    xs = np.linspace(0, W, 60)
    pts = [(x, y + 6 * np.sin(x / 40 + k)) for x in xs] + [(x, y + 9 + 6 * np.sin(x / 40 + k)) for x in xs[::-1]]
    A.spray(A.poly(pts), '#ffe2a8', density=0.25, grain=0.4, blend='screen')

# 2. 멀리 산(앞산·두류산) 실루엣 두 겹
far = [(0, 900), (120, 860), (260, 880), (420, 830), (560, 870), (700, 820), (860, 860), (1080, 840), (1080, HOR), (0, HOR)]
A.fade(A.poly(far), [(0, '#8a3a5a'), (1, '#5a2648')], (0, 820), (0, HOR))
hill = [(560, HOR), (650, 900), (760, 860), (870, 880), (980, 940), (1080, 960), (1080, HOR)]
A.fade(A.poly(hill), [(0, '#4a1e44'), (1, '#2a1230')], (0, 860), (0, HOR))

# 3. 83타워: 가는 기둥 + 둥근 전망대(두 겹 원반) + 첨탑, 오른쪽에서 빛
tx, tb = 830, 868
shaft = A.rect(tx - 13, 560, tx + 13, tb)
A.fade(shaft, [(0, '#2a1236'), (0.55, '#5a2a52'), (1, '#c86a6a')], (tx - 13, 0), (tx + 13, 0))
for (y0, h, w) in ((520, 26, 110), (548, 16, 86), (500, 18, 70)):
    m = A.poly([(tx - w / 2, y0), (tx + w / 2, y0), (tx + w / 2 - 10, y0 + h), (tx - w / 2 + 10, y0 + h)])
    A.fade(m, [(0, '#2a1236'), (0.6, '#6a2f5a'), (1, '#ffb06a')], (tx - w / 2, 0), (tx + w / 2, 0))
for i in range(9):  # 전망대 창 불빛
    A.spray(A.rect(tx - 44 + i * 10, 528, tx - 40 + i * 10, 538), '#ffe08a', grain=0.3)
A.spray(A.rect(tx - 3, 420, tx + 3, 500), '#3a1840')
A.glow(tx, 418, 22, '#ff5a4e', strength=0.9)
A.spray(A.disc(tx, 418, 5), '#ff7a6a')

# 4. 시내 빌딩 (계단식 아르데코 빌딩들, 동성로 쪽)
A.tower(380, HOR, [(110, 150), (80, 60), (50, 40)], body=('#3a1838', '#5a2a4a', '#8a4a5a'), rim='#ffc070', light=1, windows=0.35, far=0.35, haze='#9a4a62', seed=1)
A.tower(520, HOR, [(90, 110), (60, 50)], body=('#3a1838', '#5a2a4a', '#8a4a5a'), rim='#ffc070', light=1, windows=0.3, far=0.45, haze='#a8506a', seed=2)
A.tower(640, HOR, [(70, 80)], body=('#3a1838', '#5a2a4a', '#8a4a5a'), rim='#ffc070', light=1, windows=0.3, far=0.55, haze='#b05a6a', seed=3)
A.tower(960, HOR, [(150, 120), (100, 40)], body=('#2a1030', '#4a2040', '#7a3a50'), rim='#ffb060', light=1, windows=0.4, far=0.2, haze='#8a3a5a', seed=4)

# 5. 계산성당: 붉은 벽돌 고딕, 쌍첨탑 + 장미창 (왼쪽 앞)
cx = 170; base = HOR
brick = [(0, '#5a1e1e'), (0.5, '#9a3a2e'), (1, '#e07a4a')]
body = A.rect(cx - 120, base - 250, cx + 120, base)
A.fade(body, brick, (cx - 120, 0), (cx + 120, 0))
gable = A.poly([(cx - 70, base - 250), (cx + 70, base - 250), (cx, base - 330)])
A.fade(gable, brick, (cx - 70, 0), (cx + 70, 0))
for dx in (-95, 95):
    tw = A.rect(cx + dx - 34, base - 360, cx + dx + 34, base)
    A.fade(tw, brick, (cx + dx - 34, 0), (cx + dx + 34, 0))
    sp = A.poly([(cx + dx - 38, base - 360), (cx + dx + 38, base - 360), (cx + dx, base - 500)])
    A.fade(sp, [(0, '#2a1a2a'), (0.6, '#4a3040'), (1, '#c8806a')], (cx + dx - 38, 0), (cx + dx + 38, 0))
    A.spray(A.rect(cx + dx - 2, base - 540, cx + dx + 2, base - 496), '#ffd98a')
    A.spray(A.rect(cx + dx - 12, base - 526, cx + dx + 12, base - 522), '#ffd98a')
    for k in range(3):  # 탑의 뾰족창
        y = base - 330 + k * 100
        A.spray(A.poly([(cx + dx - 12, y + 50), (cx + dx + 12, y + 50), (cx + dx + 12, y + 14), (cx + dx, y), (cx + dx - 12, y + 14)]), '#ffcf70', density=0.85, grain=0.3)
# 장미창
A.spray(A.disc(cx, base - 200, 40), '#3a1420')
A.glow(cx, base - 200, 44, '#ffcf70', strength=0.7, power=1.2, mask=A.disc(cx, base - 200, 38))
for a in range(12):
    t = a * np.pi / 6
    A.spray(A.disc(cx + 24 * np.cos(t), base - 200 + 24 * np.sin(t), 6), '#ffe9b0', density=0.8)
# 정문 아치
A.spray(A.poly([(cx - 30, base), (cx + 30, base), (cx + 30, base - 80), (cx, base - 112), (cx - 30, base - 80)]), '#2a0f18')
# 벽돌 줄눈
for y in range(int(base - 356), int(base), 18):
    for (x0, x1) in ((cx - 129, cx - 61), (cx + 61, cx + 129)):
        A.spray(A.rect(x0, y, x1, y + 1.4), '#3a1414', density=0.35, grain=0.2)
    if y > base - 250:
        A.spray(A.rect(cx - 61, y, cx + 61, y + 1.4), '#3a1414', density=0.35, grain=0.2)

# 6. 수성못: 물빛 반사
A.water(HOR, stops=((0, '#a8405a'), (0.5, '#4a1e44'), (1, '#140a22')), reflect=0.55, dash=(60, 2.0), seed=5)
# 오리배 한 척(수성못 명물)
bx, by = 760, HOR + 46
A.spray(A.poly([(bx - 50, by), (bx + 46, by), (bx + 36, by + 24), (bx - 40, by + 24)]), '#fff1d6')
A.spray(A.disc(bx + 30, by - 18, 16), '#ffd84d')
A.spray(A.poly([(bx + 44, by - 20), (bx + 62, by - 15), (bx + 44, by - 10)]), '#ff8a3c')
A.spray(A.disc(bx + 34, by - 22, 3), '#1d1d1d')

A.border(inset=22, gap=8, width=2.2, colour='#e8c070', step=34)
A.finish(paper='#efe4cc', tooth=0.03, warm=0.05, vignette=0.14)
A.save(out, quality=92)
print("saved", out)
