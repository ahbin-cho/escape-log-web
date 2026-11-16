"""릴스 '햄즈 살찌우기'(셜록홈즈 안양범계점, 2026 신작) 손그림 장면. 공식 소개("햄즈 레스토랑에 오신 것을 환영합니다!",
타임어택 경쟁, 승리 팀 할인)만 보고 새로 그린 그림 — 실제 방 모습과 다르다. 햄스터가 단계마다 통통해진다.
python3 scene_hamz.py <out_dir> [name]"""
import os, sys, time
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from cartoon import Cartoon

W, H = 1080, 1920
R = Cartoon.rrect_pts
E = Cartoon.ellipse_pts
FUR, FUR_D, BELLY, EAR = '#f3b25e', '#d98d3a', '#fff1d8', '#f59a8a'
STATES = [('h1', 1.0, 'smile', 9), ('h2', 1.22, 'happy', 6), ('h3', 1.48, 'wow', 3), ('h4', 1.8, 'happy', 0), ('h5', 1.8, 'happy', 0)]


def scene(name, k, mood, seeds, seed):
    c = Cartoon(W, H, seed=seed)
    c.paper('#fbe9c8')
    # 벽: 크림 줄무늬 벽지 + 창틀 같은 메뉴판
    for x in range(0, W, 120):
        c.fill(R(x, -20, x + 60, 1300, 0), '#f6dcae', slop=0)
    c.shape(R(-20, 1260, W + 20, H + 20, 0), '#c98a52', shade=('#a96d3c', 0, -14), width=7)       # 나무 바닥
    for x in range(-40, W, 150): c.line([(x, 1290), (x + 60, H)], 4, rough=False)
    c.shape(R(150, 150, 930, 470, 30), '#3f6b4f', shade=('#2f5440', -10, -10), width=8)         # 메뉴 칠판
    c.letter('HAMZ', 540, 300, 120, fill=YELLOW if False else '#f8cd48', depth=(5, 7), depth_colour='#e04a3a', anchor='m')
    # 테이블
    c.shape(E(540, 1330, 470, 110), '#e57f4f', shade=('#c9653a', 0, 16), width=8)
    c.shape(R(470, 1360, 610, 1700, 20), '#b5703f', shade=('#94592f', -10, 0), width=7)
    # 해바라기씨 접시(남은 씨앗 수가 점점 줄어든다)
    c.shape(E(820, 1300, 120, 40), '#fffbf1', shade=('#e7dcc4', 0, 8), width=6)
    rng = np.random.default_rng(seed)
    for i in range(seeds):
        x = 820 + rng.uniform(-80, 80); y = 1290 + rng.uniform(-18, 10)
        c.shape(E(x, y, 16, 9, rot=rng.uniform(0, 180)), '#4a3a30', width=3)
    # 햄스터(k 배로 통통해진다, 바닥에 붙어 있도록 아래 기준)
    cx, base = 520, 1300
    bw, bh = 170 * k, 150 * (1 + (k - 1) * .75)
    cy = base - bh * .85
    for sx in (-1, 1):                                                                          # 귀
        c.shape(E(cx + sx * bw * .55, cy - bh * .82, 46, 42), FUR, width=7)
        c.fill(E(cx + sx * bw * .55, cy - bh * .8, 26, 22), EAR, slop=1)
    c.shape(E(cx, cy, bw, bh), FUR, shade=(FUR_D, -18, -14), width=9)
    c.fill(E(cx, cy + bh * .3, bw * .62, bh * .6), BELLY, slop=1.5)
    for sx in (-1, 1):                                                                          # 볼주머니
        c.fill(E(cx + sx * bw * .6, cy + bh * .05, 44 * k ** .7, 36 * k ** .7), '#ffd9a8', slop=1)
    c.face(cx, cy - bh * .18, 120, mood)
    for sx in (-1, 1):                                                                          # 앞발(씨앗을 쥔다)
        c.shape(E(cx + sx * 46, cy + bh * .32, 22, 16), '#f59a8a', width=5)
    c.shape(E(cx, cy + bh * .3, 18, 11), '#4a3a30', width=3)
    if name == 'h5':                                                                            # 승리
        c.burst(540, 760, 250, 130, colour='#f8cd48', spikes=16, shade='#e0a52a')
        c.letter('WIN!', 540, 800, 120, fill='#fffbf1', depth=(5, 7), depth_colour='#e04a3a', anchor='m')
        for (x, y) in ((200, 600), (880, 640), (260, 980), (840, 1000)): c.sparkle(x, y, 34)
    if k > 1.4 and name != 'h5':
        c.pop_lines(cx, cy, bw + 20, bw + 80, [200, 230, 310, 340], width=6)
    return c


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, k, mood, seeds in STATES:
        if only and name != only: continue
        for v in (1, 2):
            t = time.time()
            scene(name, k, mood, seeds, seed=v * 7 + 3).save(f'{out}/{name}_{v}.jpg', quality=80)
            print(name, v, round(time.time() - t, 1), flush=True)
