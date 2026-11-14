"""자동 릴스 3편 배경 — 테마마다 다른 화풍(운영자 요청 11/14: 전부 판화풍이 되지 않게).
  sungji  : 칠판 분필(학원) — 날짜를 세는 빗금, 지운 자국
  morgue  : CCTV 비디오(VHS) — 냉장 서랍 벽, 열린 한 칸, 화면 글자
  chunhwa : 수묵화 — 안개 낀 산, 누각, 붉은 달
공식 포스터·사진을 쓰지 않고 줄거리 첫 문장에서 떠오르는 장면을 새로 그린다.
사용: python3 tools/ig/drawings/reel_scenes2.py <sungji|morgue|chunhwa> out.jpg"""
import os, sys
sys.path.insert(0, os.path.expanduser('~/.claude/skills/claude-drawing-skill/lib'))
import numpy as np

which, out = sys.argv[1], sys.argv[2]
W, H = 1080, 1920

if which == 'sungji':
    from chalk import Chalkboard
    B = Chalkboard(W, H, seed=11)
    rng = np.random.default_rng(3)
    B.slate()
    WHITE, RED = '#f2efe6', '#e2574c'
    # 예전에 쓰고 지운 빗금들(유령처럼 남은 자국)
    with B.erased(keep=0.22, angle=8, smear=40):
        for r in range(9):
            y = 300 + r * 62
            for g in range(7):
                x = 110 + g * 128 + rng.uniform(-6, 6)
                for k in range(4): B.line(x + k * 18, y, x + k * 18 + rng.uniform(-3, 3), y + 44, colour=WHITE, width=4, pressure=0.8)
                B.line(x - 10, y + 36, x + 70, y + 6, colour=WHITE, width=4, pressure=0.8)
    # 지금 세고 있는 빗금: 아래로 갈수록 삐뚤고 급해진다
    n = 0
    for r in range(11):
        y = 930 + r * 70
        for g in range(7):
            if r == 10 and g > 3: break
            x = 110 + g * 128 + rng.uniform(-8, 8)
            wob = 2 + r * 0.9
            for k in range(4):
                B.line(x + k * 18 + rng.uniform(-wob, wob), y + rng.uniform(-wob, wob), x + k * 18 + rng.uniform(-wob, wob) * 2, y + 48 + rng.uniform(-wob, wob),
                       colour=WHITE, width=4.4, pressure=0.9)
            B.line(x - 12, y + 40 + rng.uniform(-wob, wob), x + 72, y + 6 + rng.uniform(-wob, wob), colour=WHITE, width=4.4, pressure=0.92)
            n += 5
    # 마지막 묶음만 붉은 분필
    x, y = 110 + 4 * 128, 930 + 10 * 70
    for k in range(3): B.line(x + k * 18, y, x + k * 18 + 2, y + 48, colour=RED, width=5, pressure=0.95)
    # 손바닥으로 문지른 자국, 분필 가루
    B.swipe([(180, 1250), (460, 1310), (760, 1280)], width=150, strength=0.8)
    B.smudge(820, 1560, w=220, h=90, rot=-12, strength=0.7)
    B.dust(amount=1.0)
    B.frame()
    B.save(out)

elif which == 'morgue':
    from vhs import VHSCamcorder
    V = VHSCamcorder(W, H, seed=8, keep_stages=False)
    # 벽과 바닥
    V.paint(V.rect(0, 0, W, H), '#5d6b68')
    V.paint(V.rect(0, 1640, W, H), '#7f8a86')
    for i in range(-6, 7): V.paint(V.poly([(540 + i * 110, 1640), (540 + i * 112 + 3, 1640), (540 + i * 330 + 5, H), (540 + i * 330, H)]), '#59625f')
    for yy in (1700, 1790): V.paint(V.rect(0, yy, W, yy + 4), '#59625f')
    # 스테인리스 서랍 3×4
    X0, Y0, CW, CH = 96, 640, 296, 246
    for r in range(4):
        for c in range(3):
            x, y = X0 + c * CW, Y0 + r * CH
            V.paint(V.rect(x, y, x + CW, y + CH), '#2c3331')
            if (r, c) == (2, 1):
                V.paint(V.rect(x + 12, y + 12, x + CW - 12, y + CH - 12), '#050707')       # 열린 칸: 안은 새까맣다
                continue
            V.paint(V.rect(x + 10, y + 10, x + CW - 10, y + CH - 10, r=10), '#a9b6b2', form=0.5, form_r=18)
            V.paint(V.rect(x + CW / 2 - 60, y + CH - 70, x + CW / 2 + 60, y + CH - 52, r=8), '#dfe7e4', form=0.6, form_r=6)
            V.paint(V.rect(x + 30, y + 34, x + 104, y + 70), '#eef1ea')
    # 앞으로 나온 판과 흰 천, 발, 꼬리표
    x, y = X0 + CW, Y0 + 2 * CH
    tray = V.poly([(x + 18, y + CH - 30), (x + CW - 18, y + CH - 30), (x + CW + 90, y + CH + 330), (x - 90, y + CH + 330)])
    V.shadow(tray, strength=0.5, soft=22, dy=26)
    V.paint(tray, '#b9c4c0', form=0.3, form_r=20)
    sheet = V.shape([(x - 40, y + CH + 300), (x + 10, y + CH + 40), (x + 80, y + CH - 6), (x + CW / 2, y + CH + 6), (x + CW - 80, y + CH - 6), (x + CW - 10, y + CH + 40), (x + CW + 40, y + CH + 300)])
    V.paint(sheet, '#eef2ee', form=0.55, form_r=30)
    for fx in (x + CW / 2 - 62, x + CW / 2 + 58):
        foot = V.shape([(fx - 32, y + CH + 250), (fx - 26, y + CH + 110), (fx, y + CH + 84), (fx + 26, y + CH + 110), (fx + 32, y + CH + 250)])
        V.paint(foot, '#f7f9f6', form=0.7, form_r=16)
    V.paint(V.line([(x + CW / 2 + 60, y + CH + 240), (x + CW / 2 + 120, y + CH + 290)], 3), '#3a3f3d')
    V.paint(V.poly([(x + CW / 2 + 104, y + CH + 276), (x + CW / 2 + 176, y + CH + 290), (x + CW / 2 + 166, y + CH + 372), (x + CW / 2 + 94, y + CH + 356)]), '#e9dfc0')
    # 천장 형광등
    lamp = V.rect(280, 470, 800, 498, r=10)
    V.emit(lamp, '#dffff4', 1.6)
    V.ambient('#bfe6dc', 0.07)
    V.light(540, 560, 1050, colour='#d4fff0', power=0.85)
    # 캠코더·테이프·열화, 화면 글자
    V.camera(tilt=1.6, white_balance=(0.86, 1.02, 1.06), exposure=0.7, vignette=0.6, gain_noise=0.06)
    V.record(saturation=0.7)
    V.wear(noise=0.045, tracking=(0.2, 0.02), dropouts=30)
    V.rec(70, 120, px=8)
    V.osd_text('CAM 03', W - 70, 120, px=8, anchor='r')
    V.datestamp('AM 2:13', '11.16', 70, H - 240, px=8)
    V.save(out, quality=92)

