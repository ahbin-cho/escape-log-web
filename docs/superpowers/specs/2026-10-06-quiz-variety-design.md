# 취향 찾기 개편 1단계 — 질문 풀 + 고정 유형 16개 설계

작성일: 2026-10-06 · 상태: 검토 대기

취향 찾기 개편은 세 단계로 나눈다. 이 문서는 1단계만 다룬다.

1. **이 문서 — 퀴즈 자체**: 할 때마다 달라지는 질문, 다양한 형식, 고정 유형 16개
2. 공유되는 결과: 결과 주소·공유 이미지·친구 궁합 연결·유형별 비율 (별도 문서)
3. 추천 정확도: 지역·인원 필터, 추천 이유, 예약 연결 (별도 문서)

---

## 1. 목표

- 취향 찾기를 **다시 해도 새롭게** 만든다. 질문 문장과 형식이 매번 바뀐다.
- 결과를 **이름과 그림이 정해진 유형 16개** 중 하나로 준다. 2단계에서 "나는 OO형"으로 공유할 바탕이 된다.
- 문항 수는 줄이지 않는다(11문항). 대신 **문항 수를 화면에 보여 주지 않는다.**
- 같은 성향으로 답하면 어떤 질문이 뽑혀도 **같은 유형**이 나온다.

성공 기준: 두 번 연속으로 했을 때 질문 11개가 모두 다른 문장으로 나오고, 같은 뜻으로 답하면 유형이 같다.

## 2. 결정 사항 (브레인스토밍 결과)

| 질문 | 결정 |
|---|---|
| "다양하게"의 뜻 | 질문이 매번 다름 + 형식이 다양 + 결과 유형이 다양 + 문장이 재밌게 (넷 다) |
| 결과 구조 | 고정 유형 + 세부 성향 |
| 질문을 바꾸는 방식 | 축별 슬롯 + 변형 (분기형·무작위 점수 풀은 채택 안 함) |
| 유형 체계 | 끌리는 것 4 × 플레이 방식 4 = 16개 |
| 유형 그림 | 운영자가 다른 AI로 생성. 이 문서가 프롬프트를 제공 |
| 테스트 | 유형 판정 로직에 한해 `vitest` 추가 |

## 3. 현재 상태에서 달라지는 점

- `lib/quiz.ts`(461줄)는 질문 11개가 고정이고, 페르소나 이름을 장르×공포 조합표와 희귀 조합 규칙으로 만든다.
- `/api/persona`는 정적 스텁(`{ enabled: false }`)이라 **AI 진단은 지금 동작하지 않는다.** 화면은 항상 규칙 기반 문구를 쓴다. 이번 개편에서 AI 호출 코드를 퀴즈 화면에서 뺀다. `lib/ai.ts`와 라우트 스텁은 건드리지 않는다.
- 결과는 `localStorage`의 `escapelog:quiz:v1`에 저장되고, 친구 궁합(`app/match/page.tsx`)이 여기서 `taste`를 읽는다.

## 4. 슬롯과 값

문항마다 재는 것(슬롯)이 정해져 있다. 슬롯은 11개, 슬롯마다 변형 3개, 질문은 총 33개다.

| 슬롯 ID | 재는 것 | 값 |
|---|---|---|
| `draw1`, `draw2` | 끌리는 것 | `thrill` 스릴 / `brain` 두뇌 / `story` 이야기 / `explore` 탐험 |
| `play1`, `play2` | 플레이 방식 | `rush` 돌격 / `analyze` 분석 / `savor` 감상 / `team` 협동 |
| `genre` | 장르 | 공포 / 추리 / 감성 / 모험 / SF / 코믹 |
| `fear` | 공포 내성 | 1~5 |
| `difficulty` | 선호 난이도 | 1~5 |
| `hint` | 힌트 성향 | 1(안 씀)~5(바로 씀) |
| `atmosphere` | 분위기 | `dark` / `bright` / `grungy` / `epic` / `cute` |
| `players` | 인원 | 1 / 2 / 4 / 5 / 0(상관없음) |
| `time` | 플레이 시간 | `short` / `normal` / `long` / `extra` / `any` |

### 질문 형식

