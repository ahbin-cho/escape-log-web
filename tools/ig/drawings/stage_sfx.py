"""이머시브 '무대 영상' 스토리 소리를 직접 합성한다(녹음·남의 음원 없음). 시각은 imm-story-motion.html 과 같다.
0초 객석 웅성임이 잦아들고 조명 '탁' → 0.6초 의자 삐걱(누군가 자리를 떴다) → 3.8~7초 나무 무대 위 발소리
→ 8초 막이 젖혀지는 '촤악' → 내내 낮은 현악 같은 울림 → 10.6초 종 '딩-' → 10.8초부터 객석 박수(커졌다가 잦아듦)
사용: python3 tools/ig/drawings/stage_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 13.5
rng = np.random.default_rng(21)
N = int(SR * DUR); T = np.arange(N) / SR; out = np.zeros(N, np.float32)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d, lo, hi): return band(rng.standard_normal(int(d * SR)).astype(np.float32), lo, hi)
def tt(d): return np.arange(int(d * SR)) / SR
# 객석 웅성임: 말소리 대역 잡음을 음절처럼 출렁이게, 0.8초 동안 잦아든다
mur = band(rng.standard_normal(N).astype(np.float32), 250, 1800)
syl = band(rng.standard_normal(N).astype(np.float32), 2, 7); syl = 0.5 + 0.5 * syl / (np.abs(syl).max() + 1e-6)
out += mur * syl * np.clip(1 - T / 0.9, 0, 1) * 0.7
# 낮은 현악 울림(D2·A2, 천천히 커짐), 끝으로 갈수록 잦아든다
drone = sum(a * np.sin(2 * np.pi * f * T + p) for f, a, p in ((73.4, .2, 0), (110, .14, 1), (146.8, .07, 2), (220.5, .04, .5)))
drone *= (1 + .15 * np.sin(2 * np.pi * 5.2 * T))                     # 현의 떨림
out += drone * np.clip((T - .3) / 2.5, 0, 1) * np.clip((DUR - T) / 1.5, 0, 1) * .9
# 조명이 켜지는 '탁'
add(.25, noise(.15, 300, 4000) * np.exp(-tt(.15) / .015) + .6 * np.sin(2 * np.pi * 90 * tt(.15)) * np.exp(-tt(.15) / .04), .9)
# 의자 삐걱(누군가 자리를 떴다)
tc = tt(.7); f = 520 + 220 * np.sin(2 * np.pi * 2.1 * tc)
creak = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (.6 + .4 * rng.random(len(tc)))
add(.6, .1 * band(creak.astype(np.float32), 250, 3500) * np.sin(np.pi * tc / .7))
# 나무 무대 발소리(울림 있게) 3.8~7.2초
t = 3.85; k = 0
while t < 7.2:
    st = np.sin(2 * np.pi * 120 * tt(.14)) * np.exp(-tt(.14) / .03) + .5 * noise(.14, 600, 3000) * np.exp(-tt(.14) / .015)
    e = np.zeros(int(.5 * SR), np.float32); e[:len(st)] += st
    for dly, g in ((.09, .3), (.19, .15)): i = int(dly * SR); e[i:i + len(st)] += g * st
    add(t, e, .55 if k % 2 else .45); t += .5; k += 1
# 막이 젖혀지는 소리
add(7.9, .5 * noise(.8, 300, 5000) * np.sin(np.pi * tt(.8) / .8) ** 1.5)
# 공연 시작 종
add(10.6, sum(a * np.sin(2 * np.pi * f * tt(2.8)) for f, a in ((880, .5), (1760, .2), (2637, .08))) * np.exp(-tt(2.8) / .9) * np.minimum(1, tt(2.8) / .004), .35)
# 박수: 수백 번의 짧은 손뼉(사람마다 손 크기가 달라 음색이 조금씩 다름), 빠르게 커졌다가 끝에서 잦아든다
for _ in range(900):
    t0 = 10.8 + rng.gamma(2.2, .55)
    if t0 > DUR - .05: continue
    lo = rng.uniform(600, 1400); hi = lo * rng.uniform(3, 5)
    cl = noise(.03, lo, hi) * np.exp(-tt(.03) / rng.uniform(.004, .008))
    g = rng.uniform(.25, .6) * min(1, (t0 - 10.8) / .5) * min(1, (DUR - t0) / 1.2)
    add(t0, cl, g)
out /= np.percentile(np.abs(out), 99.95); out = np.tanh(out * .95) * .89
with wave.open(sys.argv[1], 'wb') as fo:
    fo.setnchannels(2); fo.setsampwidth(2); fo.setframerate(SR); fo.writeframes((np.stack([out, out], 1) * 32767).astype(np.int16).tobytes())
