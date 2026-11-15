"""쇼룸404 소개 캐러셀 배경: 옛 공연 전단(활판 인쇄) 느낌. 한글은 HTML 에서 얹는다.
사용: python3 tools/ig/drawings/showroom404_bg.py tools/ig/assets
(claude-drawing-skill 의 Letterpress 사용. 매장 포스터·사진은 쓰지 않는다)"""
import sys, os
sys.path.insert(0, os.path.expanduser("~/.claude/skills/claude-drawing-skill/lib"))
from letterpress import Letterpress, RED, BLACK

out = sys.argv[1]
W, H = 1080, 1350

def base(seed):
    lp = Letterpress(W, H, seed=seed)
    lp.paper()
    lp.border(44, 44, W - 44, H - 44, ink=BLACK, weight=5)
    return lp

def finish(lp, name):
    lp.fold('h', H * 0.5, depth=0.5, crack=0.4)
    lp.tone_edges(0.8)
    lp.foxing(60)
    lp.nicks(4)
    lp.save(os.path.join(out, name), quality=90)

# 표지: 큰 나무활자 404 + SHOW LINEUP
lp = base(404)
lp.type_line("TONIGHT  IN  HONGDAE", 110, W - 110, 150, 34, face='gothic', ink=BLACK)
lp.rule(110, W - 110, 180, kind='thick_thin', ink=BLACK)
lp.type_line("SHOWROOM", 110, W - 110, 330, 120, face='clarendon', ink=BLACK)
lp.type_line("404", 150, W - 150, 720, 350, face='fatface', ink=RED, shade=(9, 9, BLACK, 3))
lp.press(RED); lp.press(BLACK)
for i, x in enumerate((170, 300, W - 300, W - 170)):
    lp.star(x, 800, 22, ink=RED if i % 2 == 0 else BLACK)
lp.rule(110, W - 110, 850, kind='double', ink=BLACK)
lp.rule(110, W - 110, 1215, kind='thin_thick', ink=BLACK)
lp.type_line("FOUR  SHOWS  *  SIXTY  MINUTES  EACH", 110, W - 110, 1262, 28, face='gothic', ink=BLACK)
lp.press(RED); lp.press(BLACK)
finish(lp, "sr404-cover.jpg")

# 속지: 테두리 + 위아래 줄만
lp = base(405)
lp.type_line("SHOWROOM  404", 110, 520, 132, 30, face='clarendon', ink=BLACK, align='left')
lp.rule(110, W - 110, 160, kind='thick_thin', ink=BLACK)
lp.rule(110, W - 110, 1232, kind='thin_thick', ink=BLACK)
lp.star(W - 132, 118, 16, ink=RED)
lp.press(RED); lp.press(BLACK)
finish(lp, "sr404-page.jpg")
