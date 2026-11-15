"""영안실·춘화각 릴스 소리를 직접 합성한다(녹음·남의 음원 없음). 시각은 poster_reels.py 템플릿과 같다.
 morgue  : 형광등 윙 소리(가끔 지직), 1.6초 안내 방송 '딩동', 물방울, 심장 소리, 5.5초 철제 보관함 '스르륵-철컥', 6.3초 낮은 울림
 chunhwa : 바람·종이 바스락, 0.15초 쿵, 1.6초 방울 흔드는 소리, 느린 북 소리, 4.9초 문 '끼익', 6.3초 징
사용: python3 tools/ig/drawings/poster_reel_sfx.py morgue|chunhwa out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 10.0; MODE = sys.argv[1]
rng = np.random.default_rng(7 if MODE == "morgue" else 9)
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
env = np.clip(T / .6, 0, 1) * np.clip((DUR - T) / 1.2, 0, 1)

if MODE == "morgue":
    hum = .12 * np.sin(2 * np.pi * 120 * T) + .06 * np.sin(2 * np.pi * 240 * T) + .03 * np.sign(np.sin(2 * np.pi * 120 * T)) * .5
    hum += .25 * band(rng.standard_normal(N).astype(np.float32), 2000, 6000) * .08
    out += hum * env * .9
    out += .5 * band(rng.standard_normal(N).astype(np.float32), 60, 300) * env * .5            # 낮은 공조 소리
    for t0, d in ((.9, .12), (3.55, .22), (5.35, .3), (7.6, .1)):                               # 형광등 지직
        s = noise(d, 1500, 9000) * (np.sin(2 * np.pi * 60 * tt(d)) > 0); add(t0, .4 * s)
    add(.1, boom(1.8, 44, 1.2))
    tc = tt(1.2); f = 300 + 180 * np.sin(2 * np.pi * 1.6 * tc) + 60 * np.sin(2 * np.pi * 9 * tc)   # 문 '끼이익'
    creak = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (.6 + .4 * rng.random(len(tc)))
    add(.1, .1 * band(creak.astype(np.float32), 200, 3500) * np.sin(np.pi * tc / 1.2))
    t = 1.6; k = 0                                                                               # 발소리(복도 울림)
    while t < 8.4:
        step = (np.sin(2 * np.pi * 85 * tt(.12)) * np.exp(-tt(.12) / .02) + .6 * noise(.12, 800, 4000) * np.exp(-tt(.12) / .012))
        echo = np.zeros(int(.6 * SR), np.float32); echo[:len(step)] += step
        for dly, g in ((.11, .35), (.23, .18), (.37, .08)): i = int(dly * SR); echo[i:i + len(step)] += g * step
        add(t, echo, .5 if k % 2 else .42); t += .62; k += 1
    add(1.6, tone(1.4, ((659, .5), (1318, .12)), .5), .45); add(1.95, tone(1.6, ((523, .5), (1046, .12)), .6), .45)   # 딩동
    for t0 in (2.4, 4.1, 6.9, 8.7):                                                              # 물방울
        add(t0, tone(.25, ((1400 + rng.uniform(-200, 200), .5),), .04) * np.exp(-tt(.25) / .05), .5)
    t = 3.0
    while t < 8.6:
        k = (t - 3) / 5.6; add(t, beat(), .45 + .45 * k); t += 1.0 - .35 * k
    s = noise(.9, 300, 3000) * np.linspace(.2, 1, int(.9 * SR)); add(4.7, .45 * s)                # 서랍이 끌려 나오는 소리
    add(5.55, tone(.6, ((180, .6), (410, .5), (870, .3), (1830, .2)), .15) + noise(.6, 500, 6000) * np.exp(-tt(.6) / .03), .9)   # 철컥
    add(6.3, boom(2.6, 38, 1.4))
else:
    wind = band(rng.standard_normal(N).astype(np.float32), 150, 1200) * (.5 + .5 * np.sin(2 * np.pi * .17 * T + 2) ** 2)
    out += wind * env * .9
    for t0 in rng.uniform(.5, 9, 9):                                                             # 종이 바스락
        add(t0, .3 * noise(.25, 2000, 8000) * np.sin(np.pi * tt(.25) / .25) ** 2)
    add(.15, boom(2.0, 46, 1.3))
    for k in range(9):                                                                           # 방울 흔들기
        add(1.6 + k * .07 + rng.uniform(0, .03), tone(.6, ((2900 + rng.uniform(-150, 150), .4), (4300, .15)), .12), .25)
    t = 2.0
    while t < 8.6:                                                                               # 느린 북
        k = (t - 2) / 6.6; add(t, boom(.7, 70, .8 + .6 * k)); t += 1.3 - .4 * k
    tc = tt(1.1); f = 380 + 260 * np.sin(2 * np.pi * 2.3 * tc) + 120 * np.sin(2 * np.pi * 7 * tc)   # 문 끼익
    creak = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (.6 + .4 * rng.random(len(tc)))
    add(4.9, .12 * band(creak.astype(np.float32), 200, 4000) * np.sin(np.pi * tc / 1.1))
    add(6.3, tone(3.4, ((110, .6), (167, .4), (233, .3), (311, .2), (467, .1)), 1.3) * (1 + .3 * np.sin(2 * np.pi * 4 * tt(3.4))), .9)   # 징
    add(6.3, boom(1.4, 50, .8))

out /= np.percentile(np.abs(out), 99.95); out = np.tanh(out * .95) * .89
with wave.open(sys.argv[2], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.stack([out, out], 1) * 32767).astype(np.int16).tobytes())
