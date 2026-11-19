import sys
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib')
import numpy as np
from notebook import Notebook, INK, SOFT, LEAD, RED, MINT, MINTD
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]
nb = Notebook(1080, 1350, seed=31)
nb.desk(colour='#d8ccb6', light='#e8dfcd', dark='#bcae96')
nb.notebook(70, 60, 1010, 1110, tabs=(('#E49A4A', 230), (MINT, 350), ('#efe596', 470)))
nb.binding()
# form rules
ROWS = [420, 510, 600, 690, 780]
for y in ROWS:
    nb.rule(300, y, 930, y, 2.0, 0.5)
nb.highlight(300, 760, 588, 46, tilt=-2)
nb.pen_loop(470, 578, 176, 36, rot=-2)
nb.pen_underline(300, 640, 795, double=True)
nb.label_tape('2026.11.16', 190, 170, 24, rot=-1.5)
nb.sticker(860, 300, 190, 84, rot=7, colour=RED, radius=18,
           lines=[('ESCAPED', 95, 54, 28, 'sans_bold', '#ffffff')])
f = nb.sticky(735, 960, 440, 190, rot=-2.2, colour='#efe596')
nb.save(out)
im = Image.open(out).convert('RGB'); d = ImageDraw.Draw(im)
AG = '/home/user/escape-log-web/assets/fonts/SBAggroB.woff'
PR = '/home/user/escape-log-web/assets/fonts/Pretendard-Medium.woff'
PB = '/home/user/escape-log-web/assets/fonts/Pretendard-ExtraBold.woff'
BR = '/home/user/escape-log-web/assets/fonts/NanumBrushScript.woff'
F = lambda p, s: ImageFont.truetype(p, s)
INKC = (37, 48, 61); SOFTC = (91, 105, 122); PEN = (40, 52, 110)
d.text((190, 300), '방탈출 기록', font=F(AG, 70), fill=(29, 29, 29), anchor='ls')
d.text((598, 300), 'No.27', font=F(PB, 40), fill=(228, 154, 74), anchor='ls')
d.text((192, 345), '* 예시 기록', font=F(PR, 22), fill=SOFTC, anchor='ls')
labels = ['테마', '함께', '결과', '힌트', '별점']
vals = ['비밀의 서재', '나 + 친구 둘', '탈출 성공!  4:12 남김', '두 번', '                  인생테마 후보']
for y, l, v in zip(ROWS, labels, vals):
    d.text((190, y - 14), l, font=F(PB, 30), fill=SOFTC, anchor='ls')
    d.text((306, y - 12), v, font=F(BR, 64), fill=PEN, anchor='ls')
from PIL import ImageDraw as _D
for i in range(5):
    cx, cy, r = 322 + i * 46, 760, 19
    pts = [(cx + (r if k % 2 == 0 else r * 0.45) * np.cos(np.pi / 2 + k * np.pi / 5), cy - (r if k % 2 == 0 else r * 0.45) * np.sin(np.pi / 2 + k * np.pi / 5)) for k in range(10)]
    d.polygon(pts, fill=PEN if i < 4 else None, outline=PEN, width=3)
# sticky text (rotated small layer)
lay = Image.new('RGBA', (440, 190), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
ld.text((26, 70), '마지막 자물쇠', font=F(BR, 58), fill=PEN + (255,), anchor='ls')
ld.text((26, 140), '"탈깍!" 소리에 소름 돋음', font=F(BR, 52), fill=PEN + (255,), anchor='ls')
lay = lay.rotate(2.2, resample=Image.BICUBIC, expand=False)
im.paste(lay, (735 - 220, 960 - 95), lay)
# mascot die-cut sticker
m = Image.open('/home/user/escape-log-web/public/mascot.png').convert('RGBA')
m.thumbnail((210, 210))
a = np.array(m)[..., 3]
from PIL import ImageFilter
border = Image.fromarray(a).filter(ImageFilter.MaxFilter(17))
pad = Image.new('RGBA', (m.width + 20, m.height + 20), (0, 0, 0, 0))
sh = Image.new('RGBA', pad.size, (0, 0, 0, 0))
bm = Image.new('L', pad.size, 0); bm.paste(border, (10, 10))
pad.paste((255, 255, 255, 255), (0, 0), bm); pad.paste(m, (10, 10), m)
sm = bm.filter(ImageFilter.GaussianBlur(6)).point(lambda v: v * 0.35)
sh.paste((40, 30, 20, 255), (0, 0), sm)
pad = Image.alpha_composite(Image.new('RGBA', pad.size, (0,0,0,0)), pad).rotate(-9, resample=Image.BICUBIC, expand=True)
sh = sh.rotate(-9, resample=Image.BICUBIC, expand=True)
im.paste(sh, (700 + 6, 330 + 8), sh); im.paste(pad, (700, 330), pad)
# brand line on desk
d = ImageDraw.Draw(im)
d.text((540, 1238), '방탈깍노트', font=F(AG, 92), fill=(29, 29, 29), anchor='ms')
d.text((540, 1296), '방탈출 다녀온 날, 탈깍 한 줄', font=F(PR, 30), fill=(90, 80, 66), anchor='ms')
im.save(out, quality=92)