| 형식 | 화면 | 쓰는 슬롯 |
|---|---|---|
| `choice` | 선택지 4~6개 목록 | 모든 슬롯 |
| `binary` | 큰 카드 2장 중 하나 | `fear`, `difficulty`, `hint`, `time` |
| `slider` | 1~5 슬라이더 + 양끝 라벨 + 확인 버튼 | `fear`, `difficulty`, `hint` |

`binary`는 값 두 개만 고를 수 있으므로 4가지 값을 가려야 하는 `draw`·`play` 슬롯에는 쓰지 않는다.

### 뽑는 규칙

- 시작할 때 슬롯마다 변형 하나를 무작위로 뽑는다. 직전 회차에 나온 변형은 제외한다(직전 변형 ID를 `localStorage`의 `escapelog:quiz:last-variants`에 저장).
- 슬롯 순서도 섞는다. 단 첫 문항은 항상 `draw1`이다(가볍게 시작).
- 뽑기는 클라이언트에서 마운트 후에 한다(서버 렌더와 불일치 방지).

## 5. 유형 판정

### 끌리는 것

1. `draw1`, `draw2`에서 고른 값에 각각 2점.
2. `genre`가 가리키는 값에 1점: 공포→`thrill`, 추리→`brain`, 감성·코믹→`story`, 모험·SF→`explore`.
3. 점수가 가장 높은 값. 동점이면 `draw1`에서 고른 값.

### 플레이 방식

1. `play1`, `play2`에서 고른 값에 각각 2점.
2. 일부 선택지는 다른 값에 보조 1점을 준다(6장 질문 목록에 `+값`으로 표기).
3. `hint`가 1~2면 `analyze`에 1점, 4~5면 `rush`에 1점.
4. 점수가 가장 높은 값. 동점이면 `play1`에서 고른 값.

### 유형 ID

`<끌리는 것>-<플레이 방식>` (예: `thrill-rush`). 16개 조합이 모두 유효하다.

## 6. 질문 목록 (33개)

표기: 선택지 → 값. `+값`은 보조 1점.

### draw1 — 끌리는 것 A

**draw1-a** `choice` · 방 문이 열렸다. 제일 먼저 눈이 가는 건?
- 어둠 속에서 뭔가 움직인 것 같은 구석 → thrill
- 벽에 적힌 숫자와 기호 → brain
- 책상 위 누군가의 일기장 → story
- 저 끝에 살짝 열린 또 다른 문 → explore

**draw1-b** `choice` · 방탈출 하면 심장이 뛰는 순간은?
- 오싹한 연출에 소름이 돋을 때 → thrill
- 흩어진 실마리가 한 번에 이어질 때 → brain
- 이야기의 반전을 알아챘을 때 → story
- 숨겨진 공간이 열릴 때 → explore

**draw1-c** `choice` · 친구가 방 하나를 추천한다. 어떤 한마디에 바로 예약해?
- "나 거기서 진짜 주저앉았어, 무서워서" → thrill
- "문제 퀄리티가 미쳤어" → brain
- "스토리 때문에 끝나고 한참 멍했어" → story
- "방이 계속 나와, 끝이 없어" → explore

### draw2 — 끌리는 것 B

**draw2-a** `choice` · 방탈출이 끝났다. 제일 오래 남는 기억은?
- 갑자기 튀어나온 그 장면 → thrill
- 끝까지 안 풀리다 풀린 그 문제 → brain
- 마지막에 읽은 편지 한 줄 → story
- 벽이 통째로 열리던 순간 → explore

**draw2-b** `choice` · 방탈출 테마를 직접 만든다면?
- 불 꺼진 폐병원 → thrill
- 단서만 백 개인 탐정 사무소 → brain
- 한 사람의 인생을 따라가는 방 → story
- 방이 일곱 개 이어지는 유적 → explore

**draw2-c** `choice` · 이 중 하나만 평생 할 수 있다면?
- 무서운 방만 → thrill
- 문제 어려운 방만 → brain
- 스토리 좋은 방만 → story
- 스케일 큰 방만 → explore

### play1 — 플레이 방식 A

**play1-a** `choice` · 문이 잠겼다. 제일 먼저 하는 행동은?
- 보이는 자물쇠를 일단 다 돌려본다 → rush
- 방 전체를 훑고 단서를 정리한다 → analyze
- 소품과 인테리어부터 구경한다 → savor
- "각자 구역 나누자"고 말한다 → team

