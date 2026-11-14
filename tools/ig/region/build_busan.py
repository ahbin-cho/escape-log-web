"""부산편 — 화면을 꽉 채우는 수채 그림(운영자 제미나이) + 아래 작은 포스터 카드 2×2. 대구편(build_daegu2)과 같은 카드.
그림 속 유령이 카드에 가리지 않게 장마다 그림을 위로 올리고(shift), 아래는 그림 끝 색으로 채운다.
사용: python3 tools/ig/region/build_busan.py tools/ig/region/busan.json <posters map.json>"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import build_daegu2 as B
from PIL import Image

T = B.T; A = os.path.join(os.path.dirname(__file__), "..", "assets")
B.SHORT.update({"플레이포인트랩 해운대 블루오션스테이션": "플레이포인트랩 해운대", "플레이포인트랩 성야학원(부산)": "플레이포인트랩 성야학원",
    "플레이포인트랩 서면탄탄스트리트점": "플레이포인트랩 서면탄탄", "플레이포인트랩 부산서면오리진점": "플레이포인트랩 서면오리진",
    "비트포비아 서면던전 레드(부산)": "비트포비아 서면 레드", "비트포비아 서면던전(부산)": "비트포비아 서면던전",
    "서울이스케이프룸 부산 서면점": "서울이스케이프룸 서면", "파노라마 부산점": "파노라마 부산 대연동"})

def band(art):
    im = Image.open(os.path.join(A, art)).convert("RGB"); w, h = im.size
    r, g, b = im.crop((0, h - 30, w, h)).resize((1, 1)).getpixel((0, 0))
    k = 0.55
    return "#%02X%02X%02X" % (int(r * k), int(g * k), int(b * k))

# key, 그림, 위로 올리는 px, 강조색, 칩, 제목
PAGES = [
 ("fear", "bs-fear.jpg", 30, "#E2554A", "😱 쫄깃한 맛", "쫄깃한 거 <span style='color:#FFB4A8'>좋아하나?</span>", "공포·호러 장르만"),
 ("calm", "bs-calm.jpg", 90, "#3E9A6A", "🌿 안 무서븐 맛", "무서븐 건 <span style='color:#A8F0C8'>싫나?</span>", "판타지·코믹·어드벤처"),
 ("first", "bs-first.jpg", 295, "#D9771C", "🐣 입문", "방탈출 <span style='color:#FFD27A'>처음이가?</span>", "매장이 쉽다고 적어 둔 방"),
 ("story", "bs-story.jpg", 135, "#7A68C2", "📖 이야기 맛집", "이야기 <span style='color:#E0D4FF'>좋아하제?</span>", "드라마·스토리"),
]
TS = "-webkit-text-stroke:9px #1D1D1D;paint-order:stroke fill"

def page(H, art, shift, inner):
    bc = band(art)
    return (B.HEAD % H) + f'''<div style="position:absolute;inset:0;background:{bc}"></div>
<img src="../assets/{art}" style="position:absolute;left:0;top:{-shift}px;width:1080px;height:1340px">
<div style="position:absolute;left:0;right:0;top:0;height:380px;background:linear-gradient(rgba(18,14,34,.72),rgba(18,14,34,0))"></div>
<div style="position:absolute;left:0;right:0;top:{1340 - shift - 160}px;height:160px;background:linear-gradient(rgba(0,0,0,0),{bc})"></div>''' + inner + "</body></html>"

def main(cfg, posters):
    c = json.load(open(cfg)); B.POSTERS.update(json.load(open(posters))); S = c["sections"]; chk = c["checked_on"]
    note = f"📍 부산 서면·해운대 · 매장 공식 페이지 기준({chk} 확인)"
    toc = "".join(f'<div style="background:#FFFBF2;border:3px solid #3A2E28;border-radius:14px;padding:9px 16px;font-weight:800;font-size:23px;box-shadow:3px 3px 0 #3A2E28">{x}</div>'
                  for x in ["2 😱 쫄깃한 거 좋아하나?", "3 🌿 무서븐 건 싫나?", "4 🐣 방탈출 처음이가?", "5 📖 이야기 좋아하제?"])
    # 표지(위·아래 빈 띠가 있는 그림)
    s1 = (B.HEAD % 1350) + f'''<div style="position:absolute;inset:0;background:#EAD6C4"></div>
<img src="../assets/bs-cover.jpg" style="position:absolute;left:0;top:0;width:1080px;height:1340px">
<div class="top"><span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:6px 18px;font-size:24px">📍 부산 방탈출 · 서면·해운대</span>
<span class="chip" style="background:#3A2E28;color:#EAD6C4;padding:6px 16px;font-size:22px">1 / 6</span></div>
<h1 style="position:absolute;left:64px;top:118px;font-size:80px;color:#3A2E28">부산 방탈출,<br><span style="color:#3B6FD9">어데 갈끼고?</span></h1>
<div style="position:absolute;left:64px;right:64px;top:1105px;display:grid;grid-template-columns:1fr 1fr;gap:10px">{toc}</div>
<div class="ft" style="top:1300px;color:#3A2E28;opacity:.8"><span>바다 보고 방탈출까지, 테마 {c["total"]}개 중에 골라 봤다 아이가 🌊 →</span><b>방탈로그</b></div></body></html>'''
    open(os.path.join(T, "bs1.html"), "w").write(s1)
    ss1 = (B.HEAD % 1920) + f'''<div style="position:absolute;inset:0;background:#EAD6C4"></div><div style="position:absolute;left:0;right:0;top:0;height:600px;background:#D6CED8"></div>
<img src="../assets/bs-cover.jpg" style="position:absolute;left:0;top:250px;width:1080px;height:1340px">
<div class="top" style="top:120px"><span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 20px;font-size:27px">📍 부산 방탈출 · 서면·해운대</span></div>
<h1 style="position:absolute;left:64px;top:220px;font-size:112px;color:#3A2E28">부산 방탈출,<br><span style="color:#3B6FD9">어데 갈끼고?</span></h1>
<p style="position:absolute;left:68px;top:1380px;right:64px;font-weight:800;font-size:34px;color:#3A2E28">바다 보고 방탈출까지, 16곳 골라 봤다 아이가 🌊</p>
<p style="position:absolute;left:0;right:0;top:1660px;text-align:center;font-weight:800;font-size:34px;color:#3A2E28">👇 눌러서 부산 테마 다 보기</p></body></html>'''
    open(os.path.join(T, "bss1.html"), "w").write(ss1)
    for i, (key, art, shift, ac, chip, title, sub) in enumerate(PAGES, 2):
        cards = "".join(B.card(t) for t in S[key]); cr = B.credit(S[key])
        inner = f'''<div class="top"><span class="chip" style="background:{ac};color:#fff;border:3px solid #FFF6EA;padding:6px 18px;font-size:24px">{chip}</span>
<span class="chip" style="background:#FFF6EA;color:#2A2238;padding:6px 16px;font-size:22px">{i} / 6</span></div>
<h1 style="position:absolute;left:64px;top:126px;font-size:86px;color:#FFF6EA;{TS}">{title}</h1>
<p style="position:absolute;left:60px;top:238px;font-weight:800;font-size:22px;color:#FFF6EA;background:rgba(18,14,34,.72);border-radius:999px;padding:6px 16px">{note} · {sub}</p>
<div class="grid" style="top:1008px;--ac:{ac}">{cards}</div>
<div class="ft" style="top:1300px;color:#FFF6EA;opacity:.9"><span>{cr}</span><b>방탈로그</b></div>'''
        open(os.path.join(T, f"bs{i}.html"), "w").write(page(1350, art, shift, inner))
        st = 1050 - (985 + shift)  # 스토리: 유령 발끝이 카드 위(1050)에 오게
        bc = band(art)
        s = (B.HEAD % 1920) + f'''<div style="position:absolute;inset:0;background:{bc}"></div>
<img src="../assets/{art}" style="position:absolute;left:0;top:{st}px;width:1080px;height:1340px">
<div style="position:absolute;left:0;right:0;top:0;height:520px;background:linear-gradient(rgba(18,14,34,.8),rgba(18,14,34,0))"></div>
<div style="position:absolute;left:0;right:0;top:{st + 1340 - 160}px;height:160px;background:linear-gradient(rgba(0,0,0,0),{bc})"></div>
<div class="top" style="top:120px"><span class="chip" style="background:{ac};color:#fff;border:3px solid #FFF6EA;padding:7px 20px;font-size:27px">{chip}</span></div>
<h1 style="position:absolute;left:64px;top:215px;font-size:98px;color:#FFF6EA;{TS}">{title}</h1>
<p style="position:absolute;left:60px;top:340px;font-weight:800;font-size:25px;color:#FFF6EA;background:rgba(18,14,34,.72);border-radius:999px;padding:7px 18px">{note}</p>
<div class="grid" style="top:1090px;grid-template-columns:1fr;--ac:{ac}">{cards}</div>
<div class="ft" style="top:1630px;color:#FFF6EA;opacity:.85"><span>{cr}</span></div></body></html>'''
        open(os.path.join(T, f"bss{i}.html"), "w").write(s)
    inner = f'''<div class="top"><span class="chip" style="background:#E2603F;color:#fff;border:3px solid #FFF6EA;padding:6px 18px;font-size:24px">📌 저장해 두기</span>
<span class="chip" style="background:#FFF6EA;color:#2A2238;padding:6px 16px;font-size:22px">6 / 6</span></div>
<h1 style="position:absolute;left:64px;top:126px;font-size:80px;color:#FFF6EA;{TS}">부산 테마 {c["total"]}개,<br><span style="color:#FFD27A">다 보고 싶제?</span></h1>
<p style="position:absolute;left:60px;top:330px;font-weight:800;font-size:25px;color:#FFF6EA;background:rgba(18,14,34,.72);border-radius:999px;padding:7px 18px">단디 저장해 두고, 다녀온 방은 다이어리에 적어 두이소 📒</p>
<div style="position:absolute;left:64px;right:64px;top:1105px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;gap:10px;flex-wrap:wrap">
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">🔍 검색창에 "부산"</span>
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">📖 줄거리·난이도·후기</span>
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">🎯 취향 추천</span></div>
<div><span class="chip" style="background:#E2603F;color:#fff;border:3px solid #3A2E28;padding:11px 24px;font-size:29px;box-shadow:5px 5px 0 #3A2E28">프로필 링크 → bangtallog.com</span></div></div>
<div class="ft" style="top:1300px;color:#FFF6EA;opacity:.9"><span>먼저 써 보고 10초 가입</span><b>방탈로그</b></div>'''
    open(os.path.join(T, "bs6.html"), "w").write(page(1350, "bs-end.jpg", 135, inner))
    print("bs1~6, bss1~5 written")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
