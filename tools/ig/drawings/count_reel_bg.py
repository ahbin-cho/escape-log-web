"""'테마 801개, 주인장도 아직 멀었다' 릴스 시안 3종의 배경(화풍별). 글자·움직임은 템플릿(HTML)에서 얹는다.
  pixel  : 픽셀 게임풍 — 문이 끝없이 이어지는 던전 복도(가로로 긴 그림, 영상에서 옆으로 흐른다)
  receipt: 영수증·스티커풍 — 크림 판지 위 감열지 영수증(빈 종이, 글자는 템플릿에서 찍는다)
  chalk  : 칠판풍 — 빈 칠판과 분필 가루
사용: python3 tools/ig/drawings/count_reel_bg.py <pixel|receipt|chalk> out.png"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np
which, out = sys.argv[1], sys.argv[2]

if which == 'pixel':
    from pixelart import PixelArt
    P = PixelArt(w=720, h=320, scale=6, seed=3, bg='#14122a')
    rng = np.random.default_rng(5)
    P.gradient(0, 0, 720, 120, '#0d0b1f', '#1b1838')
    # 벽돌
    for y in range(40, 236, 12):
        off = 0 if (y // 12) % 2 else 10
        for x in range(-off, 720, 20):
            c = ['#2a2648', '#2f2a52', '#262244'][int(rng.integers(0, 3))]
            P.rect(x + 1, y + 1, x + 19, y + 11, c)
    P.rect(0, 236, 720, 240, '#0b0a18')
    # 바닥 타일
    P.gradient(0, 240, 720, 320, '#3a3358', '#1c1934')
    for x in range(0, 720, 24): P.line(x, 240, x - 14, 320, '#28244a')
    for y in (256, 280): P.line(0, y, 720, y, '#28244a')
    # 문 15개: 색이 조금씩 다르고, 문패 숫자 자리와 손잡이
    cols = ['#b5461f', '#3f8f86', '#7a68c2', '#c2452a', '#d9a23a', '#4e9a72', '#b2212e', '#3b6fd9']
    for i in range(15):
        x = 14 + i * 48
        c = cols[i % len(cols)]
        P.rect(x - 2, 118, x + 32, 238, '#0b0a18')
        P.rect(x, 120, x + 30, 238, c)
        P.rect(x + 3, 126, x + 27, 170, '#00000000'[:7] if False else '#14122a')
        P.rect(x + 5, 128, x + 25, 168, c)
        P.rect(x + 5, 176, x + 25, 232, c)
        P.line(x + 3, 174, x + 27, 174, '#14122a')
        P.rect(x + 23, 198, x + 26, 202, '#ffe27a')
        P.rect(x + 9, 108, x + 21, 116, '#f5f0e6')            # 문패
        if i % 3 == 1:                                         # 횃불
            P.rect(x + 38, 150, x + 41, 166, '#6a4a2c'); P.rect(x + 37, 142, x + 42, 150, '#ffb347'); P.rect(x + 38, 138, x + 41, 142, '#ffe27a')
            P.glow(x + 39, 146, 26, '#ffb347', strength=0.35)
    P.save(out)
elif which == 'receipt':
    from sticker import Sticker
    S = Sticker(1080, 1920, seed=9)
    S.board(colour='#E7D9BD', kind='kraft')
    R = S.receipt(800, 1500)
    R.crease(520); R.crease(1010)
    R.barcode(1330, 90)
    S.lay(R, 540, 880, rot=0.0, curl=0.25)
    S.tape(540, 130, 240, rot=-3, colour='#E49A4A')
    S.save(out)
else:
    from chalk import Chalkboard
    B = Chalkboard(1080, 1920, seed=6)
    B.slate()
    with B.erased(keep=0.14, angle=6, smear=46):
        for y in (360, 520, 700): B.line(120, y, 900, y + 10, colour='#f2efe6', width=5, pressure=0.8)
    B.smudge(760, 1500, w=260, h=110, rot=-10, strength=0.6)
    B.dust(amount=1.0)
    B.frame()
    B.chalk_stick(700, B.tray_y - 6, colour='#f2efe6'); B.chalk_stick(820, B.tray_y - 6, colour='#e2574c', rot=4)
    B.eraser(240, B.tray_y - 30)
    B.save(out)
print('ok', out)
