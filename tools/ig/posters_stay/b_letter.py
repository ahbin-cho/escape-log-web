"""시안 B — 활판 인쇄 포스터(빨강·검정 2도): '신입 단원 모집' 공고처럼."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from letterpress import Letterpress, RED, BLACK
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1920
lp = Letterpress(W, H, seed=29, misreg=3.0)
lp.register(BLACK, 0, 0, 0); lp.register(RED, 3.0, -2.0, 0.05)
lp.paper(tone=0.5)
def km(t, x, y, f, anchor='ls', sp=0):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im); spaced(d, (x, y), t, f, 255, sp, anchor)
    return np.asarray(im, np.float32) / 255
L, R = 90, 990
lp.border(50, 50, W - 50, H - 50, weight=5)
lp.lock(km('탈깍노트 이머시브 소식  ·  STAY ALIVE IN MUSEUM 앵콜', 540, 128, F(PB, 26), 'ms', 2), BLACK)
lp.rule(L, R, 152, 'thick_thin')
lp.lock(km('긴 급 구 인', 540, 250, F(AG, 64), 'ms', 6), RED)
lp.lock(km('신입 단원', 540, 445, F(AG, 190), 'ms', 4), BLACK)
lp.lock(km('모집 공고', 540, 640, F(AG, 190), 'ms', 4), BLACK)
lp.lock(km('공연을 준비하던 중, 봉인됐던 저주가 깨어났습니다.', 540, 722, F(PM, 34), 'ms'), BLACK)
lp.lock(km('박물관에서 끝까지 살아남을 분을 찾습니다.', 540, 770, F(PM, 34), 'ms'), BLACK)
lp.rule(L, R, 812, 'double')
# woodcut: the sealed jar with a red talisman
CX, TOP, BOT = 300, 900, 1300
ys = np.array([0, 30, 90, 190, 300, 380]) / 380 * (BOT - TOP) + TOP; rs = np.array([70, 100, 170, 185, 160, 105])
prof = [(CX - r, y) for y, r in zip(ys, rs)][::-1]
jar_pts = [(CX + r, y) for y, r in zip(ys, rs)] + prof
jar = lp.shape(jar_pts)
tone = lp.form_tone(jar)
lp.hatch(jar, angle=90, spacing=7.5, tone=tone, lo=0.15)
lp.key(jar, width=3.5, heavy=8)
lp.solid(lp.ellipse(CX, TOP, 70, 14))
tal = lp.poly([(CX - 42, 1040), (CX + 40, 1034), (CX + 46, 1190), (CX + 2, 1172), (CX - 38, 1196)])
lp.clear(tal, BLACK); lp.tint(tal, RED)
for y in range(1062, 1170, 22): lp.line([(CX - 22, y), (CX + 20, y + 3)], width=4)
lp.line([(CX, 1050), (CX + 2, 1175)], width=5)
for k in range(5):  # cracks of escaping smoke above the mouth
    a = -np.pi / 2 + (k - 2) * 0.35
    lp.line([(CX + 20 * (k - 2), TOP - 10), (CX + 20 * (k - 2) + 70 * np.cos(a), TOP - 10 + 90 * np.sin(a))], width=3, taper=(0.1, 0.9))
# conditions column
rows = [('근무지', '롯데월드 민속박물관'), ('근무', '매일 19:30 · 본공연 90분'), ('출근', '19:10 프리쇼(20분)'), ('자격', '만 16세 이상'), ('참가비', '50,000원')]
x0 = 520
for i, (k, v) in enumerate(rows):
    y = 905 + i * 72
    lp.lock(km(k, x0, y, F(PB, 30)), RED)
    lp.lock(km(v, x0 + 120, y, F(PB, 34)), BLACK)
    lp.leaders(x0, R, y + 18, size=3, gap=10)
lp.lock(km('※ 잡히면 역귀가 됩니다', x0, 1290, F(AG, 40)), RED)
lp.rule(L, R, 1350, 'thin_thick')
lp.type_line('STAY ALIVE IN MUSEUM', L, R, 1470, 92, face='clarendon', ink=BLACK)
lp.lock(km('~ 11.29', L, 1650, F(MJ, 150)), RED)
lp.lock(km('앵콜 마지막 2주', 630, 1600, F(AG, 46)), BLACK)
lp.lock(km('살아남아야 끝나요', 630, 1660, F(PB, 40)), BLACK)
lp.rule(L, R, 1712, 'single')
lp.lock(km('롯데월드 홈페이지 예매  ·  보도자료 기준, 예매처에서 다시 확인', 540, 1762, F(PM, 26), 'ms'), BLACK)
lp.lock(km('TALKKAK NOTE  ·  @talkkak.note', 540, 1820, F(PB, 24), 'ms', 3), BLACK)
lp.press(RED); lp.press(BLACK)
lp.fold('h', 960, depth=0.7); lp.tone_edges(0.8); lp.foxing(90); lp.tack(70, 70); lp.tack(W - 70, 70)
lp.save(out)
