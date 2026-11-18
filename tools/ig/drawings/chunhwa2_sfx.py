"""춘화각 릴스 v2 소리(직접 합성). 시각은 templates/reel-chunhwa2.html 과 같다.
바람 깔림, 0.2초 낮은 쿵, 2.0초 문 끼익, 3~5.5초 느린 북, 5.6초 촛불 훅(뒤로 정적), 6.1초 금줄 바스락, 7.2초 큰 쿵+긁는 소리, 9.0초 징, 11.3초 탈깍.
사용: python3 chunhwa2_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 12.0; N = int(SR * DUR); T = np.arange(N) / SR; out = np.zeros(N, np.float32); rng = np.random.default_rng(11)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d, lo, hi): return band(rng.standard_normal(int(d * SR)).astype(np.float32), lo, hi)
def tt(d): return np.arange(int(d * SR)) / SR
def boom(d, f0, g=1.0):
    t = tt(d); f = f0 * (1 + .6 * np.exp(-t / .08))
    return g * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d * .35)) + .5 * noise(d, 30, 400) * np.exp(-t / .12))
wind = band(rng.standard_normal(N).astype(np.float32), 120, 700) * (.5 + .5 * np.sin(2 * np.pi * .23 * T + 1)) ** 2
mute = np.where((T > 5.65) & (T < 7.15), .12, 1.0)                         # 촛불 꺼진 뒤엔 거의 정적
out += .22 * wind * mute * np.clip(T / .6, 0, 1)
add(.2, boom(1.4, 46), .7)
t = tt(1.3); f = 310 + 90 * np.sin(2 * np.pi * 1.1 * t) + 40 * t                # 문 끼익
add(2.0, (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + noise(1.3, 800, 3000) * .6) * np.sin(np.pi * t / 1.3) ** 1.5 * (.6 + .4 * np.sin(2 * np.pi * 17 * t)), .28)
for t0 in (3.3, 4.2, 5.0): add(t0, boom(.7, 62), .55)                           # 느린 북
add(5.58, noise(.35, 300, 2500) * np.exp(-tt(.35) / .07), .7)                   # 훅
for t0 in np.arange(6.15, 7.0, .11): add(t0, noise(.07, 2500, 9000) * np.exp(-tt(.07) / .02), .22)   # 종이 바스락
add(7.2, boom(2.2, 38), 1.3)
t = tt(1.2); add(7.2, band(np.sign(np.sin(2 * np.pi * np.cumsum(900 + 1400 * t) / SR)).astype(np.float32), 700, 6000) * np.exp(-t / .35) * (.5 + .5 * rng.random(len(t))), .3)   # 긁는 소리
t = tt(2.8); add(9.0, sum(a * np.sin(2 * np.pi * f * t * (1 + .004 * np.sin(2 * np.pi * 3 * t))) for f, a in ((98, 1), (147, .6), (233, .4), (311, .25), (467, .15))) * np.exp(-t / .9) * np.minimum(1, t / .01), .4)  # 징
for k, f in enumerate([2600, 1800]): add(11.3 + k * .07, np.sin(2 * np.pi * f * tt(.04)) * np.exp(-tt(.04) / .008), .5)   # 탈깍
out *= np.clip((DUR - T) / .4, 0, 1); out /= np.abs(out).max() * 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
