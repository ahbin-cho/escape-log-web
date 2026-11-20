"""몽염 릴스 v2 소리(직접 합성). 시각은 templates/reel-mongyeom2.html 과 같다.
음높이 있는 소리·짧은 '틱'은 쓰지 않는다(운영자 피드백: 전자음·거슬림). 전부 길게 깔리는 잡음뿐:
낮게 깔리는 어둠(웅웅) + 숨결 같은 바람, 그녀가 가까워질 때마다(1.7·3.2초) 낮은 '후욱', 5.6초 암전은 거의 정적,
6.1초부터 손이 몰려오며 커지는 바람, 7.6초 낮은 쿵(길게 울림), 뒤로 잦아드는 바람.
사용: python3 mongyeom2_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 13.0; N = int(SR * DUR); T = np.arange(N) / SR; out = np.zeros(N, np.float32); rng = np.random.default_rng(7)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d, lo, hi): return band(rng.standard_normal(int(d * SR)).astype(np.float32), lo, hi)
def tt(d): return np.arange(int(d * SR)) / SR
quiet = np.where((T > 5.6) & (T < 6.1), .12, 1.0) * np.clip(T / .6, 0, 1)
breath = .45 + .55 * (.5 + .5 * np.sin(2 * np.pi * .27 * T - 1.2)) ** 2          # 느린 숨결처럼 오르내림
out += .30 * band(rng.standard_normal(N).astype(np.float32), 35, 160) * (.7 + .3 * np.sin(2 * np.pi * .11 * T)) * quiet   # 낮게 깔리는 어둠
out += .10 * band(rng.standard_normal(N).astype(np.float32), 300, 900) * breath * quiet                                  # 숨결 같은 바람
def whoosh(d=.7, lo=60, hi=500):
    t = tt(d); return noise(d, lo, hi) * np.sin(np.pi * t / d) ** 2
add(1.45, whoosh(.7), .7); add(2.9, whoosh(.8), .9)                               # 그녀가 가까워진다
t = tt(1.5); add(6.1, noise(1.5, 120, 2200) * (t / 1.5) ** 2.2, .9)               # 손이 몰려온다: 점점 커지는 바람
t = tt(2.6); add(7.6, noise(2.6, 28, 110) * np.exp(-t / .55) * np.minimum(1, t / .004), 2.6)   # 낮은 쿵(잡음으로, 길게)
t = tt(1.2); add(7.6, noise(1.2, 150, 1800) * np.exp(-t / .22), .8)
t = tt(3.0); add(9.3, noise(3.0, 200, 700) * np.sin(np.pi * t / 3.0) ** 2, .25)   # 제목: 길게 스치는 바람
out *= np.clip((DUR - T) / .8, 0, 1); out /= np.abs(out).max()
out = np.tanh(out * 2.4) / np.tanh(2.4) / 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
