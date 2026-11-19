"""시안 I — 팝아트 실크스크린 6칸: 같은 얼굴, 여섯 가지 색과 표정. '이 중 누가 역귀일까?'"""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import popart as PA
from popart import PopSilkscreen
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
ps = PopSilkscreen(1080, 1380, seed=33)
ps.canvas()
panels = ps.grid(2, 3, gap=14, margin=18, origin=(0.5, 0.52), unit=0.3)
schemes = [('HOT_PINK', 'LEMON', 'TURQUOISE'), ('ULTRA', 'TANGERINE', 'LIME'), ('LEMON', 'MINT', 'RED'),
           ('RED', 'SKY', 'YELLOW'), ('MINT', 'LILAC', 'ORANGE'), ('VIOLET', 'CREAM', 'HOT_PINK')]
moods = ['smile', 'grin', 'stare', 'oh', 'sleep', 'red']
for p, (bg, face, eye), mood in zip(panels, schemes, moods):
    g = lambda n: getattr(PA, n, n)
    ps.ground(p, g(bg))
    head = p.shape([(0, -1.35), (0.85, -1.0), (1.05, 0.0), (0.9, 0.9), (0.45, 1.3), (-0.45, 1.3), (-0.9, 0.9), (-1.05, 0.0), (-0.85, -1.0)])
    ps.paint(p, head, g(face), wobble=4, drift=(6, -4))
    ey = -0.15
    eyes = np.maximum(p.ellipse(-0.4, ey, 0.24, 0.16 if mood != 'oh' else 0.24), p.ellipse(0.4, ey, 0.24, 0.16 if mood != 'oh' else 0.24))
    ps.paint(p, eyes, g(eye), wobble=3, drift=(-4, 3))
    # black key: outline, eyes, mouth
    solid = p.stroke([(0, -1.35), (0.85, -1.0), (1.05, 0.0), (0.9, 0.9), (0.45, 1.3), (-0.45, 1.3), (-0.9, 0.9), (-1.05, 0.0), (-0.85, -1.0), (0, -1.35)], 0.07)
    if mood == 'sleep':
        solid = np.maximum(solid, np.maximum(p.stroke([(-0.6, ey), (-0.4, ey + 0.1), (-0.2, ey)], 0.07), p.stroke([(0.2, ey), (0.4, ey + 0.1), (0.6, ey)], 0.07)))
    else:
        pr = 0.09 if mood != 'stare' else 0.05
        solid = np.maximum(solid, np.maximum(p.ellipse(-0.4, ey, pr), p.ellipse(0.4, ey, pr)))
    if mood == 'grin':
        solid = np.maximum(solid, p.shape([(-0.55, 0.45), (0.55, 0.45), (0.3, 0.8), (-0.3, 0.8)]))
    elif mood == 'oh':
        solid = np.maximum(solid, p.ellipse(0, 0.6, 0.17, 0.24))
    elif mood == 'stare':
        solid = np.maximum(solid, p.stroke([(-0.3, 0.6), (0.3, 0.6)], 0.06))
    else:
        solid = np.maximum(solid, p.stroke([(-0.45, 0.45), (0, 0.7), (0.45, 0.45)], 0.08))
    if mood == 'red':
        ps.paint(p, np.maximum(p.ellipse(-0.4, ey, 0.1), p.ellipse(0.4, ey, 0.1)), g('RED'), wobble=1)
    tone = p.soft(p.shape([(0.3, -1.2), (1.05, -0.2), (0.95, 0.95), (0.4, 1.3), (0.6, 0.3)]), 6) * 0.45
    ps.key(p, solid, tone=tone, shift=tuple(np.random.default_rng(len(mood)).normal(0, 4, 2)), rot=np.random.default_rng(len(mood) + 3).normal(0, 0.8),
           density=1.0 if mood != 'sleep' else 0.94, flood=0.25)
tmp = out + '.pop.jpg'
ps.save(tmp, quality=92)
im = Image.new('RGB', (1080, 1920), (246, 242, 232)); im.paste(Image.open(tmp), (0, 170))
os.remove(tmp)
d = ImageDraw.Draw(im)
INK, RED = (24, 22, 22), (210, 40, 50)
d.text((60, 110), '이 중 누가 역귀일까?', font=F(AG, 76), fill=INK, anchor='ls')
spaced(d, (64, 150), 'ENCORE · STAY ALIVE IN MUSEUM · 배우 10명', F(PB, 24), (110, 100, 92), 2)
d.text((60, 1690), '~ 11.29', font=F(MJ, 110), fill=RED, anchor='ls')
d.text((470, 1640), '앵콜 마지막 2주', font=F(AG, 50), fill=INK, anchor='ls')
d.text((470, 1690), '롯데월드 민속박물관 · 이머시브 체이스', font=F(PB, 26), fill=INK, anchor='ls')
for i, s in enumerate(INFO): d.text((62, 1770 + i * 34), s, font=F(PM, 23), fill=(90, 82, 74), anchor='ls')
d.text((1018, 1880), '@bangtalkkak.note', font=F(PB, 22), fill=(110, 100, 92), anchor='rs')
im.save(out, quality=92)