**play1-b** `choice` · 타이머가 10분 남았다. 나는?
- 손에 잡히는 대로 다 시도한다 → rush
- 남은 문제를 순서대로 정리한다 → analyze
- 시간보다 엔딩 연출이 더 궁금하다 → savor
- 누가 뭘 맡을지 빠르게 정한다 → team

**play1-c** `choice` · 방 안에서 나는 주로?
- 먼저 움직이는 사람 → rush
- 가만히 생각하는 사람 → analyze
- 구경하는 사람 → savor
- 정리해서 알려 주는 사람 → team

### play2 — 플레이 방식 B

**play2-a** `choice` · 일행이 한 문제에 5분째 막혔다. 나는?
- 그 사이 다른 자물쇠를 연다 → rush
- 옆에서 같이 처음부터 다시 본다 → analyze +team
- 그동안 방을 한 바퀴 구경한다 → savor
- 지금까지 나온 단서를 모아 공유한다 → team +analyze

**play2-b** `choice` · 방탈출 끝나고 제일 먼저 하는 말은?
- "몇 분 남았어? 기록 몇 등이야?" → rush
- "아까 그 문제 원리가 뭐였냐면" → analyze
- "그 연출 진짜 좋았다, 사진 찍자" → savor
- "너 아까 그거 진짜 잘했어" → team

**play2-c** `choice` · 새 방에 들어가기 직전, 나의 준비는?
- 준비는 무슨, 들어가서 본다 → rush
- 후기로 난이도와 장치 유형을 파악한다 → analyze
- 스포 없이 분위기만 기대한다 → savor +rush
- 역할 분담부터 정한다 → team

### genre — 장르

**genre-a** `choice` · 오늘 딱 한 방만 간다면?
- 공포 / 추리 / 감성 / 모험 / SF / 코믹 (라벨 그대로 값)

**genre-b** `choice` · 영화로 치면 내 취향은?
- 불 끄고 보는 공포 영화 → 공포
- 범인을 맞히는 추리 영화 → 추리
- 휴지가 필요한 감성 영화 → 감성
- 보물을 찾아 떠나는 모험 영화 → 모험
- 우주로 나가는 SF 영화 → SF
- 배꼽 잡는 코미디 영화 → 코믹

**genre-c** `choice` · 방 소개글 첫 줄, 어디에 끌려?
- "이 집에서는 아무도 살아 나오지 못했다" → 공포
- "범인은 이 안에 있다" → 추리
- "10년 전 부치지 못한 편지" → 감성
- "지도의 마지막 조각을 찾아라" → 모험
- "우주선의 산소가 60분 남았다" → SF
- "사장님 몰래 야근 탈출" → 코믹

### fear — 공포 내성

**fear-a** `slider` · 무서움, 어디까지 괜찮아요? (1 "하나도 안 무섭게" ~ 5 "심장 쫄깃 대환영")

**fear-b** `binary` · 둘 중 하나만 갈 수 있다면?
- 귀신이 직접 나오는 방 → 4
- 귀신 이야기만 나오는 방 → 2

**fear-c** `choice` · 복도 끝에서 발소리가 다가온다. 나는?
- 일행 뒤로 숨는다 → 1
- 눈 감고 지나가길 기다린다 → 2
- 움찔하고 하던 걸 계속한다 → 3
- 놀라지만 그게 재밌다 → 4
- 소리 나는 쪽으로 간다 → 5

### difficulty — 선호 난이도

**difficulty-a** `slider` · 난이도는 어느 정도가 좋아? (1 "술술 풀리게" ~ 5 "머리 쥐어뜯게")

**difficulty-b** `binary` · 어느 쪽이 더 억울해?
- 너무 쉬워서 20분 만에 나온 방 → 4
- 너무 어려워서 절반도 못 간 방 → 2

**difficulty-c** `choice` · 한 문제에 15분째 막혔다. 솔직한 심정은?
- 집에 가고 싶다 → 1
- 슬슬 지친다 → 2
- 그럴 수 있지 → 3
- 이 맛에 한다 → 4
- 더 어려워도 된다 → 5

### hint — 힌트 성향

