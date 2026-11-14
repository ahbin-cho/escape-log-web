"""수원편 스토리 5장(1080×1920): 이미 올린 피드 카드(sw1~5)를 그대로 가운데에 놓고, 위·아래를 같은 바탕색으로 늘린다.
아래 310px 는 링크 스티커 자리. 사용: python3 tools/ig/region/suwon_stories.py"""
import os, re
T = os.path.join(os.path.dirname(__file__), "..", "templates")
TOP = 250
for i in range(1, 6):
    s = open(os.path.join(T, f"sw{i}.html")).read()
    m = re.search(r"body\{background:(#[0-9A-Fa-f]{6}) (url\([^)]*\)[^;]*);color:(#[0-9A-Fa-f]{6})\}", s)
    bg, art, fg = m.groups()
    s = s.replace(m.group(0), f"body{{background:{bg};color:{fg}}}\n.wrap{{position:absolute;left:0;top:{TOP}px;width:1080px;height:1350px;overflow:hidden;background:{bg} {art}}}")
    s = s.replace("html,body{margin:0;width:1080px;height:1350px;", "html,body{margin:0;width:1080px;height:1920px;")
    s = re.sub(r'<span class="chip"[^>]*>\d / 6</span>', "", s)                      # 쪽 번호 빼기
    s = s.replace("<body>", '<body><div class="wrap">', 1).replace("</body>", f'</div><p style="position:absolute;left:0;right:0;top:{TOP + 1350 + 70}px;text-align:center;font-weight:800;font-size:34px;color:{fg}">👇 눌러서 수원 테마 다 보기</p></body>', 1)
    s = s.replace("옆으로 넘겨 보세요 →", "다음 스토리로 →")
    open(os.path.join(T, f"sws{i}.html"), "w").write(s)
print("sws1~5 written")
