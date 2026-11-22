"""셔플월드 팬 포스터 배경(1080x1350, 픽셀 아트). 공식 포스터를 베끼지 않은 새 장면:
뒤섞인 세계(숲·사막·눈 섬이 하늘에 떠 있고 포털이 잇는다)를 바라보는 용사."""
import sys, math
sys.path.insert(0, "/root/.claude/skills/claude-drawing-skill/lib")
import numpy as np
from pixelart import PixelArt
W, H = 216, 270
p = PixelArt(W, H, scale=5, seed=3)
rng = np.random.default_rng(5)
# 하늘: 남보라 → 청록 → 살구
p.gradient(0, 0, W, 110, '#1b1642', '#2f3f7d', steps=7)
p.gradient(0, 110, W, 200, '#2f3f7d', '#e98f6b', steps=8)
p.gradient(0, 200, W, H, '#e98f6b', '#f6c98a', steps=4)
for _ in range(70):
    x, y = int(rng.integers(0, W)), int(rng.integers(0, 120))
    p.put(x, y, '#fff6d8' if rng.random() < .3 else '#9fb0e8')
# 달
p.circle(170, 40, 17, '#fff1c4'); p.circle(176, 35, 15, '#2a2f6e'); p.glow(166, 42, 34, '#fff1c4', 0.35)
# 먼 산
for (x0, x1, top, col) in ((-10, 120, 168, '#5a4a8a'), (80, 230, 176, '#6d5596'), (-20, 80, 186, '#7c5f9c')):
    pts = [(x0, 215)] + [(x0 + (x1 - x0) * t, top + 14 * abs(math.sin(7 * t + x0)) + 20 * abs(t - .5)) for t in np.linspace(0, 1, 9)] + [(x1, 215)]
    p.poly(pts, col)
def sprite(rows, x, y, pal, k=1):
    for j, r in enumerate(rows):
        for i, ch in enumerate(r):
            if ch != '.': p.rect(x + i * k, y + j * k, x + i * k + k, y + j * k + k, pal[ch])
def tree(x, y, s=1.0, cols=('#1f5a3a', '#2f7d46', '#57a856')):
    p.rect(x - 1, y - int(6 * s), x + 1, y, '#5a3a22')
    for dy, r, c in ((int(-8 * s), int(6 * s), cols[0]), (int(-11 * s), int(5 * s), cols[1]), (int(-14 * s), int(3 * s), cols[2])):
        p.circle(x, y + dy, max(2, r), c)
    p.put(x - 2, y - int(12 * s), cols[2]); p.put(x + 1, y - int(15 * s), '#8fd27a')
