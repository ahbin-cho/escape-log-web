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
    # 멈춘 차(오른쪽 아래, 옆모습): 왼쪽(밭 쪽)을 보고 서 있다. 달빛이 지붕·문 윤곽에 걸리고, 찌그러진 앞에서 연기
    X0, Y0 = 500, 1380                                                                             # 차 왼쪽 위 기준
    body = [P(X0, Y0 + 90), P(X0 + 30, Y0 + 60), P(X0 + 120, Y0 + 50), P(X0 + 170, Y0), P(X0 + 330, Y0 - 4), P(X0 + 390, Y0 + 50),
            P(X0 + 460, Y0 + 58), P(X0 + 470, Y0 + 130), P(X0 + 8, Y0 + 138)]
    d.polygon(body, fill=(78, 34, 36))
    d.polygon([P(X0 + 180, Y0 + 12), P(X0 + 252, Y0 + 10), P(X0 + 252, Y0 + 50), P(X0 + 136, Y0 + 52)], fill=(70, 92, 120))   # 앞 유리창
    d.polygon([P(X0 + 262, Y0 + 10), P(X0 + 326, Y0 + 8), P(X0 + 372, Y0 + 52), P(X0 + 262, Y0 + 50)], fill=(64, 86, 112))    # 뒤 유리창
    d.line([P(X0 + 190, Y0 + 16), P(X0 + 160, Y0 + 46)], fill=(170, 190, 215), width=3 * S)                                     # 유리 반사
    d.line([P(X0 + 30, Y0 + 60), P(X0 + 120, Y0 + 50), P(X0 + 170, Y0), P(X0 + 330, Y0 - 4), P(X0 + 390, Y0 + 50), P(X0 + 460, Y0 + 58)], fill=(176, 160, 150), width=3 * S)  # 달빛 윤곽
    d.line([P(X0 + 256, Y0 + 54), P(X0 + 256, Y0 + 128)], fill=(40, 16, 18), width=2 * S)                                        # 문 틈
    d.line([P(X0 + 10, Y0 + 92), P(X0 + 60, Y0 + 70), P(X0 + 95, Y0 + 92)], fill=(40, 16, 18), width=4 * S)                     # 찌그러진 앞쪽
    for cx in (X0 + 95, X0 + 380):                                                                                                # 바퀴
        d.ellipse([P(cx - 46, Y0 + 98), P(cx + 46, Y0 + 190)], fill=(8, 8, 10)); d.ellipse([P(cx - 20, Y0 + 124), P(cx + 20, Y0 + 164)], fill=(90, 90, 96))
    d.rectangle([P(X0 + 452, Y0 + 66), P(X0 + 468, Y0 + 92)], fill=(255, 60, 50))                                                # 미등
    d.ellipse([P(X0 - 6, Y0 + 84), P(X0 + 22, Y0 + 108)], fill=(255, 246, 210))                                                  # 헤드라이트
    a = arr(im)
    # 헤드라이트 하나: 옥수수밭 쪽으로 뻗는 빛
    hx, hy = 502, 1476
    ang = np.arctan2(YY - hy, XX - hx); dist = np.hypot(XX - hx, YY - hy)
    beam = np.clip(1 - np.abs(np.abs(ang) - (np.pi - 0.38)) / .22, 0, 1) * np.exp(-dist / 700) * (XX < hx) * (YY < hy + 40)
    a += np.array([230, 210, 150]) * beam[..., None] * .55
    a += np.array([255, 240, 190]) * np.exp(-dist / 26)[..., None] * .9
    td = np.hypot(XX - 960, YY - 1459); a += np.array([255, 40, 30]) * np.exp(-td / 40)[..., None] * .7   # 미등 번짐
    sm_ = sm(40, 31); smoke = np.exp(-((XX - 520 + (1380 - YY) * .25) / (40 + (1400 - YY).clip(0) * .35)) ** 2) * ((YY < 1420) & (YY > 1080)) * (0.4 + 0.6 * sm_) * np.clip((YY - 1080) / 340, 0, 1)
    a += np.array([150, 150, 160]) * smoke[..., None] * .35                                   # 앞쪽에서 오르는 연기
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

