# 인스타 카드 만들기 도구

운영자가 직접 올리는 카드(1080×1350)와 릴스(1080×1920)를 HTML 로 만들어 이미지·영상으로 뽑는다.
Playwright(크로미움)와 ffmpeg 가 필요하다.

```bash
# 카드 한 장: HTML → JPG
node tools/ig/shot.cjs tools/ig/templates/sw3.html out/suwon-3.jpg

# 릴스: 애니메이션 HTML 을 10.5초 녹화 → mp4 (무음 트랙 포함)
node tools/ig/record.cjs <녹화 폴더> tools/ig/templates/story.html   # webm 경로를 출력
ffmpeg -y -i <webm> -f lavfi -i anullsrc=r=44100:cl=stereo -t 10 \
  -vf "scale=1080:1920,fps=30,format=yuv420p" -c:v libx264 -crf 20 -c:a aac -shortest -movflags +faststart out.mp4
```

## 템플릿
| 파일 | 내용 | 스타일 |
|---|---|---|
| sw1~6 | 수원 지역 모음 | 제미나이 그림(`assets/sw-*.jpg`) 위·아래 빈 띠에 제목과 테마 카드 |
| sp1b, sp2c, sp3 · sps1~5 | 수능 수험생 이벤트(표지 + 쿠폰 3개 + 큰 쿠폰 1개) · 스토리용 매장별 1장(1080×1920, 매장 계정 멘션용, sps5 는 올리브점 오즈 버전) | 노랑 파스텔, 진갈색 선, 쿠폰 모양 |
| in1~6 | 서비스 소개 | 사이트 스타일 + 실제 사이트 화면(`assets/home.png` 등) |
| hk1~5 | "어떤 소개에 더 끌려요?" | 먹색 바탕, ✕ 스펙 / ○ 한 문장 비교 |
| dict1~6 | 방탈출 용어 사전 | 사이트 스타일(크림·굵은 테두리) |
| bj1, bj2 | 방자전 소개 + 시간표·가격 | 한지·짚 느낌 + 사이트 스타일 |
| ed-school | ESCAPE SCHOOL 오픈 예고 | 영화 포스터 톤 |
| story, morgue, chunhwa | 이 방의 이야기 릴스 | 공포 분위기 애니메이션 |

새 카드는 가장 비슷한 템플릿을 복사해 글자만 바꾸는 게 빠르다.
글꼴은 `assets/fonts/`(SB어그로·Pretendard), 마스코트는 `public/mascot.png` 를 상대 경로로 쓴다.

## 제미나이 그림 얹는 법
1. 운영자가 `docs/instagram-prompts.md` 의 프롬프트로 그림을 받는다(위 35%·아래 15%를 비운 4:5).
2. 그림을 폭 1080 으로 줄여 `assets/` 에 넣고, body 배경으로 깐다(`background: <띠 색> url(...) no-repeat 0 -80px/1080px auto`).
3. 그림의 위·아래 빈 띠 색을 찍어 같은 색으로 아래 영역을 덮고(제미나이 ✦ 표시도 가려짐) 그 위에 카드를 놓는다.
4. 뽑은 뒤 반드시 이미지를 열어 글자 겹침·잘림을 확인한다.

## 운영자 직접 올리기 묶음(zip)
`python3 tools/ig/pack.py <출력 폴더> [릴스 mp4]` → 날짜순 폴더(1.jpg… + 캡션.txt + 올리는법.txt) + 00_일정표.txt 를 zip 으로.
새 게시물은 pack.py 의 POSTS 에 한 줄 추가. 여러 장 렌더는 `node tools/ig/render.cjs jobs.json`.
