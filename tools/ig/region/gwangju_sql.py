"""광주 매장·테마를 공식 페이지 캡처(gwangju_raw.md) 기준으로 catalog 에 넣고 고치는 SQL 을 만든다.
python3 tools/ig/region/gwangju_sql.py > docs/sql/catalog_gwangju.sql
- 새 매장(브레인·러시아워 로드맨션·숨바꼭질 동구점): 이름+매장 기준으로 없으면 넣고, 있으면 고친다.
- 기존 매장(룸즈에이 3곳·상상의문 광주점): 공식 장르·시간·인원·난이도·소개로 고친다. 공포도는 공식 표기가 있을 때만 바꾼다.
"""
P = "https://talkkaknote.com/posters/gwangju/"
BRAIN = "브레인 방탈출카페 광주 충장로점"  # 공식 인스타 이름 그대로
RUSH = "러시아워 로드맨션 광주 전대점"
HIDE = "숨바꼭질 광주동구점"
RS, RW, RW2 = "룸즈에이 광주상무점", "룸즈에이 광주수완점", "룸즈에이 광주수완 2호점"
SS = "상상의문 광주점"
BRAIN_URL = "http://www.brain-escape.co.kr"
RUSH_URL = "https://m.place.naver.com/place/1448397413/ticket"
HIDE_URL = "https://hideescape.com/"

