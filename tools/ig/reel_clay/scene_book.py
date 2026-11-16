"""릴스 '마지막 자물쇠' 그림책(수채+가는 먹선) 장면. python3 scene_book.py <out_dir> [name]"""
import os, sys, time
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from storybook import Storybook
from scene_cartoon import STATES

W, H = 1080, 1920
K = 1920 / W                                   # 내 좌표(px) → 스킬의 설계 좌표
FONT = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'public', 'fonts', 'nanum-myeongjo-korean-800-normal.woff2')


def rr(x0, y0, x1, y1, r=20, n=6):
    P = []
    for cx, cy, a0 in ((x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)):
        for a in np.linspace(a0, a0 + 90, n):
            P.append((cx + r * np.cos(np.deg2rad(a)), cy + r * np.sin(np.deg2rad(a))))
    return [(x * K, y * K) for x, y in P]


def pts(P):
    return [(x * K, y * K) for x, y in P]


def scene(digits, dy, opened, seed):
    sb = Storybook(W, H, seed=seed)
    sb.paper('#efe4cf')
    z = [10.0]

    def wash(P, col, **kw):
        z[0] += 1; sb.wash(P, col, z=z[0], smooth=False, **kw)

    def box(P, col, line=3.0, dark=None):
        z[0] += 1; sb.shape([P], col, line=line, z=z[0], when=(0, 0), dark=dark)

    def ink(P, w=3.0):
        z[0] += 1; sb.ink(pts(P), w, z=z[0])

    wash(rr(-30, -30, W + 30, 1460, 4), '#a98467', dashes=90, dash_angle=90.0)
    for x in range(216, W, 216):
        ink([(x, 0), (x + 3, 700), (x - 2, 1450)], 2.4)
    wash(rr(-30, 1445, W + 30, H + 30, 4), '#7a5a47')
    ink([(0, 1448), (W, 1452)], 3.2)
    box(rr(230, 270, 850, 560, 36), '#5b6470', dark='#444b55')
    box(rr(268, 306, 812, 524, 20), '#1b1d22', line=2.2)
    ink([(140, 600), (138, 700)], 2.4)
    th = np.linspace(0, 2 * np.pi, 28)[:-1]
    box(pts([(140 + 34 * np.cos(t), 740 + 34 * np.sin(t)) for t in th]), '#e6c35a', dark='#c99a2e')
    box(pts([(140 + 12 * np.cos(t), 740 + 12 * np.sin(t)) for t in th]), '#a98467', line=2.0)
    box(rr(128, 772, 152, 880, 5), '#e6c35a'); box(rr(150, 836, 178, 852, 3), '#e6c35a'); box(rr(150, 862, 172, 878, 3), '#e6c35a')
    box(rr(820, 700, 1000, 930, 12), '#6b4a36', dark='#4f3526'); box(rr(846, 726, 974, 904, 6), '#f3ead2', line=2.0)
    ink([(872, 860), (900, 800), (930, 840), (952, 780)], 4)
    # 상자
    wash(rr(120, 1585, 980, 1650, 30), '#5d4335', opacity=0.6)
    box(rr(130, 1160, 950, 1600, 22), '#c98a52', line=3.6, dark='#a0673a')
    for y in (1300, 1440):
        ink([(150, y), (540, y + 5), (930, y + 2)], 2.6)
    box(rr(110, 1010, 970, 1190, 60), '#d2945a', line=3.6, dark='#a0673a')
    for x in (210, 800):
        box(rr(x, 1004, x + 70, 1606, 8), '#d9d4c7', dark='#b3ad9f')
        for y in (1050, 1230, 1400, 1560):
            box(pts([(x + 35 + 8 * np.cos(t), y + 8 * np.sin(t)) for t in th[::3]]), '#6d675c', line=1.5)
    box(rr(482, 1090, 598, 1260, 12), '#d9d4c7', dark='#b3ad9f')
    box(pts([(540 + 26 * np.cos(t), 1228 + 26 * np.sin(t)) for t in th]), '#9c968a', line=2.2)
    # 자물쇠
    sy = dy - (100 if opened else 0)
    rleg = 1250 if opened else 1440
    a = np.linspace(np.pi, 0, 24); cy = 1214 + sy
    sh = ([(396, 1440 + sy)] + [(540 + 144 * np.cos(t), cy - 144 * np.sin(t)) for t in a] + [(684, rleg + sy), (620, rleg + sy)]
          + [(540 + 80 * np.cos(t), cy - 80 * np.sin(t)) for t in a[::-1]] + [(460, 1440 + sy)])
    box(pts(sh), '#e7ebee', line=3.4, dark='#b9c1c8')
    by = dy + (26 if opened else 0)
    box(rr(310, 1280 + by, 770, 1590 + by, 46), '#f1b84a', line=4.0, dark='#d08d22')
    wash(rr(350, 1310 + by, 620, 1332 + by, 10), '#fbe3a4', opacity=0.8)
    for i in range(4):
        x0 = 352 + i * 97
        box(rr(x0, 1384 + by, x0 + 82, 1540 + by, 12), '#2f2823', line=2.4)
    img = sb.frame(1.0)
    img = img if isinstance(img, Image.Image) else Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    img = img.convert('RGB')
    rng = np.random.default_rng(seed)
    f = ImageFont.truetype(FONT, 112)
    for i, d in enumerate(digits):                       # 숫자: 손으로 쓴 듯 살짝씩 기울여 얹는다
        t = Image.new('RGBA', (120, 170), (0, 0, 0, 0))
        ImageDraw.Draw(t).text((60, 85), d, font=f, fill='#fbf3df', anchor='mm')
        t = t.rotate(float(rng.uniform(-5, 5)), resample=Image.BICUBIC)
        img.paste(t, (352 + i * 97 + 41 - 60 + int(rng.integers(-2, 3)), 1462 + by - 85), t)
    return img


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, d, dy, op in STATES:
        if only and name != only: continue
        for v in (1, 2):
            t = time.time()
            scene(d, dy, op, seed=v * 7 + 3).save(f'{out}/{name}_{v}.jpg', quality=80)
            print(name, v, round(time.time() - t, 1), flush=True)
