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

데이터는 **Supabase(Postgres, 무료 티어)** 에 저장됩니다. 로그인(이메일 매직링크) 후
기록이 계정별로 서버에 쌓이고, "공개 후기"는 `/feed` 에서 서로 볼 수 있습니다.
관리자는 `/admin` 에서 추천 카탈로그와 공개 후기를 관리합니다.

▶ **처음 세팅(Supabase 연결·관리자 등록·데이터 보는 법)은 [`DEPLOY.md`](./DEPLOY.md) 참고.**
환경변수(`.env.local`)가 없으면 로그인 기능이 꺼진 채로 화면만 뜹니다.

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

1. MVP — 나만의 기록 앱 ✅
2. 취향 프로필 + 추천 + 스포 수위 슬라이더 ✅
3. **(현재) Supabase 전환 + 로그인 + 공개 후기 피드 + 어드민** ✅
4. 팔로우 · 댓글 · 좋아요 · 카카오 로그인
5. 같이 갈 사람 매칭 (안전장치 먼저)

## 백엔드 (Supabase)

- `lib/store.ts` — 기록 CRUD + 카탈로그 읽기 (Supabase 호출)
- `lib/admin.ts` — 어드민용 카탈로그 CRUD · 후기 숨김/삭제
- `lib/supabase/*` — 브라우저/서버 클라이언트
- `supabase/schema.sql` — 테이블 + RLS + 트리거 + 시드 (SQL Editor에 붙여넣기)
- 설계 문서: `docs/superpowers/specs/2026-07-03-supabase-admin-design.md`