# name, cafe, genre, difficulty, fear(None=그대로), tags, teaser, time, players, price(None=그대로), url(None=그대로), poster
ROWS = [
    # 브레인 — 공식 소개 이미지(난이도 별점·태그·줄거리) + 네이버 플레이스(1인 가격). 시간·인원은 공식 미표기
    ("썸", BRAIN, "감성", 2, 1, ["달달", "감성", "로맨틱", "광주"], "대학교 동아리에서 만난 우리는 어떤 사이일까..?", None, None, 22000, BRAIN_URL, P + "brain-ssum.jpg"),
    ("쉿", BRAIN, "코믹", 3, 1, ["코믹", "추리", "광주"], "독서실에서 공부를 열심히 하던 중 갑자기 정체 모를 소리와 함께 시작된 고통스러운 상황.. 범인은 이 안에 있어!", None, None, 22000, BRAIN_URL, P + "brain-shit.jpg"),
    ("필라멘트", BRAIN, "감성", 3, 1, ["감성", "힙합", "광주"], "10년의 세월을 날려버린 개떡 같은 꿈.. 나는 오늘 내 인생에서 가장 큰 도전을 시작한다.", None, None, 22000, BRAIN_URL, P + "brain-filament.jpg"),
    ("슈퍼빌런", BRAIN, "아케이드", 3, 1, ["겜알못", "활동성", "광주"], "악당을 무찌르고 게임을 클리어 하자 !! 근데 내 실력 상태가 ..?", None, None, 24000, BRAIN_URL, P + "brain-supervillain.jpg"),
    ("루머", BRAIN, "공포", 5, 3, ["공포", "스릴러", "귀신", "광주"], "수년이 지나 어떤 편지 한 통을 받았고, 발신인은 놀랍게도 숨바꼭질하던 그 친구. 다시는 만나지 못할 줄 알았는데.. 녀석은 별장에서 날 기다리고 있겠다고 했다.", None, None, 24000, BRAIN_URL, P + "brain-rumor.jpg"),
    ("블랙리스트", BRAIN, "스릴러", 4, 2, ["추리", "스릴러", "광주"], "내 손에 수많은 사람들이 사라졌다.. 죄지은 사람을 처리하는 조금 특별한 청소부인 여러분", None, None, 24000, BRAIN_URL, P + "brain-blacklist.jpg"),
    # 러시아워 로드맨션(전대점) — 네이버 플레이스 예약 탭
    ("지난날", RUSH, "공포", 4, 3, ["공포", "스릴러", "공포도 조절 가능", "치마 비추천", "광주"], "[우리들의 행복했던 지난날] 공포도 조절 가능합니다.", 85, "2~4", 28000, RUSH_URL, P + "rushhour-jinannal.jpg"),
    ("오드의 마법사", RUSH, "모험", 4, 1, ["어드벤처", "광주"], "[로드맨션에 입주하시는 입주민 여러분. 반갑습니다]", 65, "2~4", 23000, RUSH_URL, P + "rushhour-odd.jpg"),
    ("우당탕탕 치즈탈환 대작전!", RUSH, "코믹", 3, 1, ["코믹", "초심자 추천", "광주"], "[오늘 일정은 매우 바쁨!] 난이도가 낮아 초심자와 함께하기 좋은 테마입니다.", 60, None, 22000, RUSH_URL, P + "rushhour-cheese.jpg"),
    # 숨바꼭질 광주동구점 — 공식 홈페이지 '테마'(공포도 0~5 → 우리 1~5, 0 은 1)
    ("꽃배", HIDE, "추리", 4, 1, ["수사물", "조선", "활동성", "한자·한글 자물쇠", "광주"], "#본격조선수사물 #활동성갑 #여기가민속촌이야방탈출이야 #전국최초한자,한글자물쇠도입", 70, "1~5", None, HIDE_URL, None),
    ("무죄", HIDE, "스릴러", 4, 2, ["액션스릴러", "탈옥", "두 팀 입장", "광주"], "수감자와 요원이 협력하여 교도소장이 자리를 비운 60분동안 감옥을 탈출하는 테마로 두팀으로 나뉘어져 각각 입장하게 됩니다. 여러분의 팀워크를 발휘해주세요.", 60, "2~6", None, HIDE_URL, None),
    ("인연", HIDE, "감성", 3, 1, ["드라마", "광주"], "어떤 사람에게는 굉장히 공감되는 또 어떤 사람에게는 교훈이 되는 그런 이야기랍니다. 1980년대 분위기에서 이야기속 주인공이 되어보세요!", 60, "1~6", None, HIDE_URL, None),
    ("손님", HIDE, "판타지", 5, 1, ["판타지 미스테리", "광주"], "들어간 저택 그곳에서는 대체 어떤 일이 벌어진 것일까?", 60, "2~6", None, HIDE_URL, None),
    # 룸즈에이 광주상무점 — 공식 홈페이지 지점 탭(장르·시간·난이도). 공포도는 그대로(아이돌 남친만 공식 장르에 공포가 없어 2)
    ("띵가띵가", RS, "코믹", 3, None, ["큐트", "코믹", "광주"], None, 60, None, None, None, None),
    ("이상한 돈가스", RS, "코믹", 4, None, ["큐트", "코믹", "광주"], None, 60, None, None, None, None),
    ("뜻밖의 여행", RS, "모험", 3, None, ["여행", "광주"], None, 60, None, None, None, None),
    ("아이돌 남친", RS, "감성", 4, 2, ["로맨스", "스릴러", "광주"], None, 60, None, None, None, None),
    ("그레이스 호텔", RS, "공포", 4, None, ["공포", "스릴러", "광주"], None, 70, None, None, None, None),
    ("커밍순", RS, "감성", 4, None, ["스토리", "광주"], None, 60, None, None, None, None),
    ("이 소리 저만 들리나요?", RS, "판타지", 4, None, ["요정", "판타지", "광주"], None, 60, None, None, None, None),
    ("전지적 작가 시점", RS, "감성", 4, None, ["스토리", "로맨스", "광주"], None, 60, None, None, None, None),
    ("멍사탕", RS, "코믹", 4, None, ["코믹", "판타지", "광주"], None, 60, None, None, None, None),
    # 룸즈에이 광주수완점
    ("요정들의 술집", RW, "코믹", 3, None, ["코믹", "판타지", "광주"], None, 60, "2~5", 22000, None, None),  # 상세: 2명 44,000 · 3명 63,000 · 4명 80,000 · 5명 95,000 → 2인 기준 1인 22,000
    ("낭랑카페", RW, "감성", 4, None, ["힐링", "판타지", "광주"], None, 60, None, None, None, None),
    ("히어로 아카데미", RW, "아케이드", 4, None, ["히어로", "아케이드", "광주"], None, 60, None, None, None, None),
    ("뽀득뽀득", RW, "코믹", 5, None, ["큐트", "목욕", "광주"], None, 60, None, None, None, None),
    ("너와 나의 이야기", RW, "감성", 4, None, ["감성", "스토리", "광주"], None, 60, None, None, None, None),
    ("시크릿 에이전트", RW, "추리", 4, None, ["잠입", "수사", "광주"], None, 60, None, None, None, None),
    ("방과 후", RW, "공포", 4, None, ["공포", "스릴러", "광주"], None, 70, None, None, None, None),
    # 룸즈에이 광주수완 2호점
    ("놈즈 : 더 비기닝", RW2, "추리", 4, None, ["탐문", "수사", "광주"], None, 80, None, None, None, None),
    ("The Last Dance", RW2, "아케이드", 4, None, ["미션", "광주"], None, 80, None, None, None, None),
    ("아이언 게이트 프리즌", RW2, "모험", 4, None, ["탈옥", "광주"], None, 75, None, None, None, None),
    ("미스틱 클럽", RW2, "공포", 4, None, ["미스터리", "오컬트", "공포", "광주"], None, 75, None, None, None, None),
    # 상상의문 광주점 — 공식 홈페이지 테마
    ("영결식(靈結式)", SS,  # DB 는 靈 을 호환 한자(U+F9B3)로 저장
     "공포", 3, None, ["공포", "광주"], "現在去接你", 60, "2~6", None, None, None),
    ("시크릿 왕국의 스캔들", SS, "추리", 4, None, ["추리", "잔혹동화", "광주"], "시크릿 왕국의 프린스 왕자와 새 왕자비를 소개하는 연회를 개최합니다. 부디 참석하여 기쁜 날을 함께 맞이해 주시오.", 80, "2~5", None, None, None),
    ("호러맨스", SS, "스릴러", 3, 3, ["로맨스", "스릴러", "광주"], "와 오늘은 데이트하는 날! 즐겁게 놀아야지! 그런데.. 자기야 뭐라고? ^^", 70, "2~6", None, None, None),
    ("서울만가면된다", SS, "코믹", 4, None, ["일상", "코미디", "광주"], "민서: (조심스럽게) 팀장님 근데..저희 지금 여기 무슨 컨셉으로 만드는 중인거예요?", 69, "2~5", None, None, None),
    ("TITAN : 전쟁의경계", SS, "SF", 4, None, ["SF", "강한 빛·소리 주의", "광주"], "이곳에서 나는 자부심이 가득한 군인으로 일하고 있다. 그리고 오늘 나는 이 행성의 이름이 타이탄인 건지 의심이 가기 시작했다.", 70, "2~4", None, None, None),
    ("그럼에도 불구하고,", SS, "감성", 2, 1, ["드라마", "광주"], "유감스럽게도, 당신은 결국 성공하지 못할 거예요.", 70, "2~5", None, None, None),
]


