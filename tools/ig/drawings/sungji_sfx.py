"""성지기숙학원 릴스(포스터 분위기 버전) 소리를 직접 합성한다(녹음·남의 음원 없음).
낮게 깔리는 울림 + 바람 같은 잡음, 시작 '쿵'과 긁는 고음, 1.6초부터 심장 소리(점점 빨라짐),
글줄이 나올 때 작은 '틱', 화면이 깜빡일 때 지직, '깨어났다'에서 큰 '쿵', 끝으로 갈수록 잦아든다.
템플릿(reel-sungji.html)의 시각에 맞췄다. 사용: python3 tools/ig/drawings/sungji_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 10.0
rng = np.random.default_rng(37)
N = int(SR * DUR); T = np.arange(N) / SR
out = np.zeros(N, np.float32)

def add(t0, sig, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if j > i: out[i:j] += g * sig[:j - i]

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)

def boom(d=1.6, f0=52, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-t / 0.08))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d * 0.35))
    s += 0.5 * band(rng.standard_normal(n).astype(np.float32), 30, 400) * np.exp(-t / 0.12)
    return g * s

def beat():
    """심장 '쿵-쿵'(두 번)"""
    def one(n=0.16):
        k = int(n * SR); t = np.arange(k) / SR
        return np.sin(2 * np.pi * 48 * t) * np.exp(-t / 0.045) * np.minimum(1, t / 0.004)
    a = one(); b = 0.7 * one(); s = np.zeros(int(0.5 * SR), np.float32)
    s[:len(a)] += a; s[int(0.18 * SR):int(0.18 * SR) + len(b)] += b
    return s

# 바닥: 낮은 울림 두 개(맥놀이) + 걸러진 바람 잡음. 0.15초에 페이드인, 끝 1.2초 페이드아웃
drone = 0.22 * np.sin(2 * np.pi * 55 * T) + 0.18 * np.sin(2 * np.pi * 58.3 * T) + 0.08 * np.sin(2 * np.pi * 110.7 * T)
wind = band(rng.standard_normal(N).astype(np.float32), 180, 900)
wind *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * T + 1) ** 2
env = np.clip(T / 0.8, 0, 1) * np.clip((DUR - T) / 1.2, 0, 1)
out += (drone + 0.9 * wind) * env * 0.55
# 0.15초: 쿵 + 긁는 고음(어긋난 두 음)
add(0.15, boom(2.0, 46, 1.4))
n = int(1.3 * SR); t = np.arange(n) / SR
scr = (np.sin(2 * np.pi * 1870 * t) + np.sin(2 * np.pi * 1985 * t)) * np.sin(np.pi * t / 1.3) ** 2
add(0.2, 0.06 * scr * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)))
# 1.45초: 후킹 문구가 사라질 때 숨 들이쉬는 바람
n = int(0.5 * SR); t = np.arange(n) / SR
add(1.4, 0.5 * band(rng.standard_normal(n).astype(np.float32), 400, 3000) * np.sin(np.pi * t / 0.5) ** 2)
# 1.6초부터 심장 소리, 점점 빨라지고 커짐
t = 1.65
while t < 8.6:
    k = (t - 1.65) / 7
    add(t, beat(), 0.55 + 0.5 * k)
    t += 0.95 - 0.35 * k
# 글줄이 나올 때 작은 '틱'(낮은 나무 소리)
for tt in (1.9, 2.8, 3.7, 4.7):
    n = int(0.08 * SR); t = np.arange(n) / SR
    add(tt, 0.35 * band(rng.standard_normal(n).astype(np.float32), 600, 2500) * np.exp(-t / 0.012))
# 화면 깜빡임(3.55, 5.35초): 지직
for tt, d in ((3.55, .22), (5.35, .3)):
    n = int(d * SR); t = np.arange(n) / SR
    add(tt, 0.35 * band(rng.standard_normal(n).astype(np.float32), 1500, 9000) * (np.sin(2 * np.pi * 60 * t) > 0))
# 5.5초 '깨어났다': 큰 쿵
add(5.5, boom(2.4, 40, 1.8))
# 6.3초 제목: 낮은 종소리 한 번
n = int(3.0 * SR); t = np.arange(n) / SR
bell = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((196, .5), (393, .25), (588, .15), (788, .08))) * np.exp(-t / 1.1)
add(6.3, 0.35 * bell)

out /= np.percentile(np.abs(out), 99.95); out = np.tanh(out * 0.95) * 0.89
st = np.stack([out, out], 1)
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
