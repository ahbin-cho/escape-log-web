"""영안실·춘화각 릴스 배경: 공식 포스터의 분위기를 보고 새로 그린 그림(포스터 자체는 끝에 작게만 쓴다).
 영안실 = 검은 화면 오른쪽이 세로로 열리고, 그 안에 초록 형광등 아래 시신 보관함이 늘어선 복도와 EXIT 문
 춘화각 = 보랏빛 어두운 방, 위에서 내려다본 마룻바닥, 흰 종이를 매단 금줄, 푸른 치마를 펼치고 앉은 여인(얼굴은 그늘)
사용: python3 tools/ig/drawings/poster_moods.py tools/ig/assets"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
out = sys.argv[1]; W, H = 1080, 1920; SS = 2
rng = np.random.default_rng(30)
def sm(scale, seed, w=W, h=H):
    r = np.random.default_rng(seed); a = r.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255
def lerp(a, b, t): return a + (b - a) * t
def finish(img, name, tint, grain=8, vig=(540, 900)):
    a = np.asarray(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    v = np.clip(1 - (((xx - vig[0]) / (W * .75)) ** 2 + ((yy - vig[1]) / (H * .62)) ** 2), 0, 1) ** .6
    a *= (0.3 + 0.7 * v)[..., None]; a *= np.array(tint)
    sc = Image.new("L", (W, H), 0); sd = ImageDraw.Draw(sc)
    for _ in range(500):
        x, y = rng.random() * W, rng.random() * H; r = rng.random() ** 3 * 2.5 + .4
        sd.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(60, 180)))
    for _ in range(30):
        x, y = rng.random() * W, rng.random() * H; L = rng.uniform(30, 160)
        sd.line([(x, y), (x + rng.normal(0, 6), y + L)], fill=int(rng.uniform(30, 90)), width=1)
    d = np.asarray(sc).astype(np.float32)[..., None] / 255
    a = a * (1 - d * .5) + 200 * d * .08
    a += rng.normal(0, grain, (H, W, 1))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(out, name), quality=92)

# ───────── 영안실 ─────────
def morgue():
    S = SS; im = Image.new("RGB", (W * S, H * S), (2, 4, 3)); d = ImageDraw.Draw(im, "RGBA")
    P = lambda x, y: (x * S, y * S)
    N = dict(x0=400, x1=1010, y0=170, y1=1690)                 # 열린 문틈(가까운 면)
    F = dict(x0=680, x1=870, y0=700, y1=930)                   # 복도 끝 벽
    def pt(side, t, v):                                        # 깊이 t(0 가까움~1 끝), v(0 위~1 아래)
        x = lerp(N[side], F[side], t); y = lerp(lerp(N['y0'], F['y0'], t), lerp(N['y1'], F['y1'], t), v); return P(x, y)
    def zt(i, n): return 1 - 1 / (1 + 2.6 * i / n)              # 원근으로 촘촘해지는 깊이
    G = lambda k: (int(18 + 60 * k), int(40 + 110 * k), int(30 + 80 * k))
    # 천장
    d.polygon([P(N['x0'], N['y0']), P(N['x1'], N['y0']), P(F['x1'], F['y0']), P(F['x0'], F['y0'])], fill=(14, 30, 24))
    for i in range(1, 9):                                      # 천장 판 줄
        t = zt(i, 8); y = lerp(N['y0'], F['y0'], t); d.line([P(lerp(N['x0'], F['x0'], t), y), P(lerp(N['x1'], F['x1'], t), y)], fill=(30, 52, 42), width=2 * S)
    for t0, t1 in ((.05, .2), (.42, .52), (.68, .74)):         # 형광등
        def cp(t, u): return P(lerp(lerp(N['x0'], F['x0'], t), lerp(N['x1'], F['x1'], t), u), lerp(N['y0'], F['y0'], t) + 4)
        d.polygon([cp(t0, .45), cp(t0, .95), cp(t1, .9), cp(t1, .5)], fill=(190, 255, 215))
    # 바닥
    d.polygon([P(N['x0'], N['y1']), P(N['x1'], N['y1']), P(F['x1'], F['y1']), P(F['x0'], F['y1'])], fill=(10, 22, 17))
    # 오른쪽 벽
    d.polygon([P(N['x1'], N['y0']), P(F['x1'], F['y0']), P(F['x1'], F['y1']), P(N['x1'], N['y1'])], fill=(26, 52, 42))
    # 왼쪽 벽: 시신 보관함(서랍) 격자
    d.polygon([P(N['x0'], N['y0']), P(F['x0'], F['y0']), P(F['x0'], F['y1']), P(N['x0'], N['y1'])], fill=(20, 42, 34))
    cols = 6
    for i in range(cols):
        ta, tb = zt(i, cols) + .01, zt(i + 1, cols) - .012
        for r in range(4):
            va, vb = .1 + r * .2 + .012, .1 + (r + 1) * .2 - .012
            poly = [pt('x0', ta, va), pt('x0', tb, va), pt('x0', tb, vb), pt('x0', ta, vb)]
            k = .55 - .35 * ta + rng.uniform(-.06, .06)
            d.polygon(poly, fill=G(k), outline=(8, 18, 14))
            hx = pt('x0', lerp(ta, tb, .2), lerp(va, vb, .5)); hw = (1 - ta) * 10 * S
            d.rectangle([hx[0] - hw, hx[1] - hw * .4, hx[0] + hw, hx[1] + hw * .4], fill=(120, 160, 140))
    # 끝 벽과 문
    d.rectangle([P(F['x0'], F['y0']), P(F['x1'], F['y1'])], fill=(46, 84, 66))
    dx0, dx1, dy0 = F['x0'] + 50, F['x1'] - 40, F['y0'] + 70
    d.rectangle([P(dx0, dy0), P(dx1, F['y1'])], fill=(30, 58, 46), outline=(18, 34, 28), width=3 * S)
    d.line([P((dx0 + dx1) / 2, dy0), P((dx0 + dx1) / 2, F['y1'])], fill=(18, 34, 28), width=3 * S)
    for x in ((dx0 + dx1) / 2 - 18, (dx0 + dx1) / 2 + 10):
        d.rectangle([P(x, dy0 + 30), P(x + 8, dy0 + 90)], fill=(170, 60, 50))
    d.rectangle([P((dx0 + dx1) / 2 - 24, dy0 - 34), P((dx0 + dx1) / 2 + 24, dy0 - 16)], fill=(150, 255, 190))   # EXIT 표시등
    # 들것
    d.line([P(F['x1'] - 20, F['y1'] - 40), P(F['x1'] + 40, F['y1'] - 40)], fill=(90, 120, 105), width=3 * S)
    im = im.resize((W, H), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # 바닥 반사: 위 절반을 뒤집어 흐리게
    fl = int(lerp(N['y1'], F['y1'], 0)); mid = F['y1']
    refl = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).transpose(Image.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(10))).astype(np.float32)
    shift = int(2 * mid - H)
    refl = np.roll(refl, shift, axis=0)
    floor = (yy > mid) & (xx > N['x0']) & (xx < N['x1'])
    a[floor] = a[floor] * .75 + refl[floor] * .14
    # 형광등 번짐·안개
    glow = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
    a = (a + glow * .35) * .72
    a *= (0.75 + 0.35 * sm(140, 4))[..., None]
    # 문틈 밖은 검게, 왼쪽 가장자리에 아주 약한 초록 번짐
    inside = np.clip(np.minimum.reduce([(xx - N['x0']) / 6, (N['x1'] - xx) / 30, (yy - N['y0']) / 30, (N['y1'] - yy) / 60]), 0, 1)
    spill = np.exp(-np.maximum(0, N['x0'] - xx) / 60) * (yy > N['y0']) * (yy < N['y1']) * (xx < N['x0'])
    a = a * inside[..., None] + np.array([10, 30, 22]) * (spill * .6)[..., None]
    finish(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), "reel-morgue-hall.jpg", (0.92, 1.0, 0.94), 7, (720, 900))

# ───────── 춘화각 ─────────
def chunhwa():
    S = SS; im = Image.new("RGB", (W * S, H * S), (18, 8, 26)); d = ImageDraw.Draw(im, "RGBA")
    P = lambda x, y: (x * S, y * S)
    vp = (540, -300)                                           # 위에서 내려다본 원근(소실점이 화면 위 밖)
    # 마룻바닥 판자: 소실점으로 모이는 선 + 판자마다 다른 밝기
    xs = np.linspace(-500, 1580, 26)
    for i in range(len(xs) - 1):
        k = rng.uniform(.75, 1.15)
        col = (int(62 * k), int(34 * k), int(78 * k))
        def at(x, y): t = (y - vp[1]) / (H + 200 - vp[1]); return (vp[0] + (x - vp[0]) * t, y)
        a0, a1 = at(xs[i], 280), at(xs[i + 1], 280); b0, b1 = at(xs[i], H + 200), at(xs[i + 1], H + 200)
        d.polygon([P(*a0), P(*a1), P(*b1), P(*b0)], fill=col, outline=(20, 8, 26))
    for _ in range(140):                                       # 나뭇결
        x = rng.uniform(0, W); y = rng.uniform(300, H); L = rng.uniform(40, 160)
        d.line([P(x, y), P(x + (x - vp[0]) * L / (y - vp[1]), y + L)], fill=(30, 12, 40, 120), width=S)
    # 양쪽 벽과 문살(창호)
    for side in (0, 1):
        x0, x1 = (0, 170) if side == 0 else (910, W)
        d.rectangle([P(x0, 0), P(x1, H)], fill=(26, 10, 36))
        for y in range(80, H, 150):
            d.rectangle([P(x0 + 18, y), P(x1 - 18, y + 120)], outline=(60, 30, 70), width=4 * S)
            d.line([P((x0 + x1) / 2, y), P((x0 + x1) / 2, y + 120)], fill=(60, 30, 70), width=3 * S)
            d.line([P(x0 + 18, y + 60), P(x1 - 18, y + 60)], fill=(60, 30, 70), width=3 * S)
    # 위쪽 벽(어둠)
    d.rectangle([P(0, 0), P(W, 300)], fill=(20, 8, 28))
    # 여인: 푸른 치마를 둥글게 펼치고 앉아 고개를 숙였다(얼굴은 머리카락 그늘)
    cx, cy = 560, 980
    d.ellipse([P(cx - 330, cy - 40), P(cx + 300, cy + 300)], fill=(26, 20, 100))
    for k in range(9):                                         # 치마 주름
        a = math.pi * (0.1 + 0.8 * k / 8)
        d.line([P(cx - 10, cy + 40), P(cx + 300 * math.cos(a) * -1.05, cy + 130 + 160 * math.sin(a))], fill=(20, 16, 80, 150), width=6 * S)
    d.ellipse([P(cx - 250, cy + 10), P(cx + 200, cy + 230)], fill=(52, 46, 170, 120))
    d.polygon([P(cx - 110, cy + 40), P(cx + 90, cy + 40), P(cx + 70, cy - 150), P(cx - 90, cy - 150)], fill=(150, 130, 160))   # 저고리
    d.polygon([P(cx - 110, cy + 40), P(cx - 160, cy + 10), P(cx - 120, cy - 120), P(cx - 90, cy - 150)], fill=(120, 100, 135))
    d.polygon([P(cx + 90, cy + 40), P(cx + 140, cy + 10), P(cx + 100, cy - 120), P(cx + 70, cy - 150)], fill=(120, 100, 135))
    d.line([P(cx - 10, cy - 140), P(cx + 20, cy - 40)], fill=(150, 40, 60), width=8 * S)           # 고름
    d.ellipse([P(cx - 70, cy - 280), P(cx + 60, cy - 130)], fill=(20, 12, 22))                    # 숙인 머리
    d.polygon([P(cx - 72, cy - 210), P(cx - 95, cy - 60), P(cx - 40, cy - 120)], fill=(20, 12, 22))
    d.polygon([P(cx + 58, cy - 210), P(cx + 80, cy - 70), P(cx + 30, cy - 120)], fill=(20, 12, 22))
    # 금줄: 왼쪽 위에서 오른쪽으로 비스듬히 두 줄, 흰 종이 띠를 지그재그로 매단다
    def rope(p0, p1, sag, n_paper):
        pts = [(lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t) + sag * math.sin(math.pi * t)) for t in np.linspace(0, 1, 60)]
        d.line([P(*q) for q in pts], fill=(14, 6, 10), width=16 * S)
        d.line([P(*q) for q in pts], fill=(70, 44, 40), width=7 * S)
        for j in range(n_paper):
            t = (j + .5) / n_paper; i = int(t * 59); x, y = pts[i]
            L = rng.uniform(80, 130); wd = rng.uniform(26, 36); z = []
            for k in range(5):
                z.append((x + (wd if k % 2 else -wd * .2), y + L * k / 4))
            poly = [P(x - wd * .3, y)] + [P(*q) for q in z] + [P(x + wd, y + L), P(x + wd * .6, y)]
            d.polygon(poly, fill=(226, 206, 196), outline=(120, 90, 110))
    rope((-40, 560), (1120, 700), 120, 7)
    rope((-40, 840), (1120, 1040), 90, 6)
    im = im.resize((W, H), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    a *= (0.6 + 0.6 * sm(90, 7))[..., None]                    # 얼룩진 어둠
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    light = np.exp(-(((xx - 560) / 420) ** 2 + ((yy - 900) / 600) ** 2))
    a *= (0.3 + 0.75 * light)[..., None]
    a = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32)
    finish(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), "reel-chunhwa-room.jpg", (1.0, 0.86, 1.08), 9, (560, 900))

morgue(); chunhwa()
