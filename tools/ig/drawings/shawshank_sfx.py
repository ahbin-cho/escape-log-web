"""쇼생크탈출 릴스 소리(직접 합성). 시각은 templates/reel-shawshank.html 과 같다.
음높이가 있는 소리는 전자음처럼 들려서(춘화각 때 운영자 피드백) 잡음·타격음 위주로만 만든다.
교도소 웅웅거림이 깔리고, 복도 발소리(0.3·1.0·1.7초, 울림), 2.5초 철창 '철컹', 감방 물방울, 5.3초 큰 철문 '쾅'(뒤로 거의 정적),
6.4초 쇠사슬 잘그락, 7.7초 문 열리며 '후우웅' + 쿵, 9.8초 낮은 울림, 12.75초 탈깍.
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
def echo(s, delay=.11, n=4, decay=.45):
    o = np.zeros(len(s) + int(delay * n * SR), np.float32)
    for k in range(n + 1): o[int(k * delay * SR):int(k * delay * SR) + len(s)] += s * decay ** k
    return o
def step():
    t = tt(.22); return np.sin(2 * np.pi * 95 * (1 + .5 * np.exp(-t / .02)) * t) * np.exp(-t / .05) + .6 * noise(.22, 300, 2200) * np.exp(-t / .018)
def clank(d=.5, g=1.0):
    """쇠가 부딪히는 소리: 짧은 타격 잡음 + 금방 사그라지는 쇳소리(맞지 않는 배음 여러 개라 음높이로 들리지 않는다)"""
    t = tt(d); ring = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t / dc) for f, a, dc in ((523, .5, .12), (911, .6, .09), (1487, .5, .07), (2311, .4, .05), (3170, .3, .04)))
    return g * (noise(d, 400, 6000) * np.exp(-t / .012) * 1.4 + ring * np.minimum(1, t / .002))
def slam(d=1.6):
    t = tt(d); return np.sin(2 * np.pi * 48 * (1 + .6 * np.exp(-t / .06)) * t) * np.exp(-t / .5) + noise(d, 60, 900) * np.exp(-t / .12) * .9 + clank(d) * .5
quiet = np.where((T > 5.9) & (T < 7.6), .2, 1.0) * np.clip(T / .5, 0, 1)
out += .16 * band(rng.standard_normal(N).astype(np.float32), 50, 260) * (.7 + .3 * np.sin(2 * np.pi * .17 * T)) * quiet   # 웅웅
for t0, g in ((.3, .5), (1.0, .6), (1.7, .7)): add(t0, echo(step()), g)
add(2.5, echo(clank(.5), .09, 3, .4), .6)
for t0 in (3.4, 4.3, 4.9):                                                                  # 물방울(짧은 틱 + 울림)
    add(t0, echo(noise(.03, 1800, 5000) * np.exp(-tt(.03) / .006), .13, 3, .4), .35)
add(5.3, echo(slam(), .14, 3, .35), 1.2)
for t0 in np.arange(6.4, 7.1, .09): add(t0 + rng.uniform(0, .03), clank(.12, .25), .5)      # 쇠사슬 잘그락
d = 1.4; t = tt(d); add(7.6, noise(d, 200, 3500) * np.sin(np.pi * t / d) ** 2 * (t / d), .7)   # 문 열리는 바람
add(7.75, echo(slam(1.8), .16, 2, .3), 1.0)
t = tt(3.0); add(9.8, (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.5 * t)) * np.exp(-t / 1.1) * np.minimum(1, t / .02), .35)   # 낮은 울림
for k, f in enumerate([2600, 1800]): add(12.75 + k * .07, np.sin(2 * np.pi * f * tt(.04)) * np.exp(-tt(.04) / .008), .5)   # 탈깍
out *= np.clip((DUR - T) / .4, 0, 1); out /= np.abs(out).max()
out = np.tanh(out * 2.4) / np.tanh(2.4) / 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