**hint-a** `choice` · 막히면 힌트, 쓰는 편?
- 절대 안 쓰고 버틴다 → 1
- 정말 최후에만 → 2
- 적당히 쓰는 편 → 3
- 막히면 바로바로 → 4
- 힌트 뭐 어때, 다 쓴다 → 5

**hint-b** `binary` · 힌트 버튼 앞에서 나는?
- 끝까지 버틴다 → 2
- 시간이 아깝다, 누른다 → 4

**hint-c** `slider` · 힌트 없이 얼마나 버텨? (1 "1분이면 누른다" ~ 5 "끝까지 안 누른다")
- 값을 뒤집어 저장한다: 슬라이더 1 → hint 5, 슬라이더 5 → hint 1

### atmosphere — 분위기

**atmosphere-a** `choice` · 어떤 분위기가 끌려?
- 어둡고 으스스한 → dark
- 밝고 화사한 → bright
- 낡고 퇴폐적인 → grungy
- 웅장하고 판타지 같은 → epic
- 아기자기 귀여운 → cute

**atmosphere-b** `choice` · 방 조명을 내가 고른다면?
- 촛불 하나 → dark
- 햇살 드는 창 → bright
- 깜빡이는 형광등 → grungy
- 스테인드글라스 → epic
- 알전구 가랜드 → cute

**atmosphere-c** `choice` · 하룻밤 묵어야 한다면?
- 안개 낀 숲속 산장 → dark
- 바닷가 하얀 집 → bright
- 문 닫은 놀이공원 → grungy
- 오래된 성 → epic
- 인형 가득한 다락방 → cute

### players — 인원

**players-a** `choice` · 보통 몇 명이서 가요?
- 혼자 → 1 / 둘이서 → 2 / 3~4명이서 → 4 / 5명 이상 → 5 / 그때그때 달라 → 0

**players-b** `choice` · 방탈출 단톡방, 이상적인 인원은?
- 단톡방 없음, 혼자 간다 → 1
- 둘이면 충분하다 → 2
- 서너 명이 딱이다 → 4
- 많을수록 좋다 → 5
- 모이는 대로 → 0

**players-c** `choice` · 방 안이 제일 재밌는 순간은?
- 혼자 조용히 풀어낼 때 → 1
- 둘이 눈빛만으로 통할 때 → 2
- 서넛이 동시에 다른 걸 풀 때 → 4
- 여럿이 한꺼번에 소리 지를 때 → 5
- 인원은 상관없다 → 0

### time — 플레이 시간

**time-a** `choice` · 플레이 시간은 어느 정도가 좋아?
- 40분 이내로 후다닥 → short
- 60분 정도 → normal
- 75분쯤 넉넉하게 → long
- 90분 이상 길게 → extra
- 상관없어 → any

**time-b** `binary` · 둘 중 고른다면?
- 짧고 굵은 45분 → short
- 느긋하게 즐기는 80분 → long

**time-c** `choice` · 탈출했는데 직원이 말한다. "사실 방이 하나 더 있어요."
- 이미 지쳤다 → short
- 딱 여기까지가 좋았다 → normal
- 오, 좋아요 → long
- 두 개 더 있어도 된다 → extra
- 재밌으면 다 좋다 → any

## 7. 유형 16개

이름과 한 줄 설명은 초안이다. 운영자가 고쳐도 판정 로직에는 영향이 없다.

