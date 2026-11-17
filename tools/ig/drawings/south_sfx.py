"""경기남부 릴스 4편 소리를 직접 합성한다(녹음·남의 음원 없음). 시각은 south_reels.py 템플릿과 같다.
 bokdo : 엘리베이터 '띵'·문 열림, 형광등 윙·지직, 발소리 없는 정적 → 5.3초 뒤에서 비명(걸러 낸 잡음이 치솟음), 6.3초 낮은 울림
 sagwi : 시계 초침, 숨소리(이불 속), 바닥 긁는 소리, 4.7초 심장, 5.4초 숨 멎는 '쿵'
 scare : 밤바람·풀벌레, 엔진 식는 '틱', 깜빡이 경고음, 4.7초 쾅(사고 기억), 까마귀 같은 거친 울음
 kono  : 옆 부스에서 새는 둔탁한 반주, 네온 지직, 마이크 '삐-' 하울링(5.3초), 6.3초 낮은 울림
사용: python3 tools/ig/drawings/south_sfx.py bokdo|sagwi|scare|kono|nakhwa|mongyeom out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 10.2; MODE = sys.argv[1]
rng = np.random.default_rng({"bokdo": 3, "sagwi": 5, "scare": 7, "kono": 11, "nakhwa": 13, "mongyeom": 17}[MODE])
N = int(SR * DUR); T = np.arange(N) / SR; out = np.zeros(N, np.float32)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j > i: out[i:j] += g * s[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(d, lo, hi): return band(rng.standard_normal(int(d * SR)).astype(np.float32), lo, hi)
def tt(d): return np.arange(int(d * SR)) / SR
def boom(d, f0, g=1.0):
    t = tt(d); f = f0 * (1 + .6 * np.exp(-t / .08))
    return g * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d * .35)) + .5 * noise(d, 30, 400) * np.exp(-t / .12))
def tone(d, partials, decay):
    t = tt(d); return sum(a * np.sin(2 * np.pi * f * t) for f, a in partials) * np.exp(-t / decay) * np.minimum(1, t / .005)
def beat(f=48):
    s = np.zeros(int(.5 * SR), np.float32)
    for off, g in ((0, 1), (.18, .7)):
        t = tt(.16); k = g * np.sin(2 * np.pi * f * t) * np.exp(-t / .045) * np.minimum(1, t / .004); i = int(off * SR); s[i:i + len(k)] += k
    return s
def amb(lo, hi, g): return band(rng.standard_normal(N).astype(np.float32), lo, hi) * g
env = np.clip(T / .6, 0, 1) * np.clip((DUR - T) / 1.2, 0, 1)
title = lambda: (add(6.3, boom(2.6, 38, 1.3)), add(6.3, tone(3.0, ((98, .5), (147, .3), (196, .2)), 1.2), .6))
flick = lambda ts: [add(t0, .35 * noise(d, 1500, 9000) * (np.sin(2 * np.pi * 60 * tt(d)) > 0)) for t0, d in ts]

if MODE == "bokdo":
    out += (.1 * np.sin(2 * np.pi * 120 * T) + .05 * np.sin(2 * np.pi * 240 * T) + amb(60, 300, .25)) * env
    add(0, tone(1.5, ((1318, .5), (2636, .1)), .5), .5)                                       # 띵
    add(.15, noise(1.4, 200, 2500) * np.sin(np.pi * tt(1.4) / 1.4) * .35)                       # 문 열림
    add(1.5, boom(.5, 70, .6))
    flick(((2.38, .1), (3.7, .14), (4.6, .1), (5.2, .12)))
    t = 2.6
    while t < 5.2: add(t, beat(), .3 + .1 * (t - 2.6)); t += .9
    n = tt(1.4); f = 900 + 1400 * np.minimum(1, n / .25) - 300 * n                               # 비명(사람 목소리가 아니라 걸러 낸 잡음)
    scream = band(rng.standard_normal(len(n)).astype(np.float32), 600, 4200) * (1 + np.sin(2 * np.pi * f * n / 1000 * 6)) * .5
    scream *= np.minimum(1, n / .05) * np.exp(-n / .7)
    add(5.3, scream, 1.1); add(5.3, boom(1.0, 60, .9))
    title()
elif MODE == "sagwi":
    out += amb(80, 600, .18) * env
    for k in range(10): add(.3 + k, tone(.05, ((3200, .6), (4800, .2)), .01), .4)              # 초침
    for t0 in (1.0, 3.0, 5.0):                                                                  # 이불 속 숨소리
        add(t0, .5 * noise(1.4, 300, 2200) * np.sin(np.pi * tt(1.4) / 1.4) ** 2)
    for t0 in (2.2, 3.9):                                                                       # 바닥 긁는 소리
        add(t0, .35 * noise(.7, 1500, 6000) * (np.sin(2 * np.pi * 14 * tt(.7)) > .2) * np.sin(np.pi * tt(.7) / .7))
    t = 4.4
    while t < 6.2: add(t, beat(), .7); t += .62
    add(5.4, boom(1.6, 40, 1.4)); n2 = tt(1.3)
    add(5.4, .18 * (np.sin(2 * np.pi * 1661 * n2) + np.sin(2 * np.pi * 1760 * n2)) * np.exp(-n2 / .4))
    title()
elif MODE == "scare":
    # 스산한 바람: 낮게 우는 바람(공명하는 휘파람 음) + 웅- 하는 저음 + 세기가 천천히 오르내리는 돌풍. 높은 사각거림은 넣지 않는다(벌레 소리처럼 들림)
    gust = np.clip(.3 + .45 * np.sin(2 * np.pi * .07 * T + .5) + .25 * np.sin(2 * np.pi * .17 * T + 2), .08, 1.1)
    out += amb(40, 220, 1.3) * gust * env                                                          # 낮은 바람(웅-)
    wn = rng.standard_normal(N).astype(np.float32)
    for f0, q, g in ((310, 18, .9), (465, 26, .6), (620, 30, .35)):                                  # 우는 바람: 좁은 대역이 천천히 오르내림
        f = f0 * (1 + .18 * np.sin(2 * np.pi * .11 * T + f0) + .08 * np.sin(2 * np.pi * .31 * T))
        X = np.zeros(N, np.float32)
        for seg in range(0, N, SR // 10):                                                            # 0.1초 조각마다 중심 주파수를 옮겨 가며 걸러 낸다
            e = min(N, seg + SR // 10 + 2048); fc = float(f[seg])
            X[seg:e] += band(wn[seg:e], fc - fc / q, fc + fc / q)[: e - seg] * np.hanning(e - seg)
        out += X * gust ** 2 * env * g * 2.2
    out += amb(400, 1400, .25) * gust ** 3 * env                                                    # 바람이 귀를 스치는 숨소리
    add(.1, boom(2.2, 40, 1.0))
    n = tt(2.2); add(3.6, .8 * band(rng.standard_normal(len(n)).astype(np.float32), 150, 900) * np.sin(np.pi * n / 2.2) ** 2)   # 큰 돌풍이 지나가고
    out *= 3.0                                                                                       # 쾅이 커진 만큼 바람도 키운다(전체를 맞추면 바람이 너무 작아짐)
    eng = (np.sign(np.sin(2 * np.pi * 42 * T * (1 + .03 * np.sin(2 * np.pi * .7 * T)))) * .5 + np.sin(2 * np.pi * 84 * T) * .3).astype(np.float32)
    out += band(eng, 30, 400) * (T < 4.6) * np.clip(T / .5, 0, 1) * .5                            # 달리는 엔진 소리(쾅에서 끊김)
    out += amb(80, 600, .5) * (T < 4.6) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 3.6 * T)))          # 흙길 덜컹
    n = tt(.35); add(4.35, .9 * noise(.35, 900, 4000) * np.sin(np.pi * n / .35) * (1 + np.sin(2 * np.pi * 37 * n)))   # 끼이익(휘청)
    duck = 1 - .75 * np.exp(-((T - 5.0) / .5) ** 2) * (T > 4.6)                                    # 쾅 직후 바람을 잠깐 죽여 쾅이 묻히지 않게
    out *= duck.astype(np.float32)
    add(4.7, boom(1.8, 46, 3.2))                                                                     # 쾅(사고): 낮은 충격
    n = tt(.9); crash = noise(.9, 300, 9000) * np.exp(-n / .12) * 2.2                                # 차체가 찌그러지는 넓은 소리
    crash += tone(.9, ((210, .8), (533, .6), (1270, .4), (2890, .25)), .18) * 1.3                     # 금속 울림
    add(4.7, crash)
    for k in range(12): add(4.78 + rng.uniform(0, .5), tone(.12, ((rng.uniform(3000, 6500), .5),), .03), .35)   # 유리 조각
    t = 5.6
    while t < 8: add(t, beat(44), .35); t += 1.1
    title()
elif MODE == "nakhwa":
    out += amb(150, 1400, .7) * (.5 + .5 * np.sin(2 * np.pi * .11 * T) ** 2) * env                 # 옥상 바람
    out += amb(200, 900, .25) * env                                                               # 멀리 웅성거림
    for t0 in (.3, .9, 1.6, 2.4, 3.1, 3.9, 4.6, 5.2):                                              # 카메라 셔터(플래시와 같은 시각)
        add(t0, .5 * noise(.04, 2000, 9000) * np.exp(-tt(.04) / .008)); add(t0 + .05, .35 * noise(.03, 1500, 7000) * np.exp(-tt(.03) / .006))
    add(.1, boom(1.6, 50, 1.0))
    mel = [(1318, 1.9), (1175, 2.7), (988, 3.5), (880, 4.4), (784, 5.1), (659, 5.6)]                # 내려가는 오르골
    for f0, t0 in mel: add(t0, tone(1.6, ((f0, .5), (f0 * 2, .12), (f0 * 3, .05)), .6), .3)
    n = tt(1.0); add(5.6, .4 * noise(1.0, 300, 3000) * np.sin(np.pi * n) * np.linspace(1, .2, len(n)))   # 떨어지는 바람 소리
    title()
elif MODE == "mongyeom":
    out += (np.sin(2 * np.pi * 55 * T) * .12 + np.sin(2 * np.pi * 82.5 * T) * .08 + np.sin(2 * np.pi * 110.4 * T) * .05) * (1 + .3 * np.sin(2 * np.pi * .2 * T)) * env   # 꿈 같은 저음
    out += amb(2000, 6000, .04) * env
    for t0 in (1.2, 2.9, 4.4, 6.9, 8.5): add(t0, tone(.5, ((1180 + rng.uniform(-120, 120), .5),), .08), .35)   # 물방울(물 같은 바닥)
    add(.2, boom(2.0, 40, .9))
    for t0 in (3.38, 5.35):                                                                        # 그녀가 가까워질 때: 거꾸로 감기는 숨 + 쿵
        n = tt(.6); add(t0 - .6, .5 * noise(.6, 400, 3000) * (n / .6) ** 2); add(t0, boom(1.4, 44, 1.3))
    t = 5.6
    while t < 8: add(t, beat(), .5); t += .9
    title()
else:
    beatbed = np.zeros(N, np.float32)                                                            # 옆 부스에서 새는 반주(벽 너머라 낮은 소리만)
    for t0 in np.arange(.2, 10, .48):
        k = boom(.3, 60, .9); i = int(t0 * SR); beatbed[i:i + len(k)] += k[:max(0, N - i)]
    beatbed += .3 * band(np.sin(2 * np.pi * 110 * T * (1 + .02 * np.sin(2 * np.pi * .5 * T))).astype(np.float32) * (np.sin(2 * np.pi * 2.08 * T) > 0), 60, 300)
    out += band(beatbed, 40, 350) * env * .7
    out += (.06 * np.sin(2 * np.pi * 120 * T) + amb(3000, 7000, .05)) * env                     # 네온 윙
    flick(((2.0, .12), (2.65, .1), (3.7, .14), (5.1, .1)))
    add(.1, boom(1.6, 48, 1.0))
    n = tt(1.2); hw = np.sin(2 * np.pi * 2650 * n) * np.minimum(1, n / .5) * np.exp(-np.maximum(0, n - .9) / .08)   # 마이크 하울링
    add(5.3, .28 * hw)
    title()

out /= np.percentile(np.abs(out), 99.95); out = np.tanh(out * .95) * .89
with wave.open(sys.argv[2], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.stack([out, out], 1) * 32767).astype(np.int16).tobytes())