# ───────── 낙화: 밤 옥상 끝, 아래로 도시 불빛, 흩날리는 붉은 꽃잎 ─────────
def nakhwa():
    im = Image.new("RGB", (W * S, H * S)); d = ImageDraw.Draw(im, "RGBA")
    for y in range(H):                                           # 하늘: 검남색 → 아래 도시 빛 번짐
        t = y / H; d.line([P(0, y), P(W, y)], fill=(int(lerp(6, 40, t ** 3)), int(lerp(8, 22, t ** 3)), int(lerp(22, 46, t ** 3))), width=S)
    for _ in range(900):                                         # 아래 도시 불빛(멀리)
        x = rng.uniform(0, W); y = rng.uniform(1380, H); r = rng.uniform(.8, 2.6)
        c = [(255, 214, 140), (255, 240, 220), (180, 200, 255), (255, 120, 120)][rng.integers(4)]
        d.ellipse([P(x - r, y - r), P(x + r, y + r)], fill=c + (int(rng.uniform(120, 255)),))
    for i in range(14):                                          # 건물 실루엣
        x0 = i * 80 + rng.uniform(-20, 10); h = rng.uniform(80, 260)
        d.rectangle([P(x0, 1400 - h), P(x0 + rng.uniform(50, 90), 1420)], fill=(8, 8, 16))
        for k in range(int(h // 30)):
            if rng.random() < .4: d.rectangle([P(x0 + 10, 1400 - h + 14 + k * 30), P(x0 + 22, 1400 - h + 24 + k * 30)], fill=(220, 180, 110, 160))
    # 옥상 난간(가까이, 아래쪽)
    d.polygon([P(0, 1560), P(W, 1500), P(W, H), P(0, H)], fill=(14, 12, 18))
    d.line([P(0, 1530), P(W, 1470)], fill=(60, 56, 66), width=10 * S)
    for x in range(0, W + 1, 120): d.line([P(x, 1530 - x * .0556), P(x, 1600 - x * .0556)], fill=(40, 38, 46), width=8 * S)
    # 난간 위에 놓인 꽃 한 송이(붉은 장미)
    fx, fy = 640, 1490
    d.line([P(fx - 120, fy + 6), P(fx + 10, fy - 4)], fill=(40, 70, 40), width=5 * S)
    d.polygon([P(fx - 60, fy - 2), P(fx - 30, fy - 22), P(fx - 20, fy - 4)], fill=(50, 90, 50))          # 잎
    for k, (dx, dy, rx, ry, c) in enumerate([(0, 0, 34, 24, (120, 10, 26)), (-14, -6, 22, 18, (170, 22, 40)), (14, -8, 22, 18, (160, 20, 38)),
                                             (0, -16, 20, 14, (196, 34, 52)), (-6, -4, 12, 10, (90, 6, 20)), (6, -10, 9, 8, (220, 60, 76))]):
        d.ellipse([P(fx + 30 + dx - rx, fy - 18 + dy - ry), P(fx + 30 + dx + rx, fy - 18 + dy + ry)], fill=c)
    d.arc([P(fx + 18, fy - 34), P(fx + 42, fy - 12)], 200, 520, fill=(80, 4, 16), width=2 * S)
    a = arr(im)
    a = glow(a, 30, .45)
    a += np.array([90, 40, 60]) * (np.exp(-((YY - 1420) / 220) ** 2))[..., None] * .5
    a *= .9
    finish(a, "reel-nakhwa.jpg", (1.0, 0.94, 1.02), 7, (540, 1000))
    # 꽃잎 한 장(겹쳐 띄우는 PNG)
    pt = Image.new("RGBA", (120, 90), (0, 0, 0, 0)); pd = ImageDraw.Draw(pt)
    pd.ellipse([8, 10, 112, 80], fill=(196, 26, 52, 255)); pd.ellipse([30, 20, 90, 60], fill=(226, 60, 80, 255))
    pt.filter(ImageFilter.GaussianBlur(1)).save(os.path.join(out, "reel-nakhwa-petal.png"))

# ───────── 몽염: 아무것도 없는 어둠, 멀리 서서 바라보는 그녀 ─────────
def mongyeom():
    a = np.zeros((H, W, 3), np.float32)
    mist = sm(220, 21) * .6 + sm(70, 22) * .4
    a += np.array([28, 30, 44]) * (mist * np.exp(-((YY - 1150) / 520) ** 2))[..., None]
    a += np.array([36, 40, 56]) * np.exp(-((YY - 1240) / 40) ** 2)[..., None] * .6          # 바닥선(물 같은)
    finish(a, "reel-mongyeom.jpg", (0.92, 0.96, 1.1), 7, (540, 1100))
    # 그녀(따로 겹치는 PNG): 흰 원피스, 긴 머리, 얼굴은 그늘
    g = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    cx, top = 540, 980
    d.polygon([P(cx - 22, top + 70), P(cx + 22, top + 70), P(cx + 58, top + 250), P(cx - 58, top + 250)], fill=(205, 205, 214, 255))   # 원피스
    d.rectangle([P(cx - 14, top + 250), P(cx - 6, top + 262)], fill=(150, 150, 160, 255)); d.rectangle([P(cx + 6, top + 250), P(cx + 14, top + 262)], fill=(150, 150, 160, 255))
    d.line([P(cx - 24, top + 80), P(cx - 34, top + 170)], fill=(190, 190, 200, 255), width=9 * S); d.line([P(cx + 24, top + 80), P(cx + 34, top + 170)], fill=(190, 190, 200, 255), width=9 * S)
    d.ellipse([P(cx - 22, top + 18), P(cx + 22, top + 68)], fill=(120, 120, 132, 255))                                               # 얼굴(그늘)
    d.polygon([P(cx - 30, top + 30), P(cx, top + 6), P(cx + 30, top + 30), P(cx + 34, top + 150), P(cx + 18, top + 110), P(cx - 18, top + 110), P(cx - 34, top + 150)], fill=(8, 8, 12, 255))   # 긴 머리
    d.ellipse([P(cx - 14, top + 34), P(cx + 14, top + 68)], fill=(100, 100, 112, 255))
    g = g.resize((W, H), Image.LANCZOS)
    rf = g.transpose(Image.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(5))                # 물 같은 바닥에 비친 모습
    rf = Image.fromarray((np.asarray(rf).astype(np.float32) * np.array([1, 1, 1, .25])).astype(np.uint8))
    canvas2 = Image.new("RGBA", (W, H), (0, 0, 0, 0)); canvas2.alpha_composite(g)
    shift = 2 * (top + 262) - H; canvas2.alpha_composite(rf, (0, shift)) if shift >= 0 else None
    canvas2.filter(ImageFilter.GaussianBlur(.8)).save(os.path.join(out, "reel-mongyeom-her.png"))

# ───────── 허수아비(달리는 버전): 하늘·허수아비 / 먼 옥수수 / 길 / 가까운 옥수수 / 차를 따로 그려 겹치고 흘려 보낸다 ─────────
def scare_drive():
    W2 = 2160
    # 1) 하늘 + 달 + 허수아비 + 지평선(아래는 어둡게)
    im = Image.new("RGB", (W * S, H * S)); d = ImageDraw.Draw(im, "RGBA")
    for y in range(0, 1100):
        t = y / 1100; d.line([P(0, y), P(W, y)], fill=(int(lerp(8, 70, t ** 2)), int(lerp(12, 46, t ** 2)), int(lerp(26, 40, t ** 2))), width=S)
    d.ellipse([P(700, 230), P(860, 390)], fill=(236, 228, 200))
    d.rectangle([P(0, 1100), P(W, H)], fill=(10, 12, 8))
    sx, sy = 760, 700; K = (6, 6, 8)
    d.line([P(sx, sy - 40), P(sx, 1180)], fill=K, width=12 * S)
    d.line([P(sx - 150, sy + 40), P(sx + 150, sy + 30)], fill=K, width=10 * S)
    d.polygon([P(sx - 70, sy + 20), P(sx + 70, sy + 20), P(sx + 90, sy + 260), P(sx + 40, sy + 240), P(sx, sy + 270), P(sx - 50, sy + 245), P(sx - 92, sy + 262)], fill=K)
    d.ellipse([P(sx - 52, sy - 70), P(sx + 52, sy + 30)], fill=K)
    d.polygon([P(sx - 110, sy - 40), P(sx + 110, sy - 44), P(sx + 40, sy - 70), P(sx + 20, sy - 150), P(sx - 30, sy - 150), P(sx - 44, sy - 72)], fill=K)
    a = arr(im)
    a += np.array([60, 50, 46]) * (np.exp(-((YY - 1110) / 90) ** 2) * (0.6 + 0.4 * sm(120, 11)))[..., None] * .8
    finish(a * .9, "reel-scare-sky.jpg", (1.02, 0.96, 0.9), 7, (620, 900))
    # 2) 옥수수 띠(가로 2160, 좌우 이어지게): 먼 줄 / 가까운 줄
    def corn(rows, name, y0, scale0, scale1, dark):
        Hh = 1920 - y0
        im = Image.new("RGBA", (W2 * S, Hh * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        for row in rows:
            t = (row - rows[0]) / max(1, rows[-1] - rows[0]); y = lerp(30, Hh - 40, t ** 1.4); sc = lerp(scale0, scale1, t)
            col = (int((30 + 20 * sc) * dark), int((36 + 18 * sc) * dark), int((14 + 6 * sc) * dark), 255)
            for x in np.arange(0, W2, 24 * sc):
                h = (60 + rng.uniform(-14, 20)) * sc; xx = x + rng.uniform(-6, 6)
                for off in (0, W2, -W2):                                  # 가장자리에서 반대편으로 이어 그려 이음매를 없앤다
                    X = xx + off
                    if -60 < X < W2 + 60:
                        d.line([(X * S, y * S), ((X + rng.normal(0, 4) * sc) * S, (y - h) * S)], fill=col, width=max(1, int(3 * sc * S)))
                        for k in range(2):
                            ly = y - h * rng.uniform(.3, .85); s_ = rng.choice([-1, 1])
                            d.line([(X * S, ly * S), ((X + s_ * 26 * sc) * S, (ly + 12 * sc) * S)], fill=col, width=max(1, int(2 * sc * S)))
            if row == rows[0]: d.rectangle([0, int((y + 2) * S), W2 * S, Hh * S], fill=(10, 12, 8, 255))
        im.resize((W2, Hh), Image.LANCZOS).save(os.path.join(out, name))
    corn(list(range(0, 14)), "reel-scare-corn-far.png", 1080, .35, 1.1, 1.7)
    corn(list(range(0, 6)), "reel-scare-corn-near.png", 1600, 1.6, 2.4, 1.3)
    # 3) 흙길 띠(가로 2160): 바퀴 자국과 돌
    road = Image.new("RGBA", (W2, 170), (52, 44, 34, 255)); rd = ImageDraw.Draw(road)
    for k in range(260):
        x = rng.uniform(0, W2); y = rng.uniform(10, 160); r = rng.uniform(1.5, 5)
        rd.ellipse([x - r, y - r * .6, x + r, y + r * .6], fill=(int(rng.uniform(70, 110)), int(rng.uniform(60, 90)), int(rng.uniform(45, 70)), 255))
    for y in (52, 118): rd.line([(0, y), (W2, y)], fill=(38, 32, 24, 255), width=10)
    road.save(os.path.join(out, "reel-scare-road.png"))
    # 4) 차(옆모습, 왼쪽을 본다)
    cw, ch = 520, 230
    car = Image.new("RGBA", (cw * S, ch * S), (0, 0, 0, 0)); d = ImageDraw.Draw(car)
    Q = lambda x, y: ((x + 30) * S, (y + 30) * S)
    d.polygon([Q(0, 90), Q(30, 60), Q(120, 50), Q(170, 0), Q(330, -4), Q(390, 50), Q(460, 58), Q(470, 130), Q(8, 138)], fill=(150, 52, 52, 255))
    d.polygon([Q(180, 12), Q(252, 10), Q(252, 50), Q(136, 52)], fill=(96, 122, 156, 255))
    d.polygon([Q(262, 10), Q(326, 8), Q(372, 52), Q(262, 50)], fill=(86, 112, 146, 255))
    d.line([Q(190, 16), Q(160, 46)], fill=(200, 215, 235, 255), width=3 * S)
    d.line([Q(30, 60), Q(120, 50), Q(170, 0), Q(330, -4), Q(390, 50), Q(460, 58)], fill=(230, 200, 180, 255), width=3 * S)
    d.line([Q(256, 54), Q(256, 128)], fill=(70, 22, 24, 255), width=2 * S)
    for cx in (95, 380):
        d.ellipse([Q(cx - 46, 98), Q(cx + 46, 190)], fill=(12, 12, 14, 255)); d.ellipse([Q(cx - 20, 124), Q(cx + 20, 164)], fill=(120, 120, 128, 255))
    d.rectangle([Q(452, 66), Q(468, 92)], fill=(255, 70, 60, 255))
    d.ellipse([Q(-6, 84), Q(22, 108)], fill=(255, 248, 220, 255))
    car = car.resize((cw, ch), Image.LANCZOS)
    a = np.asarray(car).astype(np.float32); a[..., :3] *= .62                                    # 밤이라 어둡게(윤곽·불빛은 밝게 남김)
    lit = (np.asarray(car)[..., :3].max(-1) > 200)
    a[lit, :3] = np.asarray(car)[lit, :3]
    Image.fromarray(a.astype(np.uint8)).save(os.path.join(out, "reel-scare-car.png"))

for f in (sys.argv[2:] or ["bokdo", "sagwi", "scare", "kono"]): globals()[f]()
print("ok")