def island(cx, y, w, d, grass, rock, rock2):
    pts = [(cx - w // 2, y + 3)]
    n = 7
    for i in range(1, n):
        t = i / n; depth = d * math.sin(math.pi * t) ** .7 * (0.75 + 0.5 * rng.random())
        pts.append((cx - w // 2 + w * t, y + 3 + depth))
    pts.append((cx + w // 2, y + 3))
    p.poly(pts, rock)
    m = p.mask_poly(pts); mm = np.zeros_like(m); mm[:, cx:] = m[:, cx:]; p.dither(mm, rock2, 0.55)
    p.rect(cx - w // 2 - 1, y, cx + w // 2 + 1, y + 4, grass[0]); p.rect(cx - w // 2, y, cx + w // 2, y + 2, grass[1])
    for x in range(cx - w // 2, cx + w // 2, 3):
        if rng.random() < .6: p.put(x, y + 4, grass[0]); 
        if rng.random() < .3: p.put(x, y + 5, grass[0])
# 섬 1: 숲
island(40, 140, 62, 28, ('#2f7d46', '#6fc45f'), '#6a4a3a', '#3f2a2a')
for x, s in ((20, 1.0), (32, 1.3), (46, 1.1), (58, .9)): tree(x, 140, s)
p.rect(36, 133, 44, 140, '#c98b4a'); p.poly([(34, 133), (40, 127), (46, 133)], '#8a3b3b'); p.rect(39, 136, 41, 140, '#3a2418'); p.put(42, 135, '#ffe08a')
# 섬 2: 사막
island(168, 132, 56, 26, ('#c98f3e', '#f2cf73'), '#9a6a3a', '#5e3d2a')
p.poly([(150, 132), (163, 114), (176, 132)], '#e8b85a'); p.poly([(163, 114), (176, 132), (169, 132)], '#b98338')
for cx in (184, 190):
    p.rect(cx, 124, cx + 1, 132, '#3f8a4c'); p.put(cx - 1, 127, '#3f8a4c'); p.put(cx + 2, 126, '#3f8a4c')
# 섬 3: 눈
island(112, 96, 44, 22, ('#b9cdea', '#ffffff'), '#6f7fa8', '#44507a')
for x, s in ((98, .9), (108, 1.2), (124, 1.0)): tree(x, 96, s, ('#2c5b6a', '#3f7f88', '#eaf4ff'))
for _ in range(14): p.put(int(rng.integers(92, 134)), int(rng.integers(70, 96)), '#ffffff')
# 포털(가운데): 세계를 잇는 문
px, py = 132, 170
p.glow(px, py, 44, '#b06cff', 0.75); p.circle(px, py, 15, '#e6c7ff'); p.circle(px, py, 13, '#8a4bd8'); p.circle(px, py, 10, '#3a1c6e'); p.circle(px, py, 6, '#150a33')
for k in range(26):
    a = k * 0.55; r = 3 + k * 0.42
    p.put(int(px + r * math.cos(a)), int(py + r * math.sin(a) * .95), '#f3dcff' if k % 3 else '#7fe7ff')
# 섬과 포털을 잇는 반짝이 길
def trail(a, b, bend, col):
    for t in np.linspace(0.08, .92, 14):
        x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t - bend * math.sin(math.pi * t)
        p.put(int(x), int(y), col)
trail((66, 148), (px - 14, py - 4), 8, '#9ff0c0'); trail((168, 150), (px + 14, py - 2), -8, '#ffe08a'); trail((112, 118), (px, py - 16), 0, '#dff1ff')
# 앞 절벽
cl = [(0, H), (0, 222), (20, 218), (58, 214), (96, 216), (128, 222), (142, 236), (150, H)]
p.poly(cl, '#3a2a3a'); p.poly([(0, 222), (20, 218), (58, 214), (96, 216), (128, 222), (128, 228), (96, 222), (58, 220), (20, 224), (0, 228)], '#2f7d46')
p.poly([(0, 222), (20, 218), (58, 214), (96, 216), (128, 222), (128, 224), (96, 218), (58, 216), (20, 220), (0, 224)], '#6fc45f')
m = p.mask_poly(cl); mm = np.zeros_like(m); mm[232:, :] = m[232:, :]; p.dither(mm, '#22182a', 0.6)
for x, c in ((10, '#ff7fa8'), (30, '#ffe08a'), (80, '#ff7fa8'), (104, '#8fd0ff'), (118, '#ffe08a')):
    p.put(x, 217 + (x % 3), c); p.put(x, 218 + (x % 3), '#2f7d46')
# 오른쪽 아래 작은 섬 + 슬라임
island(186, 232, 46, 22, ('#2f7d46', '#6fc45f'), '#6a4a3a', '#3f2a2a')
SL = ["..kkkk..", ".kggggk.", "kgwggwgk", "kggggggk", ".kkkkkk."]
sprite(SL, 172, 227, {'k': '#12331f', 'g': '#7be08a', 'w': '#ffffff'})
sprite(SL, 190, 227, {'k': '#3a1230', 'g': '#ff8fc0', 'w': '#ffffff'})
p.rect(203, 222, 204, 232, '#5a3a22'); p.rect(199, 221, 209, 227, '#c98b4a'); p.rect(203, 222, 204, 225, '#b3261e'); p.put(203, 226, '#b3261e')   # 퀘스트 팻말(!)
# 용사(뒤돌아 세계를 바라봄, 2배)
HERO = ["...........w..", "...........w..", "...........w..", "....kkkk...w..", "...khhhhk..w..", "..khhhhhhk.w..", "..khhHHhhkggg.", "..khHHHHhk.s..",
        "...kHHHHkss...", "..kkbbbbsk....", ".rrkbbbbbk....", "rrrkbbbbk.....", "rrrkbbbbk.....", "rrrrkddk......", ".rrrkbbk......", ".rr.kbkbk.....", "..r.kb.bk.....", "....kn.nk.....", "...knn.nnk...."]
PAL = {'k': '#1a1026', 'h': '#f7d264', 'H': '#d9a233', 's': '#f5c9a0', 'r': '#d43a44', 'b': '#3b6fd6', 'd': '#f2c14e', 'w': '#f4f8ff', 'g': '#f2c14e', 'n': '#6a4022'}
sprite(HERO, 40, 159, PAL, k=3)
p.glow(74, 161, 12, '#ffffff', 0.55)
for dx, dy in ((0, -4), (-3, 0), (3, 0), (0, 3)): p.put(74 + dx, 160 + dy, '#ffffff')
p.save(sys.argv[1])
