"""광주편 — 부산편(build_busan)과 같은 틀: 꽉 찬 수채 그림(운영자 제미나이) + 아래 작은 공식 포스터 카드 2×2. 말투는 전라도.
사용: python3 tools/ig/region/build_gwangju.py tools/ig/region/gwangju.json <posters map.json>
그림: tools/ig/assets/gj-{cover,fear,calm,first,story,end}.jpg (1080×1340)"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import build_daegu2 as B
import build_busan as BB

T = B.T
B.SHORT.update({"브레인 방탈출카페 광주 충장로점": "브레인 충장로", "러시아워 로드맨션 광주 전대점": "러시아워 로드맨션 전대",
    "숨바꼭질 광주동구점": "숨바꼭질 동구", "룸즈에이 광주수완점": "룸즈에이 수완", "룸즈에이 광주수완 2호점": "룸즈에이 수완2호"})
TS = BB.TS

# key, 그림, 위로 올리는 px(유령이 카드에 안 가리게), 강조색, 칩, 제목, 기준
PAGES = [
 ("fear", "gj-fear.jpg", 230, "#E2554A", "😱 쫄깃한 맛", "쫄깃한 거 <span style='color:#FFB4A8'>땡기제?</span>", "공포 장르만"),
 ("calm", "gj-calm.jpg", 110, "#3E9A6A", "🌿 안 무서운 맛", "무서운 건 <span style='color:#A8F0C8'>싫당께?</span>", "어드벤처·아케이드·수사물"),
 ("first", "gj-first.jpg", 180, "#D9771C", "🐣 입문", "방탈출 <span style='color:#FFD27A'>첨이여?</span>", "매장이 쉽다고 적어 둔 방·별 낮은 방"),
 ("story", "gj-story.jpg", 150, "#7A68C2", "📖 이야기 맛집", "이야기 <span style='color:#E0D4FF'>좋아허제?</span>", "감성·드라마·스토리"),
]
WHERE = "충장로·전대·수완"


def main(cfg, posters):
    c = json.load(open(cfg)); B.POSTERS.update(json.load(open(posters))); S = c["sections"]; chk = c["checked_on"]
    note = f"📍 광주 {WHERE} · 매장 공식 페이지 기준({chk} 확인)"
    toc = "".join(f'<div style="background:#FFFBF2;border:3px solid #3A2E28;border-radius:14px;padding:9px 16px;font-weight:800;font-size:23px;box-shadow:3px 3px 0 #3A2E28">{x}</div>'
                  for x in ["2 😱 쫄깃한 거 땡기제?", "3 🌿 무서운 건 싫당께?", "4 🐣 방탈출 첨이여?", "5 📖 이야기 좋아허제?"])
    s1 = (B.HEAD % 1350) + f'''<div style="position:absolute;inset:0;background:#E9D9A8"></div>
<img src="../assets/gj-cover.jpg" style="position:absolute;left:0;top:0;width:1080px;height:1340px">
<div style="position:absolute;left:0;right:0;top:1060px;height:290px;background:linear-gradient(rgba(233,217,168,0),rgba(233,217,168,.92) 45%)"></div>
<div class="top"><span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:6px 18px;font-size:24px">📍 광주 방탈출 · {WHERE}</span>
<span class="chip" style="background:#3A2E28;color:#F4E9C8;padding:6px 16px;font-size:22px">1 / 6</span></div>
<h1 style="position:absolute;left:64px;top:118px;font-size:80px;color:#3A2E28">광주 방탈출,<br><span style="color:#C2571F">어디 갈랑가?</span></h1>
<div style="position:absolute;left:64px;right:64px;top:1128px;display:grid;grid-template-columns:1fr 1fr;gap:10px">{toc}</div>
<div class="ft" style="top:1300px;color:#3A2E28;opacity:.85"><span>무등산 보고 방탈출까지, 테마 {c["total"]}개 중에 골라 봤당께 →</span><b>방탈깍노트</b></div></body></html>'''
    open(os.path.join(T, "gj1.html"), "w").write(s1)
    ss1 = (B.HEAD % 1920) + f'''<div style="position:absolute;inset:0;background:#E9D9A8"></div><div style="position:absolute;left:0;right:0;top:0;height:600px;background:#F3E7B8"></div>
<img src="../assets/gj-cover.jpg" style="position:absolute;left:0;top:420px;width:1080px;height:1340px">
<div style="position:absolute;left:0;right:0;top:400px;height:160px;background:linear-gradient(#F3E7B8,rgba(243,231,184,0))"></div>
<div class="top" style="top:120px"><span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 20px;font-size:27px">📍 광주 방탈출 · {WHERE}</span></div>
<h1 style="position:absolute;left:64px;top:220px;font-size:112px;color:#3A2E28">광주 방탈출,<br><span style="color:#C2571F">어디 갈랑가?</span></h1>
<p style="position:absolute;left:0;right:0;top:1700px;text-align:center;font-weight:800;font-size:34px;color:#3A2E28;background:rgba(255,251,242,.85);padding:10px 0">👇 눌러서 광주 테마 {c["total"]}개 다 보기</p></body></html>'''
    open(os.path.join(T, "gjs1.html"), "w").write(ss1)
    for i, (key, art, shift, ac, chip, title, sub) in enumerate(PAGES, 2):
        cards = "".join(B.card(t) for t in S[key]); cr = B.credit(S[key])
        inner = f'''<div class="top"><span class="chip" style="background:{ac};color:#fff;border:3px solid #FFF6EA;padding:6px 18px;font-size:24px">{chip}</span>
<span class="chip" style="background:#FFF6EA;color:#2A2238;padding:6px 16px;font-size:22px">{i} / 6</span></div>
<h1 style="position:absolute;left:64px;top:126px;font-size:86px;color:#FFF6EA;{TS}">{title}</h1>
<p style="position:absolute;left:60px;top:238px;font-weight:800;font-size:22px;color:#FFF6EA;background:rgba(18,14,34,.72);border-radius:999px;padding:6px 16px">{note} · {sub}</p>
<div class="grid" style="top:1008px;--ac:{ac}">{cards}</div>
<div class="ft" style="top:1300px;color:#FFF6EA;opacity:.9"><span>{cr}</span><b>방탈깍노트</b></div>'''
        open(os.path.join(T, f"gj{i}.html"), "w").write(BB.page(1350, art, shift, inner))
        st = 1050 - (985 + shift)
        bc = BB.band(art)
        s = (B.HEAD % 1920) + f'''<div style="position:absolute;inset:0;background:{bc}"></div>
<img src="../assets/{art}" style="position:absolute;left:0;top:{st}px;width:1080px;height:1340px">
<div style="position:absolute;left:0;right:0;top:0;height:520px;background:linear-gradient(rgba(18,14,34,.8),rgba(18,14,34,0))"></div>
<div style="position:absolute;left:0;right:0;top:{st + 1340 - 160}px;height:160px;background:linear-gradient(rgba(0,0,0,0),{bc})"></div>
<div class="top" style="top:120px"><span class="chip" style="background:{ac};color:#fff;border:3px solid #FFF6EA;padding:7px 20px;font-size:27px">{chip}</span></div>
<h1 style="position:absolute;left:64px;top:215px;font-size:98px;color:#FFF6EA;{TS}">{title}</h1>
<p style="position:absolute;left:60px;top:340px;font-weight:800;font-size:25px;color:#FFF6EA;background:rgba(18,14,34,.72);border-radius:999px;padding:7px 18px">{note}</p>
<div class="grid" style="top:1090px;grid-template-columns:1fr;--ac:{ac}">{cards}</div>
<div class="ft" style="top:1630px;color:#FFF6EA;opacity:.85"><span>{cr}</span></div></body></html>'''
        open(os.path.join(T, f"gjs{i}.html"), "w").write(s)
    inner = f'''<div class="top"><span class="chip" style="background:#E2603F;color:#fff;border:3px solid #FFF6EA;padding:6px 18px;font-size:24px">📌 저장해 두기</span>
<span class="chip" style="background:#FFF6EA;color:#2A2238;padding:6px 16px;font-size:22px">6 / 6</span></div>
<h1 style="position:absolute;left:64px;top:126px;font-size:80px;color:#FFF6EA;{TS}">광주 테마 {c["total"]}개,<br><span style="color:#FFD27A">다 보고 잡제?</span></h1>
<p style="position:absolute;left:60px;top:330px;font-weight:800;font-size:25px;color:#FFF6EA;background:rgba(18,14,34,.72);border-radius:999px;padding:7px 18px">저장해 두고, 다녀온 방은 다이어리에 적어 두랑께 📒</p>
<div style="position:absolute;left:64px;right:64px;top:1105px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;gap:10px;flex-wrap:wrap">
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">🔍 검색창에 "광주"</span>
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">📖 줄거리·난이도·후기</span>
<span class="chip" style="background:#FFFBF2;border:3px solid #3A2E28;padding:7px 16px;font-size:23px">🎯 취향 추천</span></div>
<div><span class="chip" style="background:#E2603F;color:#fff;border:3px solid #3A2E28;padding:11px 24px;font-size:29px;box-shadow:5px 5px 0 #3A2E28">프로필 링크 → talkkaknote.com</span></div></div>
<div class="ft" style="top:1300px;color:#FFF6EA;opacity:.9"><span>먼저 써 보고 10초 가입</span><b>방탈깍노트</b></div>'''
    if os.path.exists(os.path.join(BB.A, "gj-end.jpg")):
        open(os.path.join(T, "gj6.html"), "w").write(BB.page(1350, "gj-end.jpg", 290, inner))
    print("gj1~6, gjs1~5 written")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
