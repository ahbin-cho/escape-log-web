"""셜록홈즈 모란 짤 릴스 소리(직접 합성). 말풍선 뽁 3번, 짤 구간 환호·박수, 카드 등장 휙, 끝 '탈깍'+칩.
사용: python3 moran_meme_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 11.0; N = int(SR * DUR); out = np.zeros(N, np.float32); rng = np.random.default_rng(7)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def tt(d): return np.arange(int(d * SR)) / SR
def tone(d, f, dec, f1=None):
    t = tt(d); fr = f if f1 is None else np.linspace(f, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, t.shape)) / SR) * np.exp(-t / dec) * np.minimum(1, t / .004)
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x)).astype(np.float32)
for t0, f, f1 in [(.3, 420, 640), (1.4, 420, 640), (2.5, 640, 900)]: add(t0, tone(.09, f, .04, f1), .5)   # 말풍선 뽁
# 짤 구간: 와아(띠 잡음, 커졌다 줄어듦) + 박수
d = 3.6; env = np.minimum(1, tt(d) / .25) * np.minimum(1, (d - tt(d)) / .6)
add(3.55, band(rng.standard_normal(len(env)), 500, 2500) * env, .9)
for t0 in np.sort(rng.uniform(3.6, 7.0, 70)):
    add(t0, band(rng.standard_normal(int(.03 * SR)), 900, 5000) * np.exp(-tt(.03) / .006), .5)
add(3.5, tone(.3, 300, .15, 900), .4)                                       # 짤 등장 뿅
add(7.25, band(rng.standard_normal(int(.35 * SR)), 300, 3000) * np.sin(np.pi * tt(.35) / .35), .5)   # 카드 휙
for k, f in enumerate([2600, 1800]): add(9.6 + k * .07, tone(.04, f, .008), .7)   # 탈깍
for i, f in enumerate([784, 988, 1175]): add(9.8 + i * .09, tone(.5, f, .2), .25)  # 끝 칩
out /= np.abs(out).max() * 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
