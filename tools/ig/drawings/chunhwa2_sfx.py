"""춘화각 릴스 v2 소리(직접 합성, 오래된 한옥 느낌). 시각은 templates/reel-chunhwa2.html 과 같다.
틈새 바람·문풍지 떨림이 깔리고, 마루 밟는 소리(0.3·0.9·1.4초), 처마 풍경, 2.0초 나무 문 끼이익, 방 안에서 오래된 나무 '딱',
5.5초 촛불 훅(뒤로 거의 정적, 마루만 삐걱 6.3·6.75초), 7.2초 나무 문 쾅 + 창호 덜컹, 9.0초 징, 11.3초 탈깍.
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
def creak(d, f0, f1, res=None, rough=.35):
    """나무 끼익: 높고 가는 소리(수백 Hz, 배음 많음)가 떨리면서 미끄러진다. 낮은 톡톡이(100Hz 아래)로 만들면 트림 소리처럼 들려서 바꿨다(운영자 피드백)."""
    n = int(d * SR); t = np.arange(n) / SR
    wob = np.cumsum(rng.standard_normal(n)) ; wob = wob / (np.abs(wob).max() + 1e-9)          # 느리게 흔들리는 음높이
    f = (f0 + (f1 - f0) * t / d) * (1 + .06 * rough / .35 * wob + .015 * np.sin(2 * np.pi * 23 * t))
    ph = np.cumsum(f) / SR
    saw = sum(np.sin(2 * np.pi * k * ph) / k for k in range(1, 9))                             # 배음이 많은 톱니
    grit = 1 - .35 * (rng.random(n) < .002).astype(np.float32)                                 # 가끔 걸리는 느낌
    s = band((saw * grit).astype(np.float32), 450, 5000)
    return s * np.sin(np.pi * t / d) ** 1.2 * (.75 + .25 * np.sin(2 * np.pi * 11 * t + 1))
def thud(f=85, d=.35, wood=True):
    t = tt(d); s = np.sin(2 * np.pi * f * (1 + .5 * np.exp(-t / .03)) * t) * np.exp(-t / .07) + .5 * noise(d, 150, 900) * np.exp(-t / .025)
    if wood: s += .35 * sum(np.sin(2 * np.pi * r * t) for r in (310, 520)) * np.exp(-t / .04)
    return s
def chime(g=1.0):
    t = tt(1.6); return g * sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dc) for f, a, dc in ((1318, 1, .7), (2105, .5, .45), (3170, .3, .3), (4410, .12, .2))) * np.minimum(1, t / .003)
# 깔리는 소리: 낮은 바람 + 틈새로 새는 가는 바람 + 문풍지 떨림(바람이 셀 때만)
gust = .35 + .65 * (.5 + .5 * np.sin(2 * np.pi * .19 * T + .8)) ** 2 * (.7 + .3 * np.sin(2 * np.pi * .53 * T))   # 바람이 완전히 끊기지는 않게
quiet = np.where((T > 5.6) & (T < 7.15), .15, 1.0) * np.clip(T / .5, 0, 1)
out += .20 * band(rng.standard_normal(N).astype(np.float32), 70, 380) * gust * quiet
out += .05 * band(rng.standard_normal(N).astype(np.float32), 650, 1100) * gust ** 2 * quiet
out += .05 * band(rng.standard_normal(N).astype(np.float32), 1800, 5200) * np.clip(gust - .55, 0, 1) * 2 * (.5 + .5 * np.sign(np.sin(2 * np.pi * 31 * T + 3 * np.sin(2 * np.pi * 2.3 * T)))) * quiet
# 복도: 마루 밟는 소리 + 밟을 때마다 삐걱, 멀리 처마 풍경
for t0, g in ((.3, .5), (.9, .6), (1.4, .7)):
    add(t0, thud(80 + 10 * rng.random()), g); add(t0 + .05, creak(.16, 620 + 80 * rng.random(), 760), .05 * g / .5)
add(.6, chime(), .06); add(4.5, chime(), .035)
# 문: 길게 끼이익(높아졌다 낮아짐), 끝에 문짝이 벽에 닿는 '툭'
add(2.0, creak(.6, 420, 780), .16); add(2.55, creak(.55, 760, 520), .14); add(3.08, thud(110, .2), .3)
# 방 안: 오래된 나무가 '딱'
add(3.7, thud(240, .12), .22); add(5.1, thud(200, .1), .15)
add(5.5, noise(.35, 300, 2500) * np.exp(-tt(.35) / .07), .6)                       # 촛불 훅
add(6.3, creak(.22, 680, 820), .07); add(6.75, creak(.3, 720, 900), .11)                 # 정적 속에서 마루만 삐걱(가까워짐)
# 코앞: 나무 문 쾅 + 창호 덜컹덜컹
add(7.2, thud(52, 1.4), 1.3); add(7.2, noise(.25, 200, 3000) * np.exp(-tt(.25) / .03), .7)
for k in range(7): add(7.32 + k * .075, thud(170 + 30 * rng.random(), .09) + .4 * noise(.09, 1500, 5000) * np.exp(-tt(.09) / .012), .35 * .8 ** k)
t = tt(2.8); add(9.0, sum(a * np.sin(2 * np.pi * f * t * (1 + .004 * np.sin(2 * np.pi * 3 * t))) for f, a in ((98, 1), (147, .6), (233, .4), (311, .25), (467, .15))) * np.exp(-t / .9) * np.minimum(1, t / .01), .32)  # 징
add(10.3, chime(), .04)
for k, f in enumerate([2600, 1800]): add(11.3 + k * .07, np.sin(2 * np.pi * f * tt(.04)) * np.exp(-tt(.04) / .008), .5)   # 탈깍
out *= np.clip((DUR - T) / .4, 0, 1); out /= np.abs(out).max()
out = np.tanh(out * 2.6) / np.tanh(2.6) / 1.1   # 작은 소리(바람·삐걱)를 끌어올린다: 폰 스피커에서도 들리게
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
