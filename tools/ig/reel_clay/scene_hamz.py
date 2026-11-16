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
STATES = [('h1', 1.0, '', 9), ('h2', 1.2, '', 6), ('h3', 1.42, '', 3), ('h4', 1.7, '', 0), ('h5', 1.7, '', 0)]


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
    # 햄스터: 골든햄스터처럼 등은 주황, 얼굴 아래·배는 흰색. 구슬 같은 까만 눈, 분홍 코, 앞니, 수염,
    # 양쪽으로 부푼 볼주머니(단계마다 더 빵빵), 씨앗을 쥔 분홍 앞발. k 배로 통통해진다(바닥 기준)
    cx, base = 520, 1300
    bw, bh = 165 * k ** .9, 175 * (1 + (k - 1) * .55)
    cy = base - bh * .82
    pouch = 40 + 70 * (k - 1)                                                                   # 볼주머니 크기
    for sx in (-1, 1):                                                                          # 귀: 작고 둥글게, 머리 양옆 위
        c.shape(E(cx + sx * bw * .62, cy - bh * .78, 34, 32), FUR, width=6)
        c.fill(E(cx + sx * bw * .62, cy - bh * .76, 19, 17), EAR, slop=.8)
    body = E(cx, cy, bw, bh)
    c.shape(body, FUR, shade=(FUR_D, -16, -12), width=9)
    c.fill(c.mask(E(cx, cy + bh * .28, bw * .78, bh * .72)) * c.mask(body), BELLY, slop=1)        # 흰 배·턱
    for sx in (-1, 1):                                                                          # 볼주머니: 몸 옆으로 불룩 튀어나온 흰 볼(바깥 테두리만 그린다)
        px, pr = cx + sx * (bw * .78 + pouch * .15), pouch
        c.fill(E(px, cy + bh * .05, pr, pr * .85), BELLY, slop=.6)
        a0, a1 = (-80, 95) if sx > 0 else (85, 260)
        c.line(E(px, cy + bh * .05, pr, pr * .85, a0=a0, a1=a1), 8)
        c.blush(cx + sx * bw * .55, cy + bh * .02, 18, 10)
    c.fill(c.mask(E(cx, cy - bh * .5, bw * .3, bh * .32)) * c.mask(body), BELLY, slop=.6)         # 이마의 흰 줄
    ey = cy - bh * .2
    for sx in (-1, 1):                                                                          # 구슬 눈
        e = E(cx + sx * bw * .3, ey, 15, 17)
        c.fill(e, '#1c1612', slop=.3)
        c.fill(E(cx + sx * bw * .3 - 5, ey - 6, 5, 6), '#ffffff', slop=0, knock=False, kind='shade')
    ny = ey + 34
    c.shape([(cx - 11, ny - 6), (cx + 11, ny - 6), (cx, ny + 6)], '#f2869a', width=3)           # 분홍 코
    c.line([(cx, ny + 6), (cx, ny + 16)], 3.5)
    c.line([(cx - 20, ny + 16), (cx - 10, ny + 22), (cx, ny + 16), (cx + 10, ny + 22), (cx + 20, ny + 16)], 3.5)   # ω 입
    c.shape(R(cx - 8, ny + 20, cx + 8, ny + 34, 3), '#fffbf1', width=3)                         # 앞니
    c.line([(cx, ny + 21), (cx, ny + 33)], 2, rough=False)
    for sx in (-1, 1):                                                                          # 수염
        for dy in (-6, 6, 18):
            c.line([(cx + sx * 34, ny + dy), (cx + sx * (bw * .5 + pouch * .5), ny + dy + dy * .6 - 4)], 2.4, rough=False)
    py = ny + 62                                                                                # 앞발로 씨앗 쥐기
    c.shape(E(cx, py, 13, 22, rot=20), '#4a3a30', width=3)
    c.glint([(cx - 3, py - 12), (cx + 3, py + 10)], 3)
    for sx in (-1, 1):
        c.shape(E(cx + sx * 22, py + 4, 16, 13), '#f6a6b2', width=4)
    for sx in (-1, 1):                                                                          # 뒷발
        c.shape(E(cx + sx * bw * .45, base - 6, 30, 16), '#f6a6b2', width=5)
    if name == 'h5':                                                                            # 승리
        c.burst(540, 760, 250, 130, colour='#f8cd48', spikes=16, shade='#e0a52a')
        c.letter('WIN!', 540, 800, 120, fill='#fffbf1', depth=(5, 7), depth_colour='#e04a3a', anchor='m')
        for (x, y) in ((200, 600), (880, 640), (260, 980), (840, 1000)): c.sparkle(x, y, 34)
    if k > 1.4 and name != 'h5':
        c.pop_lines(cx, cy, bw + pouch, bw + pouch + 60, [200, 230, 310, 340], width=6)
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