| ID | 이름 | 한 줄 설명 |
|---|---|---|
| `thrill-rush` | 공포방 돌격대장 | 무서울수록 먼저 들어가. 비명은 지르지만 발은 안 멈춰. |
| `thrill-analyze` | 침착한 퇴마사 | 귀신이 나와도 단서부터 챙겨. 놀라는 건 탈출하고 나서. |
| `thrill-savor` | 호러 연출 수집가 | 문제보다 연출이 먼저야. 소름 돋는 장면을 모으러 다녀. |
| `thrill-team` | 비명 합창단장 | 혼자는 못 가도 같이면 어디든 가. 같이 놀라는 게 제일 재밌어. |
| `brain-rush` | 자물쇠 폭격기 | 생각보다 손이 빨라. 되는 번호가 나올 때까지 돌려. |
| `brain-analyze` | 노힌트 명탐정 | 힌트는 자존심이 허락 안 해. 끝까지 직접 풀어내. |
| `brain-savor` | 장치 감별사 | 문제가 풀리는 순간보다 장치가 움직이는 순간이 좋아. |
| `brain-team` | 작전 참모 | 누가 뭘 풀지 정리해 주는 사람. 팀의 속도가 달라져. |
| `story-rush` | 급전개 직진러 | 다음 장면이 궁금해서 못 참아. 결말을 향해 직진해. |
| `story-analyze` | 복선 회수꾼 | 흘린 떡밥을 다 기억해. 마지막에 전부 이어 붙여. |
| `story-savor` | 과몰입 주인공 | 방에 들어가면 그 사람이 돼. 엔딩에서 제일 오래 서 있어. |
| `story-team` | 눈물 나눔 메이트 | 좋은 이야기는 같이 봐야 해. 끝나고 수다가 본편이야. |
| `explore-rush` | 문 다 여는 개척자 | 열 수 있는 건 다 열어 봐. 새 공간이 제일 큰 보상이야. |
| `explore-analyze` | 지도 그리는 탐사대원 | 방 구조부터 머리에 넣어. 어디에 뭐가 있었는지 다 기억해. |
| `explore-savor` | 세계관 여행자 | 탈출보다 구경이야. 다른 세계에 온 기분이 좋아서 가. |
| `explore-team` | 원정대 대장 | 스케일 큰 방일수록 사람을 모아. 다 같이 넘는 게 재밌어. |

말투는 마스코트 탈출귀의 반말을 따른다(기존 화면과 같음).

### 세부 성향

유형 아래에 막대 다섯 개로 보여 준다.

| 항목 | 값 | 표시 |
|---|---|---|
| 공포 내성 | `fear` 1~5 | 5칸 막대 + 기존 `fearTrait()` 문구 |
| 선호 난이도 | `difficulty` 1~5 | 5칸 막대 |
| 힌트 | `hint` 1~5 | 5칸 막대, 양끝 "버틴다 ↔ 바로 쓴다" |
| 인원 | `players` | "혼자 / 2인 / 3~4인 / 5인 이상 / 상관없음" 글자 |
| 플레이 시간 | `time` | "40분 / 60분 / 75분 / 90분 이상 / 상관없음" 글자 |

## 8. 화면

### 퀴즈 진행

- 문항 수 숫자와 단계 점을 없앤다.
- 진행은 문 그림으로만 보여 준다. `door.png` 위에 `door-open.png`를 겹치고, 답할수록 열린 문의 불투명도를 올린다(0 → 1). 마지막 문항에서 완전히 열린다.
- 스크린리더용으로 `role="progressbar"`와 `aria-valuenow`(퍼센트)는 유지한다. 화면에는 숫자를 그리지 않는다.
- `choice`는 지금의 선택지 목록 모양을 유지한다. `binary`는 카드 두 장을 나란히(모바일은 위아래로), `slider`는 기존 `.candy-range` 스타일을 쓰고 아래에 "이걸로" 버튼을 둔다.
- 지금 있는 "← 이전 질문" 버튼은 유지한다. 돌아가도 뽑힌 질문은 바뀌지 않는다.

### 결과

위에서부터: 유형 그림 → 이름 → 한 줄 설명 → 세부 성향 → 추천 테마 4개(기존) → 어울리는 브랜드(기존) → 다시 하기 / 지역·취향 분석 링크(기존).

- 그림은 `public/types/<유형ID>.png`. 둥근 사각 틀에 꽉 채워 보여 주고, 파일이 없으면 같은 틀 안에 탈출귀 이모지를 크게 보여 준다(`onError`로 대체).
- 분석 중 연출(문구가 바뀌는 로딩)은 유지하되 AI 호출을 기다리지 않으므로 고정 시간(약 1.5초)으로 줄인다.

### 그 밖

- 홈 히어로(`components/LoggedOutCTA.tsx`)의 "6문항으로"에서 숫자를 뺀다: "탈출귀가 방탈출 취향을 진단하고 딱 맞는 방까지 추천해줘."
- `lib/ai.ts`의 프롬프트와 `/api/persona` 스텁은 이번에 손대지 않는다.

