"""비공식클래스 카드 배경 — 공식 포스터의 분위기를 보고 새로 그린 그림(포스터를 베끼지 않는다).
핏빛 폭풍 구름 · 붉은 달 · 붉은 번개 · 앙상한 나무 · 붉게 불 켜진 옛 체육관(유리 정면 별관 + 둥근 본관)
· 젖은 아스팔트 반사 · 낮게 깔린 안개.

python3 tools/ig/drawings/klass_bg.py  → tools/ig/assets/klass-bg-story.jpg (1080×1920), klass-bg-feed.jpg (1080×1350)
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "assets")
S = 2  # 2배로 그린 뒤 줄인다(선 매끄럽게)


def noise(w, h, scale, seed):
    r = np.random.default_rng(seed)
    a = r.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255


def fbm(w, h, base, seed, oct=5):
    t, amp, tot = np.zeros((h, w), np.float32), 1.0, 0.0
    for i in range(oct):
        t += noise(w, h, max(2, base >> i), seed + i * 17) * amp
        tot += amp
        amp *= 0.55
    return t / tot


def warp(field, dx, dy):
    h, w = field.shape
    yy, xx = np.mgrid[0:h, 0:w]
    x2 = np.clip((xx + dx).astype(np.int32), 0, w - 1)
    y2 = np.clip((yy + dy).astype(np.int32), 0, h - 1)
    return field[y2, x2]


def blur(a, r):
    """float 배열(0~1 근처) 가우스 흐림 — PIL 로"""
    if a.ndim == 2:
        im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
        return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255
    return np.stack([blur(a[..., c], r) for c in range(a.shape[2])], -1)


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def paint(W, H, gy, seed, moon, bolt):
    """W,H: 최종 크기 / gy: 땅 높이(최종 좌표) / moon: (x,y) 비율 / bolt: 번개 x 비율"""
    w, h, g = W * S, H * S, gy * S
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rng = np.random.default_rng(seed)

    # ── 하늘 바탕
    t = yy / g
    sky = np.stack([lerp_(6, 22, t), lerp_(8, 9, t), lerp_(20, 22, t)], -1)
    sky = np.where((yy < g)[..., None], sky, 0)

    # ── 달(구름 뒤)
    mx, my, mr = moon[0] * w, moon[1] * h, 0.058 * w
    dm = np.hypot(xx - mx, yy - my)
    disc = smooth((mr - dm) / 3)
    shade = 0.75 + 0.25 * smooth(1 - np.hypot(xx - mx + mr * .3, yy - my + mr * .3) / mr)
    moon_c = np.array([215, 38, 44], np.float32) * shade[..., None]
    halo = np.exp(-(dm / (mr * 3.2)) ** 2)[..., None] * np.array([150, 15, 22])
    sky = sky * (1 - disc[..., None]) + moon_c * disc[..., None] + halo

    # ── 구름: 소용돌이치는 덩어리, 아래쪽 가장자리가 붉게 빛남
    base = 420 * S // 2
    wx = (fbm(w, h, base, seed + 1, 3) - .5) * 140 * S
    wy = (fbm(w, h, base, seed + 2, 3) - .5) * 90 * S
    c = warp(fbm(w, h, 300 * S // 2, seed + 3, 5), wx, wy)
    c = blur(c, 2 * S)
    dens = smooth((c - 0.4) * 2.3)
    dens *= 1 - 0.85 * np.exp(-(dm / (mr * 1.8)) ** 2)  # 달 둘레는 걷히게
    dens *= smooth((g - yy) / (140 * S))  # 땅 가까이선 옅게
    lit = blur(np.clip(dens - warp(dens, 0, -22 * S), 0, 1), 3 * S)  # 아래 가장자리
    # 붉은 영역(위 가운데~오른쪽) / 푸른 영역(왼쪽)
    red_m = np.exp(-(((xx - .7 * w) / (.5 * w)) ** 2 + ((yy - .22 * g) / (.42 * g)) ** 2))
    red_m = np.clip(red_m * 1.4 + (fbm(w, h, 90 * S, seed + 5, 3) - .5) * .5, 0, 1)
    col_r = np.array([150, 14, 20], np.float32)
    col_b = np.array([42, 56, 98], np.float32)
    ccol = col_b * (1 - red_m[..., None]) + col_r * red_m[..., None]
    cb = (0.25 + 0.75 * c)[..., None]
    sky = sky * (1 - dens[..., None] * .92) + ccol * cb * dens[..., None] + lit[..., None] * np.array([255, 80, 70]) * (0.25 + red_m[..., None]) * 1.1
    # 짙은 먹구름 한 겹(앞)
    d2 = smooth((warp(fbm(w, h, 120 * S, seed + 8, 5), wy, wx) - .55) * 3.2) * smooth((g * .9 - yy) / (300 * S))
    sky = sky * (1 - d2[..., None] * .75)

    img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8))

    # ── 번개(빛 번짐 + 심)
    bl = Image.new("L", (w, h), 0)
    bd = ImageDraw.Draw(bl)
    x, y = bolt * w, .1 * g
    pts = [(x, y)]
    while y < g - 330 * S:
        x += rng.uniform(-26, 26) * S
        y += rng.uniform(18, 46) * S
        pts.append((x, y))
    bd.line(pts, fill=255, width=3 * S, joint="curve")
    for i in range(3, len(pts) - 3, 4):
        fx, fy = pts[i]
        q = [(fx, fy)]
        for _ in range(rng.integers(3, 6)):
            fx += rng.uniform(8, 30) * S * rng.choice([-1, 1])
            fy += rng.uniform(14, 34) * S
            q.append((fx, fy))
        bd.line(q, fill=150, width=S, joint="curve")
    bla = np.asarray(bl).astype(np.float32) / 255
    glow = blur(bla, 14 * S) * 2.5 + blur(bla, 40 * S) * 1.6
    a = np.asarray(img).astype(np.float32)
    a += glow[..., None] * np.array([255, 30, 40]) + bla[..., None] * np.array([255, 225, 228])
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

    # ── 건물(따로 그려서 반사에도 쓴다)
    bld, light = building(w, h, g, seed)
    img.paste(bld, (0, 0), bld)

    # ── 젖은 바닥 + 반사
    a = np.asarray(img).astype(np.float32)
    floor = np.zeros_like(a)
    ft = np.clip((yy - g) / (h - g + 1), 0, 1)
    floor[:] = np.stack([lerp_(16, 4, ft), lerp_(17, 4, ft), lerp_(22, 6, ft)], -1)
    asph = fbm(w, h, 6 * S, seed + 30, 3)
    floor *= (0.75 + 0.5 * asph)[..., None]
    # 반사: 땅선 기준 뒤집기 + 물결 흔들림 + 흐림
    src = a.copy()
    ry = np.clip((2 * g - yy).astype(np.int32), 0, h - 1)
    ripple = (fbm(w, h, 3 * S, seed + 31, 2) - .5) * 30 * S * (0.4 + ft)
    rx = np.clip((xx + ripple).astype(np.int32), 0, w - 1)
    refl = src[ry, rx]
    refl = blur(refl / 255, 3 * S) * 255
    fade = (0.55 * np.exp(-ft * 2.2))[..., None]
    floor = floor + refl * fade
    # 불빛이 바닥에 길게 번지는 세로 줄
    lg = np.asarray(light).astype(np.float32) / 255
    streak = lg[ry, rx]
    streak = blur(streak, 2 * S)
    floor += streak[..., None] * np.array([230, 30, 36]) * .55 * np.exp(-ft * 1.4)[..., None]
    a = np.where((yy >= g)[..., None], floor, a)

    # ── 불빛 번짐(bloom)
    a += blur(lg, 18 * S)[..., None] * np.array([255, 30, 38]) * .6
    a += blur(lg, 60 * S)[..., None] * np.array([200, 20, 28]) * .45

    # ── 안개: 땅선에 낮게 + 앞쪽 몇 줄기
    fog = fbm(w, h, 70 * S, seed + 40, 5)
    fog = warp(fog, (fbm(w, h, 200 * S, seed + 41, 2) - .5) * 300 * S, 0)
    band = np.exp(-((yy - (g + 10 * S)) / (110 * S)) ** 2) * .85 + np.exp(-((yy - (g + 260 * S)) / (180 * S)) ** 2) * .35
    fa = np.clip(smooth((fog - .35) * 2.2) * band, 0, 1)[..., None]
    a = a * (1 - fa * .6) + np.array([120, 118, 132]) * fa * .6

    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

    # ── 앙상한 나무(가장자리)
    tr = Image.new("L", (w, h), 0)
    td = ImageDraw.Draw(tr)
    def br(x, y, ang, ln, wd, dep):
        if dep == 0 or ln < 4 * S:
            return
        x2, y2 = x + math.cos(ang) * ln, y + math.sin(ang) * ln
        mid = ((x + x2) / 2 + rng.normal(0, ln * .08), (y + y2) / 2 + rng.normal(0, ln * .08))
        td.line([(x, y), mid, (x2, y2)], fill=255, width=max(1, int(wd)), joint="curve")
        for _ in range(2 if dep > 3 else int(rng.integers(2, 4))):
            br(x2, y2, ang + rng.uniform(-.8, .8), ln * rng.uniform(.6, .8), wd * .64, dep - 1)
    br(-20 * S, g * .78, -1.05, 230 * S, 26 * S, 9)
    br(w + 20 * S, g * .7, -2.15, 250 * S, 28 * S, 9)
    br(-30 * S, -10 * S, .45, 190 * S, 18 * S, 8)
    br(w + 30 * S, -10 * S, 2.7, 200 * S, 18 * S, 8)
    tarr = np.asarray(tr.filter(ImageFilter.GaussianBlur(S * .6))).astype(np.float32)[..., None] / 255
    a = np.asarray(img).astype(np.float32)
    a = a * (1 - tarr) + np.array([3, 2, 5]) * tarr

    # ── 비네트 + 입자
    v = np.clip(1 - (((xx - w / 2) / (w * .78)) ** 2 + ((yy - h * .45) / (h * .7)) ** 2), 0, 1) ** .55
    a *= (0.35 + 0.65 * v)[..., None]
    a += rng.normal(0, 7, (h, w, 1))
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    return out


def lerp_(a, b, t):
    return a + (b - a) * t


def building(w, h, g, seed):
    """RGBA 건물 + L 불빛 마스크. 왼쪽: 유리 정면 별관(3층), 오른쪽: 낮고 넓은 둥근 본관."""
    rng = np.random.default_rng(seed + 50)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    U = w / 1080  # 가로 기준 배율

    col = np.zeros((h, w, 3), np.float32)
    alpha = np.zeros((h, w), np.float32)
    light = np.zeros((h, w), np.float32)
    tex = fbm(w, h, 10 * S, seed + 51, 4)
    stains = noise(w, h, 3 * S, seed + 52)
    stains = blur(np.repeat(stains[::1, :], 1, 0), 1)
    streak_v = np.asarray(Image.fromarray((noise(w, 8, 2, seed + 53) * 255).astype(np.uint8)).resize((w, h))).astype(np.float32) / 255

    def concrete(mask, base, lit_l, lit_r, x0, x1):
        """mask 영역에 콘크리트: 가로로 왼→오 밝기 변화 + 얼룩 + 위에서 흘러내린 물때 + 아래로 어두워짐"""
        tx = np.clip((xx - x0) / max(1, x1 - x0), 0, 1)
        b = lit_l + (lit_r - lit_l) * tx
        down = 1 - 0.35 * np.clip((yy - (g - 420 * U)) / (420 * U), 0, 1)
        c = np.array(base, np.float32) * (b * down * (0.82 + 0.3 * tex) * (0.9 + 0.12 * streak_v))[..., None]
        # 붉은 하늘이 위쪽 면을 살짝 물들임
        c += np.array([40, 4, 6]) * np.clip(1 - (g - yy) / (500 * U), 0, 1)[..., None] * 0
        m = mask[..., None]
        nonlocal col, alpha
        col = col * (1 - m) + c * m
        alpha = np.maximum(alpha, mask)

    def rect(x0, y0, x1, y1):
        return ((xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)).astype(np.float32)

    # ---------- 오른쪽 둥근 본관 ----------
    hx0, hx1 = 360 * U, 1110 * U
    hc, hw = (hx0 + hx1) / 2, (hx1 - hx0) / 2
    top0 = g - 300 * U
    u = np.clip((xx - hc) / hw, -1, 1)
    top = top0 + (u ** 2) * 34 * U  # 둥근 지붕선(가장자리로 갈수록 내려감)
    hall = ((xx >= hx0) & (xx < hx1) & (yy >= top) & (yy < g)).astype(np.float32)
    cyl = np.sqrt(np.clip(1 - u ** 2, 0, 1))  # 원통 음영
    lit = 0.35 + 0.65 * np.clip(cyl * (0.75 - 0.35 * u), 0, 1)
    c = np.array([64, 66, 78], np.float32) * (lit * (0.8 + 0.3 * tex) * (0.9 + 0.15 * streak_v))[..., None]
    c *= (1 - 0.4 * np.clip((yy - top) / (300 * U), 0, 1))[..., None]
    col = col * (1 - hall[..., None]) + c * hall[..., None]
    alpha = np.maximum(alpha, hall)
    # 지붕 처마(밝은 띠) + 붉은 하늘빛 테두리
    eave = ((yy >= top - 6 * U) & (yy < top + 10 * U) & (xx >= hx0 - 6 * U) & (xx < hx1)).astype(np.float32)
    col = col * (1 - eave[..., None]) + (np.array([120, 118, 126]) * (0.5 + 0.5 * cyl))[..., None].squeeze(-1) * eave[..., None] if False else col
    rim = ((yy >= top - 6 * U) & (yy < top) & (xx >= hx0) & (xx < hx1)).astype(np.float32)
    col = col * (1 - rim[..., None]) + np.array([190, 70, 70]) * (0.5 + 0.5 * cyl)[..., None] * rim[..., None]
    alpha = np.maximum(alpha, rim)
    # 처마 아래 그림자 띠
    sh = ((yy >= top) & (yy < top + 22 * U)).astype(np.float32) * hall
    col *= (1 - 0.45 * sh)[..., None]

    # 본관 창: 원통을 따라 간격이 좁아짐
    win_l = np.zeros((h, w), np.float32)
    win_d = np.zeros((h, w), np.float32)
    n = 15
    for i in range(n):
        th = -1.35 + 2.7 * (i + .5) / n
        cx = hc + hw * math.sin(th)
        ww = 30 * U * math.cos(th) + 2 * U
        if abs(cx - (hc - 40 * U)) < 120 * U:  # 입구 자리 비움
            continue
        topx = top0 + (math.sin(th) ** 2) * 34 * U
        # 아래 큰 창(붉게)
        y0, y1 = g - 120 * U, g - 18 * U
        m = rect(cx - ww / 2, y0, cx + ww / 2, y1)
        k = rng.uniform(.2, .8)
        win_l += m * k
        # 위 작은 창(어둡게, 몇 개만 불)
        y0, y1 = topx + 70 * U, topx + 110 * U
        m2 = rect(cx - ww * .35, y0, cx + ww * .35, y1)
        if rng.random() < .18:
            win_l += m2 * .7
        else:
            win_d += m2

    # 입구: 아치형 캐노피 + 붉은 유리문
    ex = hc - 40 * U
    canopy_y = g - 150 * U
    can = ((np.abs(xx - ex) < 120 * U) & (yy > canopy_y - 26 * U * np.sqrt(np.clip(1 - ((xx - ex) / (120 * U)) ** 2, 0, 1))) & (yy < canopy_y + 14 * U)).astype(np.float32)
    door = rect(ex - 92 * U, canopy_y + 14 * U, ex + 92 * U, g)
    dgrad = np.clip((yy - canopy_y) / (150 * U), 0, 1)
    win_l += door * (0.45 + 0.35 * dgrad) * (0.85 + 0.3 * fbm(w, h, 20 * S, seed + 61, 2))
    win_l *= 1 - rect(ex - 92 * U, canopy_y + 70 * U, ex + 92 * U, canopy_y + 75 * U)
    # 기둥(문 사이)
    for k in range(-2, 3):
        win_l *= 1 - rect(ex + k * 44 * U - 3 * U, canopy_y + 14 * U, ex + k * 44 * U + 3 * U, g)

    # ---------- 왼쪽 별관(유리 정면) ----------
    ax0, ax1, atop = 40 * U, 400 * U, g - 470 * U
    concrete(rect(ax0, atop, ax1, g), (60, 62, 72), 0.62, 0.95, ax0, ax1)
    # 옥상 기계실·난간
    concrete(rect(ax0 + 40 * U, atop - 40 * U, ax0 + 120 * U, atop), (52, 54, 62), .6, .8, ax0, ax1)
    concrete(rect(ax1 - 110 * U, atop - 26 * U, ax1 - 50 * U, atop), (52, 54, 62), .6, .8, ax0, ax1)
    rim2 = rect(ax0, atop - 4 * U, ax1, atop)
    col = col * (1 - rim2[..., None]) + np.array([200, 80, 80]) * rim2[..., None]
    alpha = np.maximum(alpha, rim2)
    # 더 왼쪽 낮은 건물
    concrete(rect(-10 * U, g - 330 * U, ax0 + 2 * U, g), (44, 46, 54), .45, .6, -10 * U, ax0)
    # 유리 정면(3층 높이)
    gx0, gx1, gt = 95 * U, 300 * U, g - 400 * U
    glass = rect(gx0, gt, gx1, g)
    gt_ = np.clip((yy - gt) / (400 * U), 0, 1)
    interior = (0.35 + 0.65 * gt_) * (0.75 + 0.5 * fbm(w, h, 30 * S, seed + 60, 3))
    for ci in range(6):
        for ri in range(8):
            x0 = gx0 + (gx1 - gx0) * ci / 6
            y0 = gt + 400 * U * ri / 8
            pane = rect(x0, y0, x0 + (gx1 - gx0) / 6, y0 + 50 * U)
            win_l += pane * interior * rng.uniform(.35, 1.0) * (0.45 + 0.55 * ri / 7)
    # 멀리언(세로·가로 틀)
    for k in range(0, 7):
        x = gx0 + (gx1 - gx0) * k / 6
        win_l *= 1 - rect(x - 2.5 * U, gt, x + 2.5 * U, g)
    for k in range(0, 9):
        y = gt + 400 * U * k / 8
        win_l *= 1 - rect(gx0, y - 2 * U, gx1, y + 2 * U)
    # 유리 안 사람 그림자(2층)
    px, py = gx0 + (gx1 - gx0) * .52, gt + 175 * U
    person = ((np.hypot(xx - px, yy - py) < 9 * U) | ((np.abs(xx - px) < 13 * U * np.clip((yy - py) / (60 * U), 0, 1) + 4 * U) & (yy > py + 6 * U) & (yy < py + 70 * U))).astype(np.float32)
    win_l *= 1 - person * .85
    # 별관 오른쪽 작은 창들
    for r in range(5):
        for cc in range(3):
            x0 = 315 * U + cc * 26 * U
            y0 = atop + 40 * U + r * 80 * U
            m = rect(x0, y0, x0 + 14 * U, y0 + 34 * U)
            if rng.random() < .25:
                win_l += m * .8
            else:
                win_d += m

    win_l = np.clip(win_l, 0, 1)
    wl = win_l[..., None]
    # 붉은 불빛 색: 아래쪽일수록 밝고 노르스름하게
    hot = np.clip((yy - (g - 200 * U)) / (200 * U), 0, 1)[..., None]
    lc = np.array([115, 8, 14]) * (1 - hot) + np.array([235, 40, 44]) * hot
    col = col * (1 - wl) + lc * wl * (0.6 + 0.6 * win_l[..., None])
    col = col * (1 - win_d[..., None] * .8) + np.array([10, 10, 14]) * win_d[..., None] * .8
    cm = can[..., None]
    col = col * (1 - cm) + np.array([40, 40, 46]) * cm
    alpha = np.maximum(alpha, can)
    light = np.clip(win_l, 0, 1) * alpha

    rgba = np.dstack([np.clip(col, 0, 255), np.clip(alpha * 255, 0, 255)]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA"), Image.fromarray((light * 255).astype(np.uint8))


if __name__ == "__main__":
    paint(1080, 1920, 1180, 7, (0.82, 0.075), 0.74).save(os.path.join(OUT, "klass-bg-story.jpg"), quality=92)
    paint(1080, 1350, 900, 9, (0.84, 0.09), 0.76).save(os.path.join(OUT, "klass-bg-feed.jpg"), quality=92)
    print("ok")
