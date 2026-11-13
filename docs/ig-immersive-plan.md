# 인스타: "배우가 나오는 방" 시리즈 (이머시브 연극·연기형 방탈출)

목록 기준은 `docs/immersive.md`(공식 확인된 곳만). 카드에 들어가는 정보도 그 표에 있는 것만.

## 지켜야 할 것
- 매장 포스터·사진·공식 영상 캡처 ✕. 배우 실제 얼굴·이름을 그림으로 흉내 내지 않는다.
- 공연 세트를 그대로 베끼지 않는다 → "어두운 호텔 복도", "옛날 아파트 거실"처럼 **분위기만** 새로 그린다.
- 관객 자리에는 우리 마스코트 탈출귀. 사람 배우는 얼굴이 안 보이는 실루엣·뒷모습·손만.
- 그림 AI 는 한글을 틀리게 쓴다 → 그림·영상엔 글자 없이, 글자는 우리가 얹는다(tools/ig 템플릿).
- 비용 0원: 제미나이(무료)로 그림. 힉스필드는 무료로 주는 양 안에서만, 결제 화면이 나오면 멈추고 물어본다.

## 1. 릴스 (9:16, 15~20초)
| 초 | 화면 | 글자(우리가 얹음) |
|---|---|---|
| 0~2 | 어두운 복도, 문틈 빛. 카메라가 천천히 다가감 | "여기서는 관객석이 없어요" |
| 2~5 | 문이 열리고 탈출귀가 쭈뼛 들어감. 실루엣 배우가 손짓 | "당신은 이미 등장인물" |
| 5~9 | 촛불·낡은 화장대·흩어진 서류 클로즈업 3컷 빠르게 | "배우가 처음부터 끝까지 같이 연기해요" |
| 9~14 | 곳 이름 2~3개가 하나씩 (연극형 / 방탈출형 표시) | 예: "홍대 · 인세인 · 75분 · 1~6인" |
| 14~18 | 탈출귀가 수첩에 적는 모습 → 끝 카드 | "다녀온 공연도 방탈로그에 기록 · bangtallog.com" |

만드는 법: 제미나이로 장면 그림 4장 → 힉스필드 '이미지→영상'으로 각 3~4초 움직임 → 우리 끝 카드(`tools/ig/templates/story.html` 류)와 이어 붙이기(`tools/ig/record.cjs`).

## 2. 캐러셀 (4:5, 5~7장)
1. 표지: "자물쇠 대신 배우가 있는 방" — 큰 제목 + 탈출귀가 무대 조명 아래 서 있는 그림
2. 구분: 연극형(퍼즐 없음, 이야기 따라감) vs 방탈출형(퍼즐 + 배우) — 두 칸 비교
3~6. 한 곳에 한 장: 지역 · 작품 · 연극형/방탈출형 · 시간 · 인원 · "배우가 끝까지 함께" (공식 확인된 것만)
7. 끝: "다녀오면 방탈로그에 기록 · 먼저 써 보고 10초 가입"

## 그림 프롬프트 (제미나이 / 힉스필드 공통, 영어가 잘 먹힘)
공통 꼬리말: `soft watercolor storybook illustration, warm cream paper texture, muted colors with one warm orange light, no text, no letters, no logos, 9:16 vertical, leave the top 30% and bottom 20% calm and empty for captions`

마스코트: `a small round white ghost mascot with rosy cheeks and a tiny tongue out, cute and a little nervous`

- 복도: `a dark old hotel corridor at night, a door slightly open with warm light spilling out, dust in the air, cinematic, + 공통 꼬리말`
- 입장: `the small white ghost mascot stepping through a doorway into a dim 1980s apartment living room, a tall human silhouette (face hidden in shadow, seen from behind) gesturing it to come in, theatrical spotlight, + 공통 꼬리말`
- 소품: `close-up of an antique vanity table with a candle, scattered letters and an old key, theatrical lighting, + 공통 꼬리말`
- 끝: `the small white ghost mascot sitting on a theatre seat writing in a little diary, stage curtain behind, cozy and happy, + 공통 꼬리말`

힉스필드 움직임(이미지→영상): `slow push-in camera, candle flicker, subtle dust particles, no new characters, keep the ghost's face consistent, 4 seconds`

## 캡션 초안
배우가 처음부터 끝까지 같이 연기하는 곳만 골랐어요 🎭
자물쇠를 푸는 대신, 이야기 안으로 들어가는 방.

(곳별 한 줄 — 공식 정보만)

다녀온 공연·방은 방탈로그에 기록해 두세요. 먼저 써 보고 10초 가입 → 프로필 링크
#이머시브연극 #이머시브방탈출 #체험형연극 #방탈출추천 #홍대방탈출 #방탈로그
