"""경기남부 '이 방의 이야기' 릴스 배경 4장. 공식 포스터·줄거리의 분위기만 보고 새로 그린 그림(포스터는 끝에 작게만).
 bokdo  복도끝(상상의문 수원점)      : 엘리베이터 문틈 너머, 형광등이 끊긴 빌라 복도 끝 303호
 sagwi  사귀(마스터키 평택점)        : 달빛 드는 어두운 방, 이불을 덮고 누운 '누군가', 바닥에 뻗은 그림자 손들
 scare  허수아비(둠이스케이프 FEAR점): 밤 옥수수밭, 헤드라이트 하나 켜진 채 멈춘 차, 달 아래 허수아비
 kono   안산 코노(꿈소풍 안산1호점)  : 보랏빛 코인노래방 복도, 끝 부스의 빨간 노래방 기계 화면
사용: python3 tools/ig/drawings/south_moods.py tools/ig/assets"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
out = sys.argv[1]; W, H = 1080, 1920; S = 2
rng = np.random.default_rng(41)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
def sm(scale, seed, w=W, h=H):
    r = np.random.default_rng(seed); a = r.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255
def lerp(a, b, t): return a + (b - a) * t
def canvas(bg): im = Image.new("RGB", (W * S, H * S), bg); return im, ImageDraw.Draw(im, "RGBA")
def P(x, y): return (x * S, y * S)
def arr(im): return np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32)
def glow(a, r, k):
    g = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return a + g * k
def finish(a, name, tint, grain=8, vig=(540, 900)):
    v = np.clip(1 - (((XX - vig[0]) / (W * .75)) ** 2 + ((YY - vig[1]) / (H * .62)) ** 2), 0, 1) ** .6
    a = a * (0.3 + 0.7 * v)[..., None] * np.array(tint)
    sc = Image.new("L", (W, H), 0); sd = ImageDraw.Draw(sc)
    for _ in range(500):
        x, y = rng.random() * W, rng.random() * H; r = rng.random() ** 3 * 2.5 + .4
        sd.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(60, 180)))
    for _ in range(30):
        x, y = rng.random() * W, rng.random() * H; L = rng.uniform(30, 160)
        sd.line([(x, y), (x + rng.normal(0, 6), y + L)], fill=int(rng.uniform(30, 90)), width=1)
    d = np.asarray(sc).astype(np.float32)[..., None] / 255
    a = a * (1 - d * .5) + 200 * d * .08 + rng.normal(0, grain, (H, W, 1))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(out, name), quality=92)

def corridor(N, F, d, ceil, floor, wl, wr):
    d.polygon([P(N['x0'], N['y0']), P(N['x1'], N['y0']), P(F['x1'], F['y0']), P(F['x0'], F['y0'])], fill=ceil)
    d.polygon([P(N['x0'], N['y1']), P(N['x1'], N['y1']), P(F['x1'], F['y1']), P(F['x0'], F['y1'])], fill=floor)
    d.polygon([P(N['x0'], N['y0']), P(F['x0'], F['y0']), P(F['x0'], F['y1']), P(N['x0'], N['y1'])], fill=wl)
    d.polygon([P(N['x1'], N['y0']), P(F['x1'], F['y0']), P(F['x1'], F['y1']), P(N['x1'], N['y1'])], fill=wr)
def zt(i, n, k=2.6): return 1 - 1 / (1 + k * i / n)
def wallpt(N, F, side, t, v):
    x = lerp(N[side], F[side], t); y = lerp(lerp(N['y0'], F['y0'], t), lerp(N['y1'], F['y1'], t), v); return P(x, y)

# ───────── 복도끝: 엘리베이터 문틈 너머 빌라 복도 ─────────
def bokdo():
    im, d = canvas((6, 6, 5))
    N = dict(x0=300, x1=780, y0=420, y1=1500); F = dict(x0=500, x1=600, y0=780, y1=1000)
    corridor(N, F, d, (34, 33, 26), (24, 22, 18), (52, 50, 40), (44, 42, 34))
    for side in ('x0', 'x1'):                                   # 양쪽 현관문
        for i in range(4):
            ta, tb = zt(i, 4) + .05, zt(i, 4) + .05 + (zt(i + 1, 4) - zt(i, 4)) * .45
            poly = [wallpt(N, F, side, ta, .3), wallpt(N, F, side, tb, .3), wallpt(N, F, side, tb, 1), wallpt(N, F, side, ta, 1)]
            d.polygon(poly, fill=(70, 58, 44), outline=(20, 16, 12))
            h = wallpt(N, F, side, lerp(ta, tb, .85 if side == 'x0' else .15), .66); r = (1 - ta) * 7 * S
            d.ellipse([h[0] - r, h[1] - r, h[0] + r, h[1] + r], fill=(170, 150, 110))
    for i, on in ((1, True), (3, False), (5, True), (7, False)):  # 천장 등: 켜진 것 / 꺼진 것
        t = zt(i, 8); cx = lerp((N['x0'] + N['x1']) / 2, (F['x0'] + F['x1']) / 2, t); cy = lerp(N['y0'], F['y0'], t) + 6
        w = (1 - t) * 60 + 8
        d.ellipse([P(cx - w, cy - w * .18), P(cx + w, cy + w * .18)], fill=(255, 240, 200) if on else (60, 58, 50))
    d.rectangle([P(F['x0'], F['y0']), P(F['x1'], F['y1'])], fill=(58, 54, 44))   # 끝 벽과 303호
    d.rectangle([P(F['x0'] + 18, F['y0'] + 50), P(F['x1'] - 18, F['y1'])], fill=(96, 30, 26), outline=(30, 10, 8), width=2 * S)
    d.rectangle([P(F['x0'] + 34, F['y0'] + 62), P(F['x1'] - 34, F['y0'] + 78)], fill=(210, 190, 140))
    a = arr(im)
    a = glow(a, 46, .55) * .8
    a *= (0.7 + 0.4 * sm(150, 5))[..., None]
    # 끝 문 아래로 새어 나오는 붉은 빛
    a += np.array([90, 14, 10]) * (np.exp(-((XX - 550) / 60) ** 2 - ((YY - 1004) / 14) ** 2) * .9)[..., None]
    # 엘리베이터 안쪽 벽(스테인리스) — 문틈 바깥
    inside = (XX > N['x0']) & (XX < N['x1']) & (YY > 360) & (YY < 1560)
    col = np.random.default_rng(6).random(W).astype(np.float32)
    steel = (34 + 14 * col[None, :] + 10 * sm(260, 6) + 18 * np.exp(-((XX - 150) / 90) ** 2))[..., None] * np.array([.9, .95, 1.0]) * (0.5 + 0.5 * sm(200, 7))[..., None]
    a = np.where(inside[..., None], a, steel * .55)
    a += (np.array([120, 110, 90]) * np.exp(-np.abs(XX - N['x0']) / 3)[..., None] * ((YY > 360) & (YY < 1560))[..., None] * .25)
    a += (np.array([120, 110, 90]) * np.exp(-np.abs(XX - N['x1']) / 3)[..., None] * ((YY > 360) & (YY < 1560))[..., None] * .25)
    finish(a, "reel-bokdo.jpg", (1.0, 0.96, 0.86), 8, (540, 900))

# ───────── 사귀: 달빛 방, 이불 속 누군가 ─────────
def sagwi():
    im, d = canvas((10, 10, 16))
    for i in range(0, H, 46):                                   # 마룻바닥(위에서 비스듬히)
        d.rectangle([P(0, i), P(W, i + 44)], fill=(22 + (i // 46) % 3 * 3, 20, 28))
        d.line([P(0, i + 45), P(W, i + 45)], fill=(8, 8, 12), width=S)
    d.rectangle([P(0, 0), P(W, 360)], fill=(14, 14, 22))       # 벽
    d.rectangle([P(140, 70), P(470, 330)], fill=(70, 80, 120)); d.line([P(305, 70), P(305, 330)], fill=(14, 14, 22), width=8 * S)
    d.line([P(140, 200), P(470, 200)], fill=(14, 14, 22), width=8 * S)
    # 침대
    d.rounded_rectangle([P(230, 470), P(850, 1300)], 30 * S, fill=(40, 36, 46), outline=(6, 6, 8), width=4 * S)
    d.rounded_rectangle([P(270, 500), P(810, 650)], 40 * S, fill=(86, 84, 98))            # 베개
    d.rounded_rectangle([P(250, 640), P(830, 1280)], 46 * S, fill=(62, 62, 82))           # 이불
    for k in range(7):                                          # 이불 주름
        d.arc([P(260 + k * 40, 700 + k * 60), P(820 - k * 30, 1100 + k * 30)], 200, 340, fill=(46, 46, 62), width=3 * S)
    d.ellipse([P(430, 560), P(650, 730)], fill=(30, 26, 32))   # 이불 위로 나온 검은 머리카락
    d.ellipse([P(360, 760), P(720, 1150)], fill=(72, 72, 94))                             # 이불 아래 몸의 부푼 곳
    a = arr(im)
    # 창문 달빛: 바닥에 비스듬한 빛 기둥
    beam = np.clip(1 - np.abs((XX - 300) - (YY - 330) * .35) / 240, 0, 1) * (YY > 330) * np.exp(-(YY - 330) / 1600)
    a += np.array([70, 84, 140]) * beam[..., None] * .7
    a = glow(a, 40, .35) * .78
    # 바닥에 뻗은 그림자 손(포스터 분위기): 아래쪽에서 침대 쪽으로
    sh = Image.new("L", (W, H), 0); sd = ImageDraw.Draw(sh)
    for (bx, by, ang, ln) in [(80, 1900, -60, 520), (260, 1950, -78, 600), (840, 1960, -104, 560), (1030, 1880, -122, 520), (520, 1990, -90, 430)]:
        r = math.radians(ang); ex, ey = bx + math.cos(r) * ln, by + math.sin(r) * ln
        sd.line([(bx, by), (ex, ey)], fill=255, width=70)
        for f in range(5):
            fr = r + math.radians(-32 + f * 16); L = rng.uniform(70, 120)
            sd.line([(ex, ey), (ex + math.cos(fr) * L, ey + math.sin(fr) * L)], fill=255, width=16)
        sd.ellipse([ex - 48, ey - 48, ex + 48, ey + 48], fill=255)
    shm = np.asarray(sh.filter(ImageFilter.GaussianBlur(6))).astype(np.float32)[..., None] / 255
    a *= (1 - .8 * shm)
    a *= (0.75 + 0.35 * sm(160, 9))[..., None]
    finish(a, "reel-sagwi.jpg", (0.9, 0.92, 1.12), 8, (540, 900))

# ───────── 허수아비: 밤 옥수수밭, 멈춘 차 ─────────
def scare():
    im, d = canvas((8, 10, 16))
    a0 = np.zeros((H * S, W * S, 3), np.float32)
    im = Image.new("RGB", (W * S, H * S)); d = ImageDraw.Draw(im, "RGBA")
    for y in range(0, 1100):                                   # 하늘: 남색 → 지평선 쪽 탁한 주황
        t = y / 1100; c = (int(lerp(8, 70, t ** 2)), int(lerp(12, 46, t ** 2)), int(lerp(26, 40, t ** 2)))
        d.line([P(0, y), P(W, y)], fill=c, width=S)
    d.ellipse([P(700, 230), P(860, 390)], fill=(236, 228, 200))  # 달
    d.rectangle([P(0, 1100), P(W, H)], fill=(10, 12, 8))
    for row in range(26):                                       # 옥수수 줄(멀리 → 가까이)
        y = 1080 + row * 34 + row * row * 1.2; sc = .35 + row / 14
        for x in np.arange(-40, W + 40, 26 * sc):
            h = (60 + rng.uniform(-14, 20)) * sc; xx = x + rng.uniform(-6, 6)
            col = (int(30 + 20 * sc), int(36 + 18 * sc), int(14 + 6 * sc))
            d.line([P(xx, y), P(xx + rng.normal(0, 4) * sc, y - h)], fill=col, width=max(1, int(3 * sc * S)))
            for k in range(2):
                ly = y - h * rng.uniform(.3, .85); s = rng.choice([-1, 1])
                d.line([P(xx, ly), P(xx + s * 26 * sc, ly + 12 * sc)], fill=col, width=max(1, int(2 * sc * S)))
    # 허수아비(달 아래 실루엣)
    sx, sy = 760, 700; K = (6, 6, 8)
    d.line([P(sx, sy - 40), P(sx, 1180)], fill=K, width=12 * S)
    d.line([P(sx - 150, sy + 40), P(sx + 150, sy + 30)], fill=K, width=10 * S)
    d.polygon([P(sx - 70, sy + 20), P(sx + 70, sy + 20), P(sx + 90, sy + 260), P(sx + 40, sy + 240), P(sx, sy + 270), P(sx - 50, sy + 245), P(sx - 92, sy + 262)], fill=K)
    d.ellipse([P(sx - 52, sy - 70), P(sx + 52, sy + 30)], fill=K)
    d.polygon([P(sx - 110, sy - 40), P(sx + 110, sy - 44), P(sx + 40, sy - 70), P(sx + 20, sy - 150), P(sx - 30, sy - 150), P(sx - 44, sy - 72)], fill=K)
    for s in (-1, 1):
        for k in range(4): d.line([P(sx + s * 150, sy + 36), P(sx + s * (170 + k * 6), sy + 36 + (k - 1.5) * 14)], fill=K, width=3 * S)
    # 멈춘 차(왼쪽 아래, 비스듬히)
    d.polygon([P(60, 1420), P(470, 1390), P(500, 1520), P(40, 1560)], fill=(18, 18, 22))
    d.polygon([P(140, 1405), P(380, 1385), P(350, 1310), P(190, 1320)], fill=(14, 14, 18))
    d.polygon([P(200, 1330), P(340, 1320), P(360, 1388), P(170, 1400)], fill=(30, 40, 52))
    for cx in (110, 430): d.ellipse([P(cx - 46, 1515), P(cx + 46, 1600)], fill=(4, 4, 6))
    a = arr(im)
    # 헤드라이트 하나: 옥수수밭 쪽으로 뻗는 빛
    hx, hy = 490, 1470
    ang = np.arctan2(YY - hy, XX - hx); dist = np.hypot(XX - hx, YY - hy)
    beam = np.clip(1 - np.abs(ang - (-0.38)) / .2, 0, 1) * np.exp(-dist / 700) * (XX > hx)
    a += np.array([230, 210, 150]) * beam[..., None] * .55
    a += np.array([255, 240, 190]) * np.exp(-dist / 26)[..., None] * .9
    a = glow(a, 30, .3)
    # 달빛 안개(지평선)
    a += np.array([60, 50, 46]) * (np.exp(-((YY - 1110) / 90) ** 2) * (0.6 + 0.4 * sm(120, 11)))[..., None] * .8
    a *= .85
    finish(a, "reel-scare.jpg", (1.02, 0.96, 0.9), 8, (620, 900))

# ───────── 안산 코노: 보랏빛 코인노래방 복도 ─────────
def kono():
    im, d = canvas((6, 4, 12))
    N = dict(x0=150, x1=930, y0=300, y1=1650); F = dict(x0=420, x1=660, y0=620, y1=1020)
    corridor(N, F, d, (22, 16, 40), (16, 12, 26), (38, 30, 70), (32, 24, 60))
    for i in range(0, 12):                                     # 바닥 타일
        t = zt(i, 12, 3.2); y = lerp(N['y1'], F['y1'], t)
        d.line([P(lerp(N['x0'], F['x0'], t), y), P(lerp(N['x1'], F['x1'], t), y)], fill=(30, 24, 50), width=2 * S)
    for side in ('x0', 'x1'):                                  # 부스 문: 유리창 + 안쪽 화면 빛
        for i in range(3):
            ta = zt(i, 3, 2.2) + .04; tb = ta + (zt(i + 1, 3, 2.2) - zt(i, 3, 2.2)) * .55
            d.polygon([wallpt(N, F, side, ta, .12), wallpt(N, F, side, tb, .12), wallpt(N, F, side, tb, 1), wallpt(N, F, side, ta, 1)], fill=(20, 14, 34), outline=(70, 50, 120))
            col = (120, 60, 200) if (i + (side == 'x1')) % 2 else (60, 90, 220)
            d.polygon([wallpt(N, F, side, lerp(ta, tb, .2), .2), wallpt(N, F, side, lerp(ta, tb, .8), .2), wallpt(N, F, side, lerp(ta, tb, .8), .5), wallpt(N, F, side, lerp(ta, tb, .2), .5)], fill=col)
    for i in range(1, 8, 2):                                   # 천장 네온 줄
        t = zt(i, 8)
        d.line([P(lerp(N['x0'], F['x0'], t) + 30, lerp(N['y0'], F['y0'], t) + 6), P(lerp(N['x1'], F['x1'], t) - 30, lerp(N['y0'], F['y0'], t) + 6)], fill=(200, 120, 255), width=4 * S)
    # 끝: 빨간 노래방 기계
    d.rectangle([P(F['x0'], F['y0']), P(F['x1'], F['y1'])], fill=(24, 18, 44))
    mx0, mx1, my0, my1 = 470, 610, 700, 1010
    d.rectangle([P(mx0, my0), P(mx1, my1)], fill=(130, 16, 30), outline=(40, 4, 8), width=3 * S)
    d.rectangle([P(mx0 + 14, my0 + 16), P(mx1 - 14, my0 + 100)], fill=(150, 170, 230))     # 화면
    for k in range(5):                                         # 화면 속 손자국(희미)
        cx = mx0 + 30 + k * 22; d.ellipse([P(cx - 8, my0 + 40 + (k % 2) * 16), P(cx + 8, my0 + 64 + (k % 2) * 16)], fill=(70, 80, 130))
    d.rectangle([P(mx0 + 30, my0 + 130), P(mx1 - 30, my0 + 150)], fill=(60, 8, 14))
    a = arr(im)
    a = glow(a, 40, .65) * .85
    a += np.array([170, 20, 40]) * np.exp(-(((XX - 540) / 120) ** 2 + ((YY - 860) / 200) ** 2))[..., None] * .55
    a *= (0.75 + 0.35 * sm(150, 13))[..., None]
    finish(a, "reel-kono.jpg", (0.98, 0.88, 1.12), 8, (540, 860))

for f in (sys.argv[2:] or ["bokdo", "sagwi", "scare", "kono"]): globals()[f]()
print("ok")
