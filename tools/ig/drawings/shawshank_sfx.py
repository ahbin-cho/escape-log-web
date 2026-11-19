"""쇼생크탈출 릴스 소리(직접 합성). 시각은 templates/reel-shawshank.html 과 같다.
무겁고 어둡게(운영자 피드백 11/19: 처음 것은 너무 경쾌했다 → 물방울·쇠사슬·밝은 쇳소리를 빼고 낮은 소리 위주로, 전체 고음도 깎았다).
음높이가 또렷한 소리는 전자음처럼 들려서 쓰지 않는다(춘화각 때 피드백).
낮은 웅웅거림이 깔리고, 점점 빨라지는 심장 박동(0.4~5.2초), 느리고 묵직한 발소리(0.5·1.6초), 2.5초 둔한 철문 '덜컹',
5.3초 큰 철문 '쾅'(뒤로 정적, 숨죽인 바람만), 7.7초 문 열리는 낮은 바람 + 쿵, 9.8초 긴 낮은 울림, 12.75초 탈깍(낮게).
사용: python3 shawshank_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 13.5; N = int(SR * DUR); T = np.arange(N) / SR; out = np.zeros(N, np.float32); rng = np.random.default_rng(21)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d, lo, hi): return band(rng.standard_normal(int(d * SR)).astype(np.float32), lo, hi)
def tt(d): return np.arange(int(d * SR)) / SR
def echo(s, delay=.19, n=3, decay=.4):
    o = np.zeros(len(s) + int(delay * n * SR), np.float32)
    for k in range(n + 1): o[int(k * delay * SR):int(k * delay * SR) + len(s)] += s * decay ** k
    return o
def thump(f=55, d=.5, dec=.12):
    t = tt(d); return np.sin(2 * np.pi * f * (1 + .4 * np.exp(-t / .03)) * t) * np.exp(-t / dec) * np.minimum(1, t / .004)
def step():
    return thump(62, .4, .09) + .35 * noise(.4, 120, 700) * np.exp(-tt(.4) / .04)
def slam(d=2.2):
    t = tt(d)
    low = np.sin(2 * np.pi * 40 * (1 + .7 * np.exp(-t / .07)) * t) * np.exp(-t / .7)
    body = noise(d, 50, 500) * np.exp(-t / .22)
    metal = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / dc) for f, a, dc in ((137, .5, .5), (211, .4, .4), (331, .3, .3)))   # 낮고 탁한 쇠 울림
    return low + body * .9 + metal * .5
quiet = np.where((T > 6.0) & (T < 7.5), .25, 1.0) * np.clip(T / .8, 0, 1)
out += .22 * band(rng.standard_normal(N).astype(np.float32), 35, 140) * (.75 + .25 * np.sin(2 * np.pi * .11 * T)) * quiet   # 낮은 웅웅
out += .05 * band(rng.standard_normal(N).astype(np.float32), 150, 420) * (.5 + .5 * np.sin(2 * np.pi * .23 * T + 1)) ** 2 * quiet   # 먼 바람
# 심장 박동: 쿵-쿵, 간격이 1.0초에서 0.55초로 좁아지며 긴장을 올린다
t0 = .4; gap = 1.0
while t0 < 5.2:
    add(t0, thump(52, .35, .08), .5); add(t0 + .17, thump(46, .3, .07), .32)
    t0 += gap; gap = max(.55, gap * .9)
for t1, g in ((.5, .5), (1.6, .6)): add(t1, echo(step()), g)
add(2.5, echo(slam(1.2), .2, 2, .35), .5)
add(5.3, echo(slam(), .22, 3, .4), 1.3)
d = 1.6; t = tt(d); add(7.5, noise(d, 80, 600) * np.sin(np.pi * t / d) ** 2 * (t / d), .8)   # 문 열리는 낮은 바람
add(7.75, echo(slam(2.0), .24, 2, .3), .9)
t = tt(3.4); add(9.8, (np.sin(2 * np.pi * 41 * t) + .6 * np.sin(2 * np.pi * 61.5 * t) + .3 * np.sin(2 * np.pi * 82 * t)) * np.exp(-t / 1.4) * np.minimum(1, t / .05), .5)   # 긴 낮은 울림
t = tt(.06); add(12.75, np.sin(2 * np.pi * 900 * t) * np.exp(-t / .012), .35); add(12.83, thump(120, .15, .03), .4)   # 탈깍(낮게)
out = band(out, 25, 3200)                                                    # 고음을 깎아 어둡게
out *= np.clip((DUR - T) / .5, 0, 1); out /= np.abs(out).max()
out = np.tanh(out * 2.2) / np.tanh(2.2) / 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out.astype(np.float32) * 32767).astype(np.int16).tobytes())