def q(v):
    if v is None:
        return "null"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, list):
        return "array[" + ",".join(q(x) for x in v) + "]::text[]"
    return "'" + str(v).replace("'", "''") + "'"


out = ["""-- 광주 방탈출 — 공식 페이지(운영자 캡처, 2026-11-16) 기준. 기록: tools/ig/region/gwangju_raw.md
-- Supabase → SQL Editor 에 통째로 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 새로 넣는 곳: 브레인 충장로점 6 · 러시아워 로드맨션(전대점) 3 · 숨바꼭질 광주동구점 4
-- 고치는 곳: 룸즈에이 상무·수완·수완2호점 20 · 상상의문 광주점 6 (공식 장르·시간·난이도·인원·소개)
-- 공포도: 공식 표기가 있을 때만(숨바꼭질 0~5, 상상의문 '그럼에도 불구하고' 0.5) 바꾸고, 표기가 없는 새 테마는 공포 장르 3·스릴러 2·나머지 1.
--   기존 테마는 그대로 두되, 공식 장르에 공포가 없는 '아이돌 남친'(로맨스/스릴러)은 4→2, '호러맨스'(로맨스/스릴러)는 4→3.
-- 포스터: 브레인·러시아워 공식 포스터를 사이트에 올려 연결(사이트 안에서만, 원본 그대로).
"""]
for (name, cafe, genre, dif, fear, tags, teaser, tl, players, price, url, poster) in ROWS:
    sets = [f"genre={q(genre)}", f"difficulty={dif}", f"tags={q(tags)}"]
    if fear is not None:
        sets.append(f"fear_level={fear}")
    if teaser is not None:
        sets.append(f"teaser={q(teaser)}")
    if tl is not None:
        sets.append(f"time_limit={tl}")
    if players is not None:
        sets.append(f"players={q(players)}")
    if price is not None:
        sets.append(f"price={price}")
    if url is not None:
        sets.append(f"reservation_url={q(url)}")
    if poster is not None:
        sets.append(f"poster_url={q(poster)}")
    out.append(f"update public.catalog set {', '.join(sets)} where name={q(name)} and cafe={q(cafe)};")
    if cafe in (BRAIN, RUSH, HIDE):
        out.append(
            "insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) "
            f"select {q(name)}, {q(cafe)}, {q(genre)}, {dif}, {fear or 1}, {q(tags)}, {q(teaser or '')}, {tl or 0}, {q(players or '')}, {price or 0}, {q(url or '')}, {q(poster or '')} "
            f"where not exists (select 1 from public.catalog where name={q(name)} and cafe={q(cafe)});"
        )
out.append(r"""
-- 룸즈에이 광주 3곳: 소개 글 앞에 붙어 있던 '장르 - … 시간 - … 난이도 - n/5' 를 떼고 공식 줄거리 첫 문장만 남긴다(장르·시간·난이도는 따로 칸에 있음)
update public.catalog set teaser = regexp_replace(teaser, '^장르 - .*?난이도 - [0-9]/5\s*-?\s*', '')
where cafe in ('룸즈에이 광주상무점','룸즈에이 광주수완점','룸즈에이 광주수완 2호점') and teaser like '장르 - %';""")
out.append("""
-- 확인
select cafe, count(*) as themes from public.catalog where cafe like '%광주%' group by cafe order by cafe;""")
print("\n".join(out))
