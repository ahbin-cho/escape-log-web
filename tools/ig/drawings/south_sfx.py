"""경기남부 릴스 4편 소리를 직접 합성한다(녹음·남의 음원 없음). 시각은 south_reels.py 템플릿과 같다.
 bokdo : 엘리베이터 '띵'·문 열림, 형광등 윙·지직, 발소리 없는 정적 → 5.3초 뒤에서 비명(걸러 낸 잡음이 치솟음), 6.3초 낮은 울림
 sagwi : 시계 초침, 숨소리(이불 속), 바닥 긁는 소리, 4.7초 심장, 5.4초 숨 멎는 '쿵'
 scare : 밤바람·풀벌레, 엔진 식는 '틱', 깜빡이 경고음, 4.7초 쾅(사고 기억), 까마귀 같은 거친 울음
 kono  : 옆 부스에서 새는 둔탁한 반주, 네온 지직, 마이크 '삐-' 하울링(5.3초), 6.3초 낮은 울림
사용: python3 tools/ig/drawings/south_sfx.py bokdo|sagwi|scare|kono out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 10.2; MODE = sys.argv[1]
rng = np.random.default_rng({"bokdo": 3, "sagwi": 5, "scare": 7, "kono": 11}[MODE])
N = int(SR * DUR); T = np.arange(N) / SR; out = np.zeros(N, np.float32)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d, lo, hi): return band(rng.standard_normal(int(d * SR)).astype(np.float32), lo, hi)
def tt(d): return np.arange(int(d * SR)) / SR
def boom(d, f0, g=1.0):
    t = tt(d); f = f0 * (1 + .6 * np.exp(-t / .08))
    return g * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d * .35)) + .5 * noise(d, 30, 400) * np.exp(-t / .12))
def tone(d, partials, decay):
    t = tt(d); return sum(a * np.sin(2 * np.pi * f * t) for f, a in partials) * np.exp(-t / decay) * np.minimum(1, t / .005)
def beat(f=48):
    s = np.zeros(int(.5 * SR), np.float32)
    for off, g in ((0, 1), (.18, .7)):
        t = tt(.16); k = g * np.sin(2 * np.pi * f * t) * np.exp(-t / .045) * np.minimum(1, t / .004); i = int(off * SR); s[i:i + len(k)] += k
    return s
def amb(lo, hi, g): return band(rng.standard_normal(N).astype(np.float32), lo, hi) * g
env = np.clip(T / .6, 0, 1) * np.clip((DUR - T) / 1.2, 0, 1)
title = lambda: (add(6.3, boom(2.6, 38, 1.3)), add(6.3, tone(3.0, ((98, .5), (147, .3), (196, .2)), 1.2), .6))
flick = lambda ts: [add(t0, .35 * noise(d, 1500, 9000) * (np.sin(2 * np.pi * 60 * tt(d)) > 0)) for t0, d in ts]

if MODE == "bokdo":
    out += (.1 * np.sin(2 * np.pi * 120 * T) + .05 * np.sin(2 * np.pi * 240 * T) + amb(60, 300, .25)) * env
    add(0, tone(1.5, ((1318, .5), (2636, .1)), .5), .5)                                       # 띵
    add(.15, noise(1.4, 200, 2500) * np.sin(np.pi * tt(1.4) / 1.4) * .35)                       # 문 열림
    add(1.5, boom(.5, 70, .6))
    flick(((2.38, .1), (3.7, .14), (4.6, .1), (5.2, .12)))
    t = 2.6
    while t < 5.2: add(t, beat(), .3 + .1 * (t - 2.6)); t += .9
    n = tt(1.4); f = 900 + 1400 * np.minimum(1, n / .25) - 300 * n                               # 비명(사람 목소리가 아니라 걸러 낸 잡음)
    scream = band(rng.standard_normal(len(n)).astype(np.float32), 600, 4200) * (1 + np.sin(2 * np.pi * f * n / 1000 * 6)) * .5
    scream *= np.minimum(1, n / .05) * np.exp(-n / .7)
    add(5.3, scream, 1.1); add(5.3, boom(1.0, 60, .9))
    title()
elif MODE == "sagwi":
    out += amb(80, 600, .18) * env
    for k in range(10): add(.3 + k, tone(.05, ((3200, .6), (4800, .2)), .01), .4)              # 초침
    for t0 in (1.0, 3.0, 5.0):                                                                  # 이불 속 숨소리
        add(t0, .5 * noise(1.4, 300, 2200) * np.sin(np.pi * tt(1.4) / 1.4) ** 2)
    for t0 in (2.2, 3.9):                                                                       # 바닥 긁는 소리
        add(t0, .35 * noise(.7, 1500, 6000) * (np.sin(2 * np.pi * 14 * tt(.7)) > .2) * np.sin(np.pi * tt(.7) / .7))
    t = 4.4
    while t < 6.2: add(t, beat(), .7); t += .62
    add(5.4, boom(1.6, 40, 1.4)); n2 = tt(1.3)
    add(5.4, .18 * (np.sin(2 * np.pi * 1661 * n2) + np.sin(2 * np.pi * 1760 * n2)) * np.exp(-n2 / .4))
    title()
elif MODE == "scare":
    wind = amb(120, 900, .9) * (.5 + .5 * np.sin(2 * np.pi * .13 * T) ** 2)
    out += wind * env
    for k in range(40):                                                                          # 풀벌레
        t0 = rng.uniform(.3, 9.5); add(t0, tone(.08, ((4600 + rng.uniform(-300, 300), .3),), .03) * (np.sin(2 * np.pi * 40 * tt(.08)) > 0), .25)
    for t0 in np.arange(1.0, 9.6, 1.45): add(t0, tone(.03, ((2400, .5),), .006), .35)          # 엔진 식는 틱
    for t0 in np.arange(.6, 9.5, .72): add(t0, tone(.12, ((880, .4), (1320, .15)), .05), .12)    # 비상등 깜빡
    add(.1, boom(1.8, 46, 1.1))
    add(4.7, boom(1.4, 52, 1.5)); add(4.72, .7 * noise(.6, 800, 7000) * np.exp(-tt(.6) / .12))   # 쾅·유리
    n = tt(.5); add(3.2, .35 * band((np.sign(np.sin(2 * np.pi * (520 - 260 * n) * n)) * (rng.random(len(n)) * .5 + .5)).astype(np.float32), 300, 3000) * np.sin(np.pi * n / .5))
    title()
else:
    beatbed = np.zeros(N, np.float32)                                                            # 옆 부스에서 새는 반주(벽 너머라 낮은 소리만)
    for t0 in np.arange(.2, 10, .48):
        k = boom(.3, 60, .9); i = int(t0 * SR); beatbed[i:i + len(k)] += k[:max(0, N - i)]
    beatbed += .3 * band(np.sin(2 * np.pi * 110 * T * (1 + .02 * np.sin(2 * np.pi * .5 * T))).astype(np.float32) * (np.sin(2 * np.pi * 2.08 * T) > 0), 60, 300)
    out += band(beatbed, 40, 350) * env * .7
    out += (.06 * np.sin(2 * np.pi * 120 * T) + amb(3000, 7000, .05)) * env                     # 네온 윙
    flick(((2.0, .12), (2.65, .1), (3.7, .14), (5.1, .1)))
    add(.1, boom(1.6, 48, 1.0))
    n = tt(1.2); hw = np.sin(2 * np.pi * 2650 * n) * np.minimum(1, n / .5) * np.exp(-np.maximum(0, n - .9) / .08)   # 마이크 하울링
    add(5.3, .28 * hw)
    title()

out /= np.percentile(np.abs(out), 99.95); out = np.tanh(out * .95) * .89
with wave.open(sys.argv[2], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.stack([out, out], 1) * 32767).astype(np.int16).tobytes())