else:
    from inkpaint import Painting
    P = Painting(W, H, seed=21)
    P.paper()
    # 붉은 달
    P.sun(780, 520, r=74, red=True)
    # 먼 산 → 가까운 산, 사이에 안개
    far = P.ridge(980, peaks=((260, 300, 240), (700, 220, 300), (980, 260, 200)), rough=18)
    P.wash(far, dens=0.22, decay=260, mist_y=1080, mist_h=120)
    main = P.peak(330, 760, height=640, left_w=300, right_w=520, shoulders=((760, 120, 160),))
    P.wash(main, dens=0.42, decay=240, mist_y=1260, mist_h=130)
    P.cun(main, 80, 760, n=170, shadow_x=330, max_y=1240)
    P.ridge_line(main, 60, 900)
    P.mist(1250, h=110, strength=0.9)
    # 앞 언덕 위의 누각(춘화각): 겹처마 지붕과 기둥, 열린 끝방
    hill = P.ridge(1560, peaks=((560, 150, 420),), rough=14)
    P.rock(hill, dens=0.62, texture=36)
    bx, by = 560, 1400
    from core import curve
    for k, (hw, yy, w) in enumerate(((300, by - 150, 15), (220, by - 250, 12))):
        P.stroke(curve((bx - hw, yy + 34), (bx, yy - 26), -26, 22), w, 0.9, dry=0.18, taper=(0.02, 0.2))
        P.stroke(curve((bx + hw, yy + 34), (bx, yy - 26), 26, 22), w, 0.9, dry=0.18, taper=(0.02, 0.2))
        P.stroke([(bx - hw + 30, yy + 40), (bx + hw - 30, yy + 40)], 5, 0.75, dry=0.3)
    P.stroke([(bx, by - 276), (bx, by - 320)], 5, 0.9, dry=0.1)
    for px in (-200, -68, 68, 200):
        P.stroke([(bx + px, by - 108), (bx + px + 2, by + 26)], 9, 0.85, dry=0.25, taper=(0.05, 0.1))
    P.stroke([(bx - 240, by + 30), (bx + 240, by + 30)], 8, 0.85, dry=0.3)
    for px in (-134, 0):
        for gy in (by - 90, by - 50, by - 10): P.stroke([(bx + px - 52, gy), (bx + px + 52, gy)], 1.8, 0.45, dry=0.5)
        for gx in (-26, 0, 26): P.stroke([(bx + px + gx, by - 100), (bx + px + gx, by + 20)], 1.8, 0.45, dry=0.5)
    # 끝방: 붉은 빛과 갓 쓴 사람
    for yy in range(by - 96, by + 22, 7): P.stroke([(bx + 86, yy), (bx + 182, yy)], 7, 0.5, dry=0.2, red=True)
    P.stroke([(bx + 134, by - 52), (bx + 135, by + 22)], 11, 0.95, dry=0.08, taper=(0.3, 0.05))
    P.dot(bx + 134, by - 66, 8, 0.95, squash=1.0)
    P.stroke([(bx + 112, by - 72), (bx + 156, by - 72)], 4, 0.95, dry=0.05)
    # 처마 끝 등 둘
    for lx in (bx - 286, bx + 286):
        P.stroke([(lx, by - 112), (lx, by - 84)], 1.6, 0.7, dry=0.1)
        P.dot(lx, by - 62, 15, 0.95, squash=0.75, red=True)
    # 소나무와 올라가는 사람
    P.pine((150, 1560), (250, 1250), bend=60, branches=(((215, 1380), (330, 1330), -20), ((235, 1310), (150, 1270), 14)), extra_tufts=((262, 1240),))
    P.traveller(430, 1500)
    P.birds([(300, 420, 1.2), (350, 450, 0.9), (250, 470, 0.8)])
    P.mist(1700, h=120, strength=0.75)
    P.save(out)
print('ok', out)
