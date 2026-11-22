"""셔플월드 팬 포스터 배경(1080x1350): 네모 블록(복셀) 세계. 공식 포스터를 베끼지 않은 새 장면.
떠 있는 풀 섬 위의 용사와 보라색 포털, 멀리 눈 섬·사막 섬. 질감은 8x8 픽셀을 직접 만든 것."""
import sys, math
import numpy as np
from PIL import Image, ImageDraw
W, H = 1080, 1350
rng = np.random.default_rng(11)
def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
def tex(base, var=14, n=8, spots=(), seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    a = np.zeros((n, n, 4), float); a[..., :3] = hexc(base) + r.integers(-var, var + 1, (n, n, 1)); a[..., 3] = 255
    for col, k in spots:
        for _ in range(k): a[r.integers(0, n), r.integers(0, n), :3] = hexc(col)
    return a
def top_strip(side, topc, rows=2, var=10):
    a = side.copy(); n = a.shape[0]
    for j in range(rows + 1):
        for i in range(n):
            if j < rows or rng.random() < .4: a[j, i, :3] = hexc(topc) + rng.integers(-var, var + 1)
    return a
def img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
dirt = tex('#8a5a3a', 12, spots=(('#6e452b', 8), ('#a06c47', 5)))
T = {}
T['grass'] = (tex('#6cc24a', 14, spots=(('#58a83c', 8), ('#86d95e', 6))), top_strip(dirt, '#5fb142'))
T['dirt'] = (dirt, dirt)
T['stone'] = (tex('#8d8f98', 10, spots=(('#74767f', 10), ('#a3a5ad', 6))),) * 2
T['snow'] = (tex('#f4f9ff', 5, spots=(('#dcebff', 8),)), top_strip(dirt, '#f4f9ff', 3, 4))
T['sand'] = (tex('#ead28a', 8, spots=(('#d8bd70', 9), ('#f5e2a6', 6))),) * 2
T['sandstone'] = (tex('#d9bb6c', 6, spots=(('#c4a455', 10),)),) * 2
lg = tex('#6b4a2c', 6); lg[:, ::3, :3] -= 22
T['log'] = (tex('#b08a52', 8, spots=(('#8c6a3a', 8),)), lg)
T['leaf'] = (tex('#3f9a3f', 16, spots=(('#2c7430', 14), ('#5fbf55', 8))),) * 2
T['pine'] = (tex('#2f7a70', 14, spots=(('#215a55', 14), ('#e9f4ff', 10))),) * 2
T['plank'] = (tex('#c79a5a', 6, spots=(('#a97f45', 8),)),) * 2
T['roof'] = (tex('#b0413a', 8, spots=(('#8f302c', 10),)),) * 2
T['obs'] = (tex('#2a1840', 8, spots=(('#150a28', 16), ('#4a2a70', 6))),) * 2
pt = tex('#9a4cf0', 26, spots=(('#d9b3ff', 12), ('#5a1fb0', 12), ('#7fe7ff', 3))); pt[..., 3] = 225
T['portal'] = (pt, pt)
T['cactus'] = (tex('#3f9a4c', 8, spots=(('#2c7438', 10),)),) * 2
T['cloud'] = (tex('#ffffff', 2), tex('#e6f0ff', 3))
T['slime_g'] = (tex('#7be08a', 6, spots=(('#a8f0b0', 6),)),) * 2
T['slime_p'] = (tex('#ff8fc0', 6, spots=(('#ffc0dc', 6),)),) * 2
for k, c in dict(skin='#f2c39a', hair='#f2c14e', tunic='#3b6fd6', cape='#d43a44', boot='#5a3a22', steel='#eef4ff', gold='#f2c14e', belt='#2a2a44').items():
    T[k] = (tex(c, 5),) * 2
def shade(a, f): b = a.copy(); b[..., :3] *= f; return img(b)
canvas = Image.new('RGBA', (W, H))
# 하늘
sky = np.zeros((H, W, 3), float)
c0, c1, c2 = hexc('#4f9bf0'), hexc('#9fd0ff'), hexc('#e9f6ff')
for y in range(H):
    t = y / H; band = math.floor(t * 18) / 18
    sky[y] = c0 + (c1 - c0) * min(1, band * 1.6) if band < .62 else c1 + (c2 - c1) * (band - .62) / .38
canvas.paste(Image.fromarray(sky.astype(np.uint8)).convert('RGBA'))
d = ImageDraw.Draw(canvas)
d.rectangle((806, 96, 946, 236), fill='#fff3b0'); d.rectangle((826, 116, 926, 216), fill='#fffbe0')   # 네모난 해
def face(dst, t, p0, pu, pv):
    """질감 t(n x n)를 p0 기준, pu·pv 로 가는 평행사변형에 붙인다."""
    n = t.size[0]; ux, uy = pu[0] - p0[0], pu[1] - p0[1]; vx, vy = pv[0] - p0[0], pv[1] - p0[1]
    xs = [p0[0], pu[0], pv[0], pu[0] + vx]; ys = [p0[1], pu[1], pv[1], pu[1] + vy]
    x0, y0, x1, y1 = math.floor(min(xs)), math.floor(min(ys)), math.ceil(max(xs)), math.ceil(max(ys))
    det = ux * vy - vx * uy
    a, b = vy / det * n, -vx / det * n; e, f = -uy / det * n, ux / det * n
    ox, oy = p0[0] - x0, p0[1] - y0
    coef = (a, b, -(a * ox + b * oy), e, f, -(e * ox + f * oy))
    big = Image.new('RGBA', (n + 2, n + 2)); big.paste(t, (0, 0))
    out = t.transform((x1 - x0, y1 - y0), Image.AFFINE, coef, Image.NEAREST)
    m = Image.new('L', (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(m).polygon([(p0[0] - x0, p0[1] - y0), (pu[0] - x0, pu[1] - y0), (pu[0] + vx - x0, pu[1] + vy - y0), (pv[0] - x0, pv[1] - y0)], fill=255)
    al = out.split()[3]; from PIL import ImageChops
    dst.paste(out, (x0, y0), ImageChops.multiply(m, al))
def draw(vox, ox, oy, hw, hh, ch):
    keys = set(vox)
    for (x, y, z) in sorted(vox, key=lambda k: (k[0] + k[1], k[2])):
        b = vox[(x, y, z)]; tt, ts = T[b]
        sx = ox + (x - y) * hw; sy = oy + (x + y) * hh - z * ch
        Tp, R, B, L = (sx, sy), (sx + hw, sy + hh), (sx, sy + 2 * hh), (sx - hw, sy + hh)
        if (x, y + 1, z) not in keys: face(canvas, shade(ts, .80), L, B, (L[0], L[1] + ch))
        if (x + 1, y, z) not in keys: face(canvas, shade(ts, 1.0 if b == 'portal' else .60), B, R, (B[0], B[1] + ch))
        if (x, y, z + 1) not in keys: face(canvas, shade(tt, 1.0), Tp, R, L)
def island(n, top, depth=4, under='dirt', rock='stone'):
    v = {}; c = (n - 1) / 2
    for x in range(n):
        for y in range(n):
            r = math.hypot(x - c, y - c)
            if r > c + .35: continue
            v[(x, y, 0)] = top
            dd = int(round((depth + 1) * (1 - (r / (c + .6)) ** 1.5) + rng.random() * .9))
            for z in range(1, dd + 1): v[(x, y, -z)] = under if z < 2 else rock
    return v
def tree(v, x, y, h=3, leaf='leaf'):
    for z in range(1, h + 1): v[(x, y, z)] = 'log'
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for dz in (0, 1):
                if abs(dx) + abs(dy) == 2 and dz == 1 and rng.random() < .7: continue
                v[(x + dx, y + dy, h + 1 + dz)] = leaf
    v[(x, y, h + 3)] = leaf
# 구름(납작한 블록)
for (ox, oy, shape) in ((120, 760, [(0, 0), (1, 0), (2, 0), (1, 1), (2, 1), (3, 1)]), (960, 700, [(0, 0), (1, 0), (1, 1), (2, 1)]), (600, 330, [(0, 0), (1, 0), (2, 0), (2, 1)]), (330, 1180, [(0, 0), (1, 0), (1, 1)])):
    draw({(x, y, 0): 'cloud' for x, y in shape}, ox, oy, 34, 17, 14)
# 먼 섬: 눈
v = island(7, 'snow', 3); tree(v, 2, 2, 2, 'pine'); tree(v, 4, 3, 3, 'pine'); draw(v, 930, 330, 22, 11, 25)
# 먼 섬: 사막
v = island(7, 'sand', 3, 'sandstone', 'sandstone')
for z in range(1, 4):
    for x in range(1 + z - 1, 5 - z + 1):
        for y in range(1 + z - 1, 5 - z + 1): v[(x, y, z)] = 'sandstone'
v[(5, 5, 1)] = v[(5, 5, 2)] = 'cactus'; draw(v, 176, 470, 22, 11, 25)
# 주인공 섬
v = island(9, 'grass', 5)
for y in range(2, 6):
    for z in range(1, 6):
        edge = y in (2, 5) or z in (1, 5)
        v[(1, y, z)] = 'obs' if edge else 'portal'
tree(v, 7, 2, 3)
for (x, y) in ((1, 5), (7, 6), (3, 7)): v[(x, y, 0)] = 'grass'
OX, OY, HW, HH, CH = 560, 560, 46, 23, 52
draw(v, OX, OY, HW, HH, CH)
# 포털 빛
glow = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(glow)
gx, gy = OX + (1.5 - 3.5) * HW, OY + (1.5 + 3.5) * HH - 3 * CH
for r, a in ((210, 22), (150, 30), (95, 40)): gd.ellipse((gx - r, gy - r, gx + r, gy + r), fill=(190, 120, 255, a))
canvas.alpha_composite(glow)
def at(x, y, z): return OX + (x - y) * HW, OY + (x + y) * HH - z * CH
# 용사(작은 블록으로 조립, 포털을 바라봄)
h = {}
for x in (0, 1):
    for z in (0, 1): h[(x, 0, z)] = 'boot' if z == 0 else 'tunic'
    h[(x, 0, 2)] = 'belt'
    for z in (3, 4): h[(x, 0, z)] = 'tunic'
    for z in (2, 3, 4): h[(x, 1, z)] = 'cape'
    h[(x, 1, 1)] = 'cape'
for z in (3, 4): h[(-1, 0, z)] = 'tunic'
h[(-1, 0, 2)] = 'skin'
h[(2, 0, 4)] = 'tunic'; h[(2, 0, 5)] = 'tunic'; h[(2, 0, 6)] = 'skin'
for z in (7,): h[(2, 0, z)] = 'gold'
for z in range(8, 13): h[(2, 0, z)] = 'steel'
h[(1, 0, 7)] = 'gold'; h[(3, 0, 7)] = 'gold'
for x in (0, 1):
    for y in (0, 1):
        h[(x, y, 5)] = 'skin'; h[(x, y, 6)] = 'hair'
    h[(x, 1, 5)] = 'hair'
hx, hy = at(4.4, 4.6, 1)
draw(h, hx, hy + 23, 21, 10.5, 24)
# 슬라임 둘
for (x, y, k) in ((2.6, 6.6, 'slime_g'), (6.6, 5.4, 'slime_p')):
    sx, sy = at(x, y, 1); s = {(a, b, c): k for a in (0, 1) for b in (0, 1) for c in (0, 1)}
    draw(s, sx, sy + 23, 18, 9, 17)
    dd = ImageDraw.Draw(canvas)
    for ex in (-14, -3): dd.rectangle((sx + ex - 8, sy + 23 + 9, sx + ex - 2, sy + 23 + 17), fill='#1a1026')
canvas.convert('RGB').save(sys.argv[1])
