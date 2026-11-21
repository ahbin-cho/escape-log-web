"""타쿠의 심야괴담 표지 배경(1080x1350): 심야 식당 선반 위 낡은 라디오, 붉은 조명. 리놀륨 판화(검정 + 빨강 한 판). 공식 포스터 분위기 참고, 새 장면."""
import sys, math
sys.path.insert(0, "/root/.claude/skills/claude-drawing-skill/lib")
import numpy as np
from linocut import Linocut
W, H = 1080, 1350
L = Linocut(W, H, block=(26, 26, W - 26, H - 26), seed=7, paper='#f1e7d3', ink='#171313')
red = L.colour_block('#d9352b', offset=(3, -2))
# 붉은 조명: 오른쪽 위에서 선반 위 라디오로 떨어지는 빛기둥
beam = [(770, 26), (1010, 26), (1054, 1004), (300, 1004)]
L.clear(beam, chatter=0.5, angle=74)
L.leave(beam, on=red)
# 빛기둥 안 결(위에서 아래로 긁은 칼자국을 남긴다)
L.hatch(beam, angle=76, spacing=46, width=2.5, dash=(60, 200), gap=(120, 360), cut=False)
# 선반
L.leave(L.rect(150, 1004, 1054, 1040))
L.gouge([(170, 1012), (1040, 1012)], 3, tool='knife')
# 라디오(검은 덩어리) + 칼로 판 세부
rx0, ry0, rx1, ry1 = 470, 800, 880, 1004
L.leave(L.rect(rx0, ry0, rx1, ry1))
L.outline(L.rect(rx0, ry0, rx1, ry1), width=3)
L.gouge([(880 - 24, 800), (985, 520)], 5, tool='knife', cut=False)           # 안테나
L.leave(L.disc(985, 520, 9))
hx = [(540 + i * 8, 800 - 34 * math.sin(math.pi * i / 34)) for i in range(35)]
L.gouge(hx, 6, tool='knife', cut=False)                                       # 손잡이
L.rings(590, 905, [22, 38, 54, 70], width=4, arc=(1.2, 2.6), gap=(0.05, 0.2))  # 스피커
L.clear(L.rect(690, 830, 852, 876), chatter=0.1)                              # 주파수 창
L.leave(L.rect(690, 830, 852, 876), on=red)
for i in range(9):
    L.gouge([(702 + i * 17, 838), (702 + i * 17, 852 + (8 if i % 4 == 0 else 0))], 2.5, tool='knife', cut=False)
L.gouge([(790, 832), (790, 874)], 4, tool='knife', cut=False)                 # 바늘
for cx in (722, 820):
    L.clear(L.disc(cx, 940, 26), chatter=0.0); L.leave(L.disc(cx, 940, 15))
    L.gouge([(cx, 940), (cx + 9, 929)], 3, tool='knife')
# 라디오에서 퍼지는 소리(어둠 속에 판 끊어진 고리)
for k, rr in enumerate((255, 325, 395, 465)):
    for a0, a1 in ((2.5, 3.0), (3.2, 3.6)):
        a0 += 0.12 * k; a1 -= 0.05 * k
        L.gouge([(590 + rr * math.cos(a), 905 + rr * math.sin(a)) for a in np.linspace(a0, a1, 24)], 6 - k * 0.6, tool='v')
# 매달린 나무 팻말 셋(글자는 넣지 않고 나뭇결만)
for i, (px, ph) in enumerate(((800, 250), (880, 290), (960, 230))):
    r = L.rect(px - 30, 150, px + 30, 150 + ph)
    L.leave(r); L.hatch(r, angle=90, spacing=9, width=2, dash=(20, 80), gap=(8, 40))
    L.gouge([(px, 110), (px, 150)], 3, tool='knife', cut=False)
# 선반 위 술병(빛 속의 검은 실루엣)
bottle = [(930, 1004), (930, 880), (948, 850), (948, 800), (972, 800), (972, 850), (990, 880), (990, 1004)]
L.leave(bottle); L.gouge([(940, 990), (940, 890)], 3, tool='knife'); L.clear(L.rect(934, 915, 986, 960), chatter=0.0); L.leave(L.rect(934, 915, 986, 960), on=red)
# 선반 아래: 포개 놓은 그릇 한 무더기(오른쪽)
for j in range(4):
    y = 1190 - j * 24; bx, bw = 860, 190 - j * 6
    L.gouge([(bx - bw / 2 + bw * t, y + 30 * math.sin(math.pi * t)) for t in np.linspace(0, 1, 20)], 4.5, tool='v')
L.gouge([(770, 1096), (950, 1096)], 3.5, tool='knife')
L.save(sys.argv[1])
