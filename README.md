# 방탈출 로그 (escape-log-web)

방탈출 경험을 기록·보관하는 아카이빙 MVP. Next.js 14 (App Router) + TypeScript + Tailwind CSS. 반응형.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

## MVP 범위

- 방탈출 기록 작성 / 수정 / 삭제
- 리스트 + 검색 + 장르 필터
- 별점·성공률·평균 별점 통계
- 반응형 (모바일 1열 → 태블릿 2열 → 데스크톱 3열)

데이터는 **브라우저 localStorage**에 저장됩니다(백엔드/비용 0). 처음 열면 예시 기록 2건이 들어갑니다.

## 구조

```
app/
  layout.tsx          공통 레이아웃(헤더/푸터)
  page.tsx            기록 리스트 + 통계 + 검색/필터
  new/page.tsx        새 기록
  edit/[id]/page.tsx  기록 수정/삭제
components/
  RecordForm.tsx      작성/수정 폼
  RecordCard.tsx      리스트 카드
  Stats.tsx           통계
  Stars.tsx           별점 표시
lib/
  store.ts            localStorage CRUD + 타입/상수  ← 백엔드 교체 지점
```

## 다음 단계 (로드맵)

1. **(현재) MVP** — 나만의 기록 앱
2. 취향 프로필 + 추천 + 스포 수위 슬라이더
3. 후기 공개 / 일정 공유
4. 같이 갈 사람 매칭 (안전장치 먼저)

## 백엔드 전환

`lib/store.ts`의 `getRecords / getRecord / saveRecord / deleteRecord` 4개 함수만
Supabase 등 API 호출로 바꾸면 화면 코드는 그대로 재사용됩니다.
`EscapeRecord` 타입이 그대로 DB 스키마가 됩니다.
