"""성지기숙학원 릴스 배경: 공식 포스터의 분위기(어두운 갈색 바탕, 문틈으로 들여다보는 한쪽 눈, 붉은 홍채, 먼지·긁힘)를 보고 새로 그린 그림.
포스터 자체는 쓰지 않는다. 사용: python3 tools/ig/drawings/sungji_eye.py tools/ig/assets/reel-sungji.jpg"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H = 1080, 1920
rng = np.random.default_rng(37)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def sm(scale, seed, w=W, h=H):
    r = np.random.default_rng(seed)
    a = r.random((max(2, h // scale), max(2, w // scale))).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255

# 바탕: 어두운 고동색
img = np.zeros((H, W, 3), np.float32) + np.array([30, 21, 18])
img *= (0.75 + 0.5 * sm(220, 1))[..., None]

# 문틈: 세로로 길게 열린 빛. 왼쪽 가장자리는 흐리고 오른쪽은 문짝 그림자
cx, gw = 560, 250
edge = np.clip((gw / 2 - np.abs(xx - cx + 18 * np.sin(yy / 380))) / 34, 0, 1)
light = edge * np.clip(1 - np.abs(yy - 820) / 900, 0, 1) ** 0.8
skin = np.array([196, 188, 158]) * (0.78 + 0.32 * sm(5, 2)[..., None]) * (0.85 + 0.25 * sm(60, 3)[..., None])
img = img * (1 - light[..., None]) + skin * light[..., None] * np.clip(1 - np.abs(xx - cx) / 300, 0.35, 1)[..., None]

pil = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
ex, ey, ew, eh = 590, 760, 230, 88                       # 눈 위치·크기
def almond(cx, cy, w, h, n=80, up=1.0, lo=0.75):
    pts = []
    for i in range(n + 1):
        t = math.pi * i / n; pts.append((cx - w * math.cos(t), cy - h * up * math.sin(t) ** 0.9))
    for i in range(n + 1):
        t = math.pi * i / n; pts.append((cx + w * math.cos(t), cy + h * lo * math.sin(t) ** 1.1))
    return pts
# 눈두덩 그늘·쌍꺼풀·눈썹
d.polygon(almond(ex, ey - 8, ew * 1.25, eh * 1.9, up=1.0, lo=0.2), fill=(70, 52, 40, 90))
d.line([(ex - ew * 1.05 + i * ew * 2.1 / 40, ey - eh * 1.25 - 26 * math.sin(math.pi * i / 40)) for i in range(41)], fill=(90, 66, 50, 170), width=6)
for i in range(260):                                    # 눈썹: 짧은 털
    t = rng.random(); bx = ex - ew * 1.15 + t * ew * 2.3; by = ey - eh * 2.45 - 40 * math.sin(math.pi * t) + rng.normal(0, 9)
    a = -0.35 + 0.7 * t + rng.normal(0, .15); L = rng.uniform(20, 46)
    d.line([(bx, by), (bx + L * math.cos(a), by - L * math.sin(a) * 0.4)], fill=(28, 20, 16, 200), width=3)
# 눈 흰자(누렇고 핏줄)
d.polygon(almond(ex, ey, ew, eh), fill=(176, 160, 138, 255))
lay = lay.filter(ImageFilter.GaussianBlur(1.2)); d = ImageDraw.Draw(lay)
for _ in range(26):                                     # 핏줄
    sx = ex + rng.choice([-1, 1]) * rng.uniform(ew * .55, ew * .95); sy = ey + rng.normal(0, eh * .25)
    pts = [(sx, sy)]
    for k in range(5):
        pts.append((pts[-1][0] + (ex - sx) * rng.uniform(.06, .12), pts[-1][1] + rng.normal(0, 6)))
    d.line(pts, fill=(170, 40, 34, 140), width=2)
# 홍채: 붉은 갈색, 방사 무늬, 바깥 테두리 진하게
ir = 58; icx, icy = ex - 34, ey + 8
for r in range(ir, 0, -1):
    k = r / ir; col = (int(120 + 70 * (1 - k)), int(18 + 12 * (1 - k)), int(18 + 8 * (1 - k)), 255)
    d.ellipse([icx - r, icy - r, icx + r, icy + r], fill=col)
for i in range(140):
    a = rng.uniform(0, 2 * math.pi); r0 = rng.uniform(16, 30); r1 = rng.uniform(48, ir - 4)
    c = (int(rng.uniform(60, 200)), int(rng.uniform(10, 40)), 20, int(rng.uniform(70, 150)))
    d.line([(icx + r0 * math.cos(a), icy + r0 * math.sin(a)), (icx + r1 * math.cos(a), icy + r1 * math.sin(a))], fill=c, width=2)
d.ellipse([icx - ir, icy - ir, icx + ir, icy + ir], outline=(60, 10, 10, 160), width=4)
d.ellipse([icx - 26, icy - 26, icx + 26, icy + 26], fill=(14, 6, 6, 255))      # 동공
d.ellipse([icx + 14, icy - 40, icx + 34, icy - 22], fill=(255, 250, 240, 230))  # 반짝임
d.ellipse([icx - 30, icy + 14, icx - 20, icy + 24], fill=(255, 230, 220, 120))
# 위 눈꺼풀이 홍채 윗부분을 덮는다(흰자 밖은 지움)
mask = Image.new("L", (W, H), 0); ImageDraw.Draw(mask).polygon(almond(ex, ey, ew, eh), fill=255)
eye_only = Image.composite(lay.filter(ImageFilter.GaussianBlur(1.6)), Image.new("RGBA", (W, H), (0, 0, 0, 0)), mask.filter(ImageFilter.GaussianBlur(2)))
lay2 = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d2 = ImageDraw.Draw(lay2)
d2.polygon(almond(ex, ey - 2, ew * 1.25, eh * 1.9, up=1.0, lo=0.2), fill=(70, 52, 40, 90))
d2.line([(ex - ew * 1.05 + i * ew * 2.1 / 40, ey - eh * 1.25 - 26 * math.sin(math.pi * i / 40)) for i in range(41)], fill=(90, 66, 50, 170), width=6)
for i in range(260):
    t = rng.random(); bx = ex - ew * 1.15 + t * ew * 2.3; by = ey - eh * 2.45 - 40 * math.sin(math.pi * t) + rng.normal(0, 9)
    a = -0.35 + 0.7 * t + rng.normal(0, .15); L = rng.uniform(20, 46)
    d2.line([(bx, by), (bx + L * math.cos(a), by - L * math.sin(a) * 0.4)], fill=(28, 20, 16, 200), width=3)
d2.ellipse([ex - ew * 1.2, ey + eh * .6, ex + ew * 1.2, ey + eh * 2.0], fill=(60, 50, 40, 70))   # 눈밑 그늘
pil = Image.alpha_composite(pil.convert("RGBA"), lay2.filter(ImageFilter.GaussianBlur(4)))
pil = Image.alpha_composite(pil, eye_only)
d3 = ImageDraw.Draw(pil)
# 위 눈꺼풀 선 + 속눈썹(아래로 처진)
top = [(ex - ew + i * 2 * ew / 60, ey - eh * math.sin(math.pi * i / 60) ** 0.9) for i in range(61)]
d3.line(top, fill=(26, 18, 14, 200), width=6)
for i in range(4, 58, 1):
    x, y = top[i]; t = i / 60; a = math.pi / 2 + (t - .5) * 1.6
    L = rng.uniform(18, 34) * (0.6 + 0.6 * math.sin(math.pi * t))
    d3.line([(x, y), (x - L * math.cos(a) * 0.9, y - L * math.sin(a) * 0.55)], fill=(18, 12, 10, 230), width=2)
bot = [(ex - ew + i * 2 * ew / 60, ey + eh * 0.75 * math.sin(math.pi * i / 60) ** 1.1) for i in range(61)]
d3.line(bot, fill=(120, 70, 60, 200), width=4)
pil = pil.convert("RGB")
a = np.asarray(pil).astype(np.float32)
ecorner = np.clip(1 - ((xx - ex) / (ew * 1.05)) ** 2 - ((yy - ey) / (eh * 1.6)) ** 2, 0, 1)
a *= (0.55 + 0.45 * ecorner ** 0.5)[..., None] * 1 + 0 * a
# 먼지·긁힘·필름 결
sc = Image.new("L", (W, H), 0); sd = ImageDraw.Draw(sc)
for _ in range(900):
    x, y = rng.random() * W, rng.random() * H; r = rng.random() ** 3 * 3 + .5
    sd.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(60, 200)))
for _ in range(40):
    x, y = rng.random() * W, rng.random() * H; L = rng.uniform(20, 140); ang = rng.uniform(-1.2, 1.2) + math.pi / 2
    sd.line([(x, y), (x + L * math.cos(ang), y + L * math.sin(ang))], fill=int(rng.uniform(40, 120)), width=1)
dust = np.asarray(sc).astype(np.float32)[..., None] / 255
a = a * (1 - dust * 0.6) + np.array([20, 14, 12]) * dust * 0.6
vig = np.clip(1 - (((xx - W / 2) / (W * .62)) ** 2 + ((yy - 820) / (H * .62)) ** 2), 0, 1) ** 0.7
a *= (0.25 + 0.75 * vig)[..., None]
a = a * np.array([1.0, 0.96, 0.86])                       # 누렇게
a += rng.normal(0, 7, (H, W, 1))
gap = np.clip((gw / 2 + 6 - np.abs(xx - cx + 18 * np.sin(yy / 380))) / 30, 0, 1)   # 문틈 밖은 문짝 그림자로 덮는다
a = a * (0.02 + 0.98 * gap ** 1.5)[..., None]
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1)).save(sys.argv[1], quality=92)