## 9. 코드 구조

`lib/quiz.ts`를 폴더로 나눈다. 바깥에서는 지금처럼 `@/lib/quiz`로 가져온다.

| 파일 | 역할 |
|---|---|
| `lib/quiz/slots.ts` | 슬롯 ID, 값 타입, `QuizValues`(슬롯별 값 + 플레이 방식 보조 점수 묶음) |
| `lib/quiz/questions.ts` | 질문 33개 데이터 (슬롯, 변형 ID, 형식, 문장, 선택지 → 값·보조 점수) |
| `lib/quiz/pick.ts` | `pickQuestions(lastVariantIds, random)` — 슬롯마다 하나씩 뽑고 순서를 정함 |
| `lib/quiz/score.ts` | `determineType(values)`, `quizToTaste`, `focusTagsOf`, `quizPrefs`, `brandAffinity` |
| `lib/quiz/types.ts` | 유형 16개 데이터, `MASCOT` |
| `lib/quiz/index.ts` | 위를 다시 내보냄 |

화면도 나눈다(`app/quiz/page.tsx`는 지금 322줄).

| 파일 | 역할 |
|---|---|
| `app/quiz/page.tsx` | 단계 전환과 상태만 |
| `components/quiz/QuestionView.tsx` | 형식에 따라 `choice` / `binary` / `slider` 렌더 |
| `components/quiz/DoorProgress.tsx` | 문 진행 연출 |
| `components/quiz/QuizResult.tsx` | 유형 카드 + 세부 성향 + 추천 |

### 기존 함수와의 호환

- `quizToTaste`, `focusTagsOf`, `quizPrefs`, `brandAffinity`는 인자가 `QuizAnswers`(문항 → 선택 번호)에서 `QuizValues`(슬롯 → 값)로 바뀐다. 반환 형태는 그대로라 `recommend()`는 수정하지 않는다.
- 포커스 태그는 지금 `focus` 문항에서 오는데, 그 문항이 없어지므로 유형에서 파생한다: `thrill`·`explore` → `staging`, `brain` → `device`, `story` → `story`. 여기에 `team`이면 `coop`, `savor`면 `cozy`를 더한다. `FOCUS_TAGS` 표는 그대로 쓴다.
- `brandAffinity`가 보던 "활동파/돌격파"는 `play === "rush"`로 바꾼다.
- `buildPersona`와 페르소나 조합표(`ARCHETYPE_COMBOS`, `specialPersona`, `playStyle`, `moodLine`, `partyLine` 등)는 삭제한다.

### 저장

- 키는 `escapelog:quiz:v1` 그대로 쓴다. 친구 궁합이 읽는 `taste`의 형태가 바뀌지 않기 때문이다.
- `SavedQuiz`에 `typeId`와 `values`(`QuizValues`)를 추가한다. `persona.title`·`emoji`·`blurb`에는 유형 이름·탈출귀 이모지·한 줄 설명을 넣는다. `answers`는 선택 필드로 바꾸고 새로 저장할 때는 쓰지 않는다.
- 예전 저장분에는 `typeId`가 없다. 지금 저장된 결과를 다시 보여 주는 화면은 없으므로 별도 이관은 하지 않는다.

## 10. 유형 그림 프롬프트

- 파일: `public/types/<유형ID>.png`, 정사각형, 1024px 이상.
- 배경까지 그려진 장면 그림을 쓴다(운영자가 만든 시안 기준: 수채화풍, 어두운 실내 + 따뜻한 등불). 결과 화면은 둥근 사각 틀에 꽉 채워 보여 준다.
- 아래 공통 문구의 "transparent background"는 시안에서 지켜지지 않았고, 배경 있는 쪽이 채택됐다. 새로 만들 때는 그 구절을 "dim cozy interior background lit by a warm oil lamp"로 바꿔 쓴다.

**공통 문구** (모든 프롬프트 앞에 붙인다)

```
Hand-painted storybook illustration, warm watercolor and gouache texture, thick dark-brown outline, soft golden highlights, cozy fairy-tale mood. A small cute white ghost mascot with big round black eyes and a tiny pink tongue sticking out, chubby and friendly, not scary. Single centered subject, full body, plain transparent background, no text, no letters, no frame, square 1:1.
```

