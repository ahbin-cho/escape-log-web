"""쇼룸404 테마 3장의 배경: 공식 포스터를 '보고' 분위기만 새로 그린 그림(포스터 자체는 쓰지 않는다).
 한라아파트 4동 404호 = 검은 바탕에 떠 있는 눈알과 뻗는 손, 붉은 번짐 / PIG = 비 오는 밤 차 앞유리 너머 붉은 빛과 흐린 그림자
 블랙홀 = 네온 간판 틀과 보랏빛 소용돌이
사용: python3 tools/ig/drawings/showroom404_moods.py tools/ig/assets"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
out = sys.argv[1]; W, H = 1080, 1350; S = 2
rng = np.random.default_rng(404)
def grain(img, amt=10, seed=1):
    a = np.asarray(img).astype(np.float32); r = np.random.default_rng(seed)
    a += r.normal(0, amt, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def smooth_noise(w, h, scale, seed):
    r = np.random.default_rng(seed)
    small = Image.fromarray((r.random((max(2, h // scale), max(2, w // scale))) * 255).astype(np.uint8))
    return np.asarray(small.resize((w, h), Image.BICUBIC)).astype(np.float32) / 255

# ── 한라아파트 4동 404호 ──
def halla():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.zeros((H, W, 3), np.float32) + np.array([10, 9, 11])
    # 아래에서 번져 올라오는 붉은 얼룩(세로로 긁힌 결)
    streak = smooth_noise(W, H, 6, 2) * 0.5 + np.asarray(Image.fromarray((np.random.default_rng(3).random((H // 40, W // 3)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)) / 255 * 0.5
    red = np.clip((yy - 620) / 600, 0, 1) ** 1.3 * np.exp(-((xx - W * 0.5) / 420) ** 2) * (0.35 + 0.9 * streak)
    base += red[..., None] * np.array([170, 26, 20])
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).resize((W * S, H * S))
    d = ImageDraw.Draw(img, "RGBA")
    # 뻗어 오는 손: 손바닥 + 가늘어지는 손가락 다섯
    def hand(cx, cy, ang, size, col):
        ca, sa = math.cos(ang), math.sin(ang)
        def P(u, v): return ((cx + (u * ca - v * sa) * size) * S, (cy + (u * sa + v * ca) * size) * S)
        d.polygon([P(-1.6, -.28), P(0, -.5), P(.25, 0), P(0, .5), P(-1.6, .3)], fill=col)
        for k, (off, ln) in enumerate([(-.42, .95), (-.2, 1.25), (0, 1.35), (.2, 1.2), (.44, .8)]):
            bend = (rng.random() - .5) * .5
            pts = [P(.1, off)]
            for t in (0.4, 0.75, 1.0):
                pts.append(P(.1 + ln * t, off * (1 + .5 * t) + bend * t * t))
            for a, b, wd in zip(pts[:-1], pts[1:], (.2, .15, .09)):
                d.line([a, b], fill=col, width=int(wd * size * S))
            d.ellipse([pts[-1][0] - 3 * S, pts[-1][1] - 3 * S, pts[-1][0] + 3 * S, pts[-1][1] + 3 * S], fill=col)
    for cx, cy, ang, sz in [(60, 380, .25, 105), (30, 700, -.2, 120), (90, 1010, -.5, 110), (1030, 330, math.pi - .3, 105),
                             (1060, 640, math.pi + .15, 125), (1010, 960, math.pi + .5, 110), (240, 1300, -1.2, 95), (840, 1310, -1.9, 95)]:
        g = int(rng.integers(95, 150)); hand(cx, cy, ang, sz, (g, g - 8, g + 6, 235))
    img = img.filter(ImageFilter.GaussianBlur(1.2)); d = ImageDraw.Draw(img, "RGBA")
    # 떠 있는 눈알
    for cx, cy, r in [(120, 150, 34), (470, 90, 30), (930, 170, 38), (760, 420, 26), (250, 560, 30), (980, 520, 30),
                      (150, 860, 28), (900, 800, 34), (560, 1240, 30), (380, 250, 22)]:
        lx, ly = (rng.random(2) - .5) * r * .5
        d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], fill=(226, 222, 214, 255))
        d.ellipse([(cx - r) * S, (cy - r * .2) * S, (cx + r) * S, (cy + r) * S], fill=(178, 172, 170, 120))
        ir = r * .5
        d.ellipse([(cx + lx - ir) * S, (cy + ly - ir) * S, (cx + lx + ir) * S, (cy + ly + ir) * S], fill=(40, 34, 36, 255))
        d.ellipse([(cx + lx - ir * .45) * S, (cy + ly - ir * .45) * S, (cx + lx + ir * .45) * S, (cy + ly + ir * .45) * S], fill=(0, 0, 0, 255))
        d.ellipse([(cx + lx - ir * .5) * S, (cy + ly - ir * .6) * S, (cx + lx - ir * .2) * S, (cy + ly - ir * .3) * S], fill=(240, 240, 240, 230))
    img = img.resize((W, H), Image.LANCZOS)
    a = np.asarray(img).astype(np.float32) * (0.55 + 0.6 * smooth_noise(W, H, 3, 9))[..., None]   # 거친 인쇄 얼룩
    grain(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), 16, 5).save(os.path.join(out, "sr404-halla.jpg"), quality=90)

# ── PIG ──
def pig():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    glow = np.exp(-(((xx - 800) / 520) ** 2 + ((yy - 430) / 420) ** 2))
    col = np.zeros((H, W, 3), np.float32)
    col += (0.25 + 0.75 * glow)[..., None] * np.array([235, 96, 40]) * (0.55 + 0.45 * smooth_noise(W, H, 40, 11))[..., None]
    col += (np.clip(1 - xx / 700, 0, 1) * 0.5)[..., None] * np.array([-60, 10, 40])       # 왼쪽은 차갑게
    glass = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))
    # 유리 너머의 흐린 그림자(머리 + 어깨)
    fig = Image.new("L", (W, H), 0); fd = ImageDraw.Draw(fig)
    fd.ellipse([640, 190, 840, 420], fill=235); fd.rounded_rectangle([540, 370, 940, 900], 170, fill=235)
    fig = fig.filter(ImageFilter.GaussianBlur(30))
    glass = Image.composite(Image.new("RGB", (W, H), (30, 10, 10)), glass, fig)
    # 빗방울: 유리에 맺힌 점과 흘러내린 줄
    gd = ImageDraw.Draw(glass, "RGBA")
    for _ in range(1500):
        x, y = rng.random() * W, rng.random() * 780; r = rng.random() ** 3 * 5 + .8
        gd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 215, 190, int(40 + rng.random() * 90)))
    for _ in range(70):
        x, y = rng.random() * W, rng.random() * 600; ln = 40 + rng.random() * 220
        gd.line([(x, y), (x + rng.normal(0, 4), y + ln)], fill=(255, 220, 200, 50), width=2)
    glass = glass.filter(ImageFilter.GaussianBlur(1.0))
    # 차 안: 유리창 모양만 남기고 어둡게
    m = Image.new("L", (W * S, H * S), 0); md = ImageDraw.Draw(m)
    md.polygon([(70 * S, 150 * S), (1010 * S, 110 * S), (1050 * S, 700 * S), (40 * S, 760 * S)], fill=255)
    m = m.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3))
    inside = np.zeros((H, W, 3), np.float32) + np.array([16, 13, 14])
    inside += (np.clip((yy - 760) / 200, 0, 1) * np.clip(1 - (yy - 760) / 420, 0, 1) * 0.9)[..., None] * np.array([70, 34, 18])  # 대시보드에 닿는 붉은 빛
    img = Image.composite(glass, Image.fromarray(np.clip(inside, 0, 255).astype(np.uint8)), m)
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([420, 96, 690, 176], 26, fill=(12, 10, 11, 255))               # 룸미러
    d.ellipse([-230, 760, 330, 1320], outline=(34, 30, 32, 255), width=46)             # 운전대
    d.ellipse([-230, 760, 330, 1320], outline=(70, 44, 34, 120), width=4)
    for x in (560, 760):                                                               # 송풍구
        d.rounded_rectangle([x, 840, x + 150, 900], 10, fill=(9, 8, 9, 255), outline=(60, 38, 28, 255), width=3)
    grain(img, 14, 7).save(os.path.join(out, "sr404-pig.jpg"), quality=90)

# ── 블랙홀 ──
def blackhole():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = 540, 820
    dx, dy = xx - cx, (yy - cy) * 1.05
    r = np.hypot(dx, dy) + 1e-3; th = np.arctan2(dy, dx)
    ph = th * 1.0 + np.log(r) * 2.6 + smooth_noise(W, H, 60, 21) * 1.2
    band = 0.5 + 0.5 * np.sin(ph * 2); band2 = 0.5 + 0.5 * np.sin(ph * 5 + 1.3)
    pal = (np.array([70, 30, 150])[None, None] * (1 - band[..., None]) + np.array([240, 150, 120])[None, None] * band[..., None])
    pal = pal * (0.55 + 0.45 * band2[..., None]) + np.array([255, 230, 210]) * (np.clip(band * band2 - .55, 0, 1) * 1.6)[..., None]
    disc = np.clip(1 - r / 330, 0, 1) ** 0.6 * np.clip(r / 26, 0, 1)
    a = np.zeros((H, W, 3), np.float32) + np.array([7, 8, 20]) + pal * disc[..., None]
    a += (np.exp(-((r - 340) / 60) ** 2) * 0.5)[..., None] * np.array([120, 50, 200])
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # 네온 틀: 선을 그리고, 번진 것을 더한다
    neon = Image.new("RGB", (W, H), 0); nd = ImageDraw.Draw(neon)
    CY, OR, PK = (70, 225, 255), (255, 150, 60), (255, 80, 190)
    nd.rounded_rectangle([110, 90, 970, 400], 14, outline=OR, width=5); nd.rounded_rectangle([132, 112, 948, 378], 10, outline=CY, width=4)
    nd.rounded_rectangle([250, 420, 830, 470], 8, outline=PK, width=4)
    nd.rounded_rectangle([150, 470, 930, 1170], 6, outline=(120, 70, 230), width=4)
    for x in (120, 960):
        nd.line([(x, 520), (x, 1120)], fill=OR, width=5)
    nd.rounded_rectangle([170, 500, 215, 560], 14, outline=PK, width=4); nd.rounded_rectangle([865, 500, 910, 620], 14, outline=(255, 235, 245), width=5)
    glowl = np.asarray(neon.filter(ImageFilter.GaussianBlur(18))).astype(np.float32) * 1.5 + np.asarray(neon.filter(ImageFilter.GaussianBlur(4))).astype(np.float32) * 1.2
    core = np.asarray(neon).astype(np.float32)
    a = np.asarray(img).astype(np.float32) + glowl + core * 0.6 + (core > 0) * 70
    # 젖은 바닥: 위쪽을 뒤집어 가로로 번지게
    fy = 1175
    refl = a[fy - (H - fy):fy][::-1]
    refl = np.asarray(Image.fromarray(np.clip(refl, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7)).resize((W, H - fy)).filter(ImageFilter.BoxBlur(3))).astype(np.float32)
    a[fy:] = np.array([6, 6, 14]) + refl * 0.42 * np.linspace(1, .3, H - fy)[:, None, None]
    grain(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), 9, 3).save(os.path.join(out, "sr404-blackhole.jpg"), quality=90)

halla(); pig(); blackhole()
