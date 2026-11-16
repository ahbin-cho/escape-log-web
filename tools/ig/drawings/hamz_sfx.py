"""햄즈 살찌우기 릴스 소리(직접 합성). 시각은 reel-hamz.html 과 같다.
초시계 째깍, 말풍선 뽁, 냠냠(씨앗 까먹는 소리), 통통해질 때 '뽀잉', 7.4초 승리 팡파르. 사용: python3 hamz_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 11.5; N = int(SR * DUR); out = np.zeros(N, np.float32); rng = np.random.default_rng(5)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def tt(d): return np.arange(int(d * SR)) / SR
def tone(d, f, dec, f1=None):
    t = tt(d); fr = f if f1 is None else np.linspace(f, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, t.shape)) / SR) * np.exp(-t / dec) * np.minimum(1, t / .004)
for k in range(1, 8): add(k, tone(.05, 3000, .01), .35)                                   # 초시계
for t0, w in [(.4, 'f'), (1.3, 'm'), (2.2, 'f'), (3.1, 'm'), (3.9, 'f'), (5.0, 'm'), (6.1, 'f'), (7.2, 'm'), (8.2, 'f'), (9.0, 'm')]:
    add(t0, tone(.09, 420 if w == 'f' else 640, .04, 640 if w == 'f' else 900), .5)        # 말풍선 뽁
for t0 in np.arange(3.95, 7.3, .19):                                                       # 냠냠(짧고 둥근 소리 두 겹)
    add(t0 + rng.uniform(0, .04), tone(.06, rng.uniform(220, 320), .02) + .4 * rng.standard_normal(int(.06 * SR)) * np.exp(-tt(.06) / .01), .45)
for t0 in (4.3, 5.4, 6.5): add(t0, tone(.35, 180, .18, 520), .6)                            # 뽀잉
for i, f in enumerate([523, 659, 784, 1047, 1319]): add(7.4 + i * .08, tone(1.2, f, .5) + .3 * tone(1.2, f * 2, .3), .3)   # 팡파르
add(7.4, rng.standard_normal(int(.3 * SR)) * np.exp(-tt(.3) / .05), .4)                   # 팡(폭죽)
for i, f in enumerate([784, 988, 1175]): add(9.7 + i * .1, tone(.6, f, .25), .25)          # 끝 칩
out /= np.abs(out).max() * 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