**유형별 문구** (공통 문구 뒤에 붙인다)

| ID | 문구 |
|---|---|
| `thrill-rush` | The ghost charging forward through a dark doorway holding a lit lantern high, mouth open mid-shout, cobwebs flying behind it. |
| `thrill-analyze` | The ghost calmly reading a paper talisman with a magnifying glass while a spooky shadow hand reaches from behind, the ghost unbothered. |
| `thrill-savor` | The ghost happily taking a photo with a small vintage camera of a creepy porcelain doll on a shelf, sparkles of delight around it. |
| `thrill-team` | Three small ghosts hugging each other tightly and screaming together in fright, the middle one grinning. |
| `brain-rush` | The ghost surrounded by a pile of opened padlocks and number dials, spinning one more combination lock at high speed, motion lines. |
| `brain-analyze` | The ghost wearing a deerstalker detective hat, arms crossed proudly, a tangle of red string connecting clue cards behind it. |
| `brain-savor` | The ghost admiring an intricate brass clockwork mechanism with turning gears, eyes wide with wonder, one hand gently touching a gear. |
| `brain-team` | The ghost standing at a small table pointing at a hand-drawn map with a baton, two tiny ghosts listening on either side. |
| `story-rush` | The ghost running while flipping the pages of an open storybook, loose pages trailing behind in the air. |
| `story-analyze` | The ghost holding several torn letter pieces and fitting them together like a puzzle, a quill and ink bottle beside it. |
| `story-savor` | The ghost wearing a small theatrical cape and crown, one hand on its chest in a dramatic pose under a soft spotlight. |
| `story-team` | Two ghosts sitting side by side sharing one handkerchief, both teary-eyed and smiling, an opened envelope between them. |
| `explore-rush` | The ghost pushing open a heavy stone door with both hands, bright golden light pouring through the gap, dust flying. |
| `explore-analyze` | The ghost unrolling a long parchment map and marking it with a pencil, a small brass compass floating nearby. |
| `explore-savor` | The ghost with a tiny backpack standing in awe, looking up at a miniature fantasy castle floating in a glass snow globe. |
| `explore-team` | The ghost at the front holding a small flag, leading a line of three smaller ghosts with backpacks up a stone staircase. |

## 11. 테스트

`vitest`를 개발 의존성으로 추가하고 `npm test` 스크립트를 만든다. 화면은 테스트하지 않고 `lib/quiz`의 순수 함수만 다룬다.

- 슬롯 11개 모두 변형이 정확히 3개씩 있다.
- 모든 선택지의 값이 그 슬롯의 값 범위 안에 있다. `binary`는 선택지가 2개, `slider`는 1~5다.
- `pickQuestions`는 슬롯마다 하나씩 11개를 돌려주고, 첫 문항은 `draw1`이며, 넘겨준 직전 변형을 뽑지 않는다.
- `determineType`은 `draw1`×`draw2`×`play1`×`play2`×`genre`×`hint`의 모든 조합에서 16개 중 하나를 돌려준다.
- 같은 `QuizValues`면 어떤 변형에서 왔든 같은 유형이다(변형 ID가 판정에 쓰이지 않음을 확인).
- 동점 규칙: `draw1`과 `draw2`가 다르고 장르 보너스가 없으면 `draw1`이 이긴다. `play`도 같다.
- `quizToTaste`가 돌려주는 형태가 `recommend()`가 받는 `TasteProfile`과 맞는다.
- `hint-c` 슬라이더 값이 뒤집혀 저장된다.

화면은 수동으로 확인한다: 두 번 연속 진행해 질문이 모두 바뀌는지, 세 형식이 모바일·데스크톱에서 잘 눌리는지, 그림 파일이 없을 때 대체 표시가 나오는지, 결과 저장 뒤 친구 궁합이 그대로 동작하는지.

## 12. 범위 밖

- 유형별 비율·희귀도, 결과 주소, 공유 이미지, 궁합 연결 (2단계)
- 추천 로직 변경, 지역 필터, 추천 이유 (3단계)
- 이미지 고르기 형식 질문, 분기형 후속 질문
- AI 진단 문구 복구 (`/api/persona`를 실제 핸들러로 되돌리는 일)
- 결과를 계정에 저장하는 일
