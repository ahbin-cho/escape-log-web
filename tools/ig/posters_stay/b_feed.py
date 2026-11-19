"""시안 B 피드(1080×1350) — 활판 인쇄 포스터(빨강·검정 2도): '신입 단원 모집' 공고처럼."""
import sys, os
sys.path.insert(0, '/root/.claude/skills/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from letterpress import Letterpress, RED, BLACK
from PIL import Image, ImageDraw
from ptext import *
out = sys.argv[1]
W, H = 1080, 1350
lp = Letterpress(W, H, seed=29, misreg=3.0)
lp.register(BLACK, 0, 0, 0); lp.register(RED, 3.0, -2.0, 0.05)
lp.paper(tone=0.5)
def km(t, x, y, f, anchor='ls', sp=0):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im); spaced(d, (x, y), t, f, 255, sp, anchor)
    return np.asarray(im, np.float32) / 255
L, R = 90, 990
lp.border(40, 40, W - 40, H - 40, weight=5)
lp.lock(km('방탈깍노트 이머시브 소식  ·  STAY ALIVE IN MUSEUM 앵콜', 540, 100, F(PB, 24), 'ms', 2), BLACK)
lp.rule(L, R, 120, 'thick_thin')
lp.lock(km('긴 급 구 인', 540, 182, F(AG, 50), 'ms', 6), RED)
lp.lock(km('신입 캐스트', 540, 330, F(AG, 140), 'ms', 2), BLACK)
lp.lock(km('모집 공고', 540, 480, F(AG, 150), 'ms', 4), BLACK)
lp.lock(km('가을 특별공연 준비 중, 진품 유물이 떨어지고 정전됐습니다.', 540, 540, F(PM, 28), 'ms'), BLACK)
lp.lock(km('배우 10명과 함께 끝까지 살아남을 분을 찾습니다.', 540, 578, F(PM, 28), 'ms'), BLACK)
lp.rule(L, R, 606, 'double')
# woodcut: the sealed jar with a red talisman
CX, TOP, BOT = 280, 680, 960
ys = np.array([0, 30, 90, 190, 300, 380]) / 380 * (BOT - TOP) + TOP; rs = np.array([52, 74, 125, 136, 118, 78])
prof = [(CX - r, y) for y, r in zip(ys, rs)][::-1]
jar_pts = [(CX + r, y) for y, r in zip(ys, rs)] + prof
jar = lp.shape(jar_pts)
tone = lp.form_tone(jar)
lp.hatch(jar, angle=90, spacing=7.5, tone=tone, lo=0.15)
lp.key(jar, width=3.5, heavy=8)
lp.solid(lp.ellipse(CX, TOP, 52, 11))
crack = [(CX + 25, TOP + 8), (CX + 4, 740), (CX + 32, 800), (CX - 8, 860), (CX + 20, 910), (CX - 12, BOT - 8)]
cm = lp.tube(crack, 12, 4, per=1)
lp.clear(cm, BLACK); lp.tint(cm, RED)
for k in range(5):  # cracks of escaping smoke above the mouth
    a = -np.pi / 2 + (k - 2) * 0.35
    lp.line([(CX + 20 * (k - 2), TOP - 10), (CX + 20 * (k - 2) + 70 * np.cos(a), TOP - 10 + 90 * np.sin(a))], width=3, taper=(0.1, 0.9))
# conditions column
rows = [('근무지', '롯데월드 민속박물관'), ('근무', '매일 19:30 · 본공연 90분'), ('출근', '19:10 프리쇼(20분)'), ('자격', '만 16세 이상'), ('참가비', '50,000원')]
x0 = 520
for i, (k, v) in enumerate(rows):
    y = 690 + i * 54
    lp.lock(km(k, x0, y, F(PB, 26)), RED)
    lp.lock(km(v, x0 + 104, y, F(PB, 30)), BLACK)
    lp.leaders(x0, R, y + 14, size=3, gap=10)
lp.lock(km('※ 누군가를 살릴까, 내가 살아남을까', x0, 975, F(AG, 26)), RED)
lp.rule(L, R, 1010, 'thin_thick')
lp.type_line('STAY ALIVE IN MUSEUM', L, R, 1098, 70, face='clarendon', ink=BLACK)
lp.lock(km('~ 11.29', L, 1222, F(MJ, 108)), RED)
lp.lock(km('앵콜 마지막 2주', 600, 1180, F(AG, 40)), BLACK)
lp.lock(km('살아남아야 끝나요', 600, 1224, F(PB, 32)), BLACK)
lp.rule(L, R, 1238, 'single')
lp.lock(km('롯데월드 홈페이지 예매  ·  보도자료 기준, 예매처에서 다시 확인', 540, 1264, F(PM, 21), 'ms'), BLACK)
lp.lock(km('※ 방탈깍노트가 만든 소개 카드예요(공식 공고 아님) · @talkkak.note', 540, 1290, F(PM, 19), 'ms'), RED)
lp.press(RED); lp.press(BLACK)
lp.fold('h', 675, depth=0.6); lp.tone_edges(0.8); lp.foxing(90); lp.tack(60, 60); lp.tack(W - 60, 60)
lp.save(out)
