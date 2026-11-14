"""영수증 릴스 효과음을 직접 합성한다(녹음·남의 음원 없음): 종이 나오는 소리, 줄마다 감열 프린터 소리, 도장 '쿵', 펜 긁는 소리.
사용: python3 tools/ig/drawings/receipt_sfx.py out.wav"""
import sys, wave
import numpy as np
SR = 44100; DUR = 13.5
rng = np.random.default_rng(7)
out = np.zeros(int(SR * DUR), np.float32)

def add(t0, sig):
    i = int(t0 * SR); j = min(len(out), i + len(sig)); out[i:j] += sig[:j - i]

def lowpass(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); return (c[k:] - c[:-k]) / k

def printer(d):
    """감열 프린터: 스텝 모터가 종이를 조금씩 미는 '드르륵' + 헤드 소음"""
    n = int(d * SR); t = np.arange(n) / SR
    step = (np.sin(2 * np.pi * 92 * t) > 0.2).astype(np.float32)           # 초당 92번 종이 이송
    tone = 0.5 * np.sin(2 * np.pi * 2300 * t) + 0.3 * np.sin(2 * np.pi * 4600 * t)   # 얇고 높은 소리(운영자 요청)
    hiss = rng.standard_normal(n).astype(np.float32); hiss = hiss - np.pad(lowpass(hiss, 3), (0, 2))
    env = np.minimum(1, np.minimum(t / 0.01, (d - t) / 0.03))
    return (0.05 * tone * step + 0.05 * hiss * (0.3 + 0.7 * step)) * env

# 종이가 내려온다(1.0~2.0초): 쓸리는 소리
n = int(1.0 * SR); t = np.arange(n) / SR
w = rng.standard_normal(n).astype(np.float32); w = np.pad(lowpass(w, 40), (0, 39)) * 6
add(1.0, 0.09 * w * np.sin(np.pi * t / 1.0) ** 2)
# 줄이 찍히는 순간들(템플릿의 줄 시각 + 0.6초)
for lt, d in ((1, .30), (1.5, .22), (2.0, .22), (2.4, .12), (2.9, .34), (3.5, .30), (3.9, .12), (4.5, .34), (5.3, .34), (5.8, .12), (6.4, .42), (7.0, .12), (7.5, .30), (8.1, .30)):
    add(lt + 0.6 - 0.05, printer(d))
# 종이 끊는 '찍'(8.95초)
n = int(0.12 * SR); t = np.arange(n) / SR
add(8.95, 0.12 * rng.standard_normal(n).astype(np.float32) * np.exp(-t * 40))
# 도장 '쿵'(9.2초 뒤 0.18초에 닿는다)
n = int(0.9 * SR); t = np.arange(n) / SR
thud = 1.6 * np.sin(2 * np.pi * (110 * np.exp(-t * 8) + 48) * t) * np.exp(-t * 6.5)          # 크고 묵직하게
body = 0.7 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 18)
click = 0.9 * rng.standard_normal(n).astype(np.float32) * np.exp(-t * 70)
add(9.36, (thud + body + click).astype(np.float32))
# 펜 긁는 소리(10.3~11.5초): 글자마다 끊기는 긁힘
n = int(1.2 * SR); t = np.arange(n) / SR
sc = rng.standard_normal(n).astype(np.float32); sc = sc - np.pad(lowpass(sc, 5), (0, 4))
stroke = (np.sin(2 * np.pi * 9 * t) > -0.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
add(10.3, (0.06 * sc * stroke).astype(np.float32))
out = np.tanh(out * 1.1) * 0.95
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(np.repeat(pcm, 2).tobytes())
print('ok')
