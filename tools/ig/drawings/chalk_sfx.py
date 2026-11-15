"""성지기숙학원 릴스(칠판 분필) 효과음을 직접 합성한다(녹음·남의 음원 없음).
분필로 쓰는 '사각사각'(글자마다 획 몇 개), 첫 획의 '톡', 가끔 '끽', 칠판지우개 '쓱', 밑줄 한 번에 긋기.
템플릿(reel-sungji.html)의 글자 등장 시각에 맞췄다. 배경음(있으면)은 줄여서 깐다.
사용: python3 tools/ig/drawings/chalk_sfx.py out.wav [배경음.wav]"""
import sys, wave
import numpy as np
SR = 44100; DUR = 10.0
rng = np.random.default_rng(11)
out = np.zeros(int(SR * DUR), np.float32)

def add(t0, sig, g=1.0):
    i = int(t0 * SR); j = min(len(out), i + len(sig))
    if j > i: out[i:j] += g * sig[:j - i]

def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)

def stroke(d, bright=1.0):
    """분필 한 획: 거친 마찰음. 분필이 칠판 결에 걸려 생기는 빠른 떨림(약 40~70Hz)으로 '사각'거린다"""
    n = int(d * SR); t = np.arange(n) / SR
    noise = bandpass(rng.standard_normal(n).astype(np.float32), 1800, 7500 * bright)
    grit = (np.sin(2 * np.pi * rng.uniform(38, 70) * t + rng.uniform(0, 6)) > rng.uniform(-.2, .4)).astype(np.float32)
    grit = 0.35 + 0.65 * grit * (0.6 + 0.4 * rng.random(n).astype(np.float32))
    env = np.minimum(1, np.minimum(t / 0.012, (d - t) / 0.03)) ** 1.2
    press = 0.7 + 0.3 * np.sin(np.pi * t / d)
    return noise * grit * env * press

def tap():
    """분필이 칠판에 닿는 '톡'"""
    n = int(0.05 * SR); t = np.arange(n) / SR
    click = bandpass(rng.standard_normal(n).astype(np.float32), 900, 5000) * np.exp(-t / 0.006)
    return click + 0.4 * np.sin(2 * np.pi * 1300 * t) * np.exp(-t / 0.01)

def squeak(d):
    """가끔 나는 '끽'(높은 음이 조금 흔들림)"""
    n = int(d * SR); t = np.arange(n) / SR
    f = 2600 + 220 * np.sin(2 * np.pi * 9 * t)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return 0.25 * s * np.sin(np.pi * t / d) ** 2

def write(t0, dur, chars):
    """글자 수만큼 획을 나눠 쓴다(글자마다 2~4획, 획 사이 짧은 틈)"""
    add(t0, tap(), 0.5)
    per = dur / max(1, chars); t = t0
    for c in range(chars):
        k = int(rng.integers(2, 5)); slot = per / k
        for _ in range(k):
            d = slot * rng.uniform(.55, .85)
            add(t + rng.uniform(0, slot - d), stroke(d, rng.uniform(.85, 1)), rng.uniform(1.3, 1.9))
            t += slot
    if rng.random() < 0.5:
        add(t0 + dur * rng.uniform(.3, .7), squeak(rng.uniform(.06, .1)))

# 0~1.4초: 후킹 문구가 이미 칠판에 있다 → 조용히. 1.45초: 지우개로 '쓱'
n = int(0.5 * SR); t = np.arange(n) / SR
add(1.45, 0.45 * bandpass(rng.standard_normal(n).astype(np.float32), 250, 2500) * np.sin(np.pi * t / 0.5) ** 1.5)
# 글자 쓰기(템플릿의 --t, --d, 글자 수)
for t0, d, chars in ((1.9, .8, 5), (2.8, .8, 5), (3.7, .8, 5), (4.7, 1.2, 13), (5.5, .6, 4)):
    write(t0, d, chars)
# 밑줄: 6.1초에 한 번에 길게
add(6.1, tap(), 0.6); add(6.12, stroke(0.45, 1.0), 1.4)

out /= max(1e-6, np.percentile(np.abs(out), 99.9)); out *= 0.7  # 효과음을 크게(튀는 몇 샘플은 아래에서 자름)
if len(sys.argv) > 2:                                   # 배경음은 낮게(-9 dB) 깔기
    w = wave.open(sys.argv[2]); bg = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2: bg = bg.reshape(-1, 2).mean(1)
    bg = bg[:len(out)]; out[:len(bg)] += 0.45 * bg
out = np.tanh(out * 1.1) / np.tanh(1.1)   # 부드럽게 눌러 찢어지지 않게
st = np.stack([out, out], 1)
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((st * 32767).astype(np.int16).tobytes())
