# 탈깍노트 이름 바꾸기

> **2026-11-19 추가:** 이름을 탈깍노트 → **방탈깍노트**로 한 번 더 바꿨다(검색어 "방탈"). 주소·인스타 아이디는 그대로. 사이트 이름(lib/site.ts SITE_NAME)·제목·OG 이미지·인스타 템플릿·캡션·해시태그(#방탈깍노트)만 바꿈. 인스타 이름 칸은 운영자가 직접.

운영자 결정(2026-11-15): 같은 이름 "방탈로그"(bangtalog.com · @bangtalog · 플레이스토어 앱)가 먼저 있어서
**탈깍노트**로 바꾼다. (탈깍 = 자물쇠가 "딸깍" 열리는 소리 + 탈출)

| 어디 | 새 표기 |
|---|---|
| 브랜드 | 탈깍노트 |
| 인스타 아이디 / 이름 칸 | @bangtalkkak.note / 탈깍노트 \| 방탈출 기록·추천 (이름 칸은 14일 제한 때문에 11월 말에) |
| 해시태그 | #탈깍노트 |
| 도메인 | talkkaknote.com (Vercel 에서 구입) |
| 예전 주소 | bangtallog.com · www.bangtallog.com → 301 로 새 주소(만료 2027-11-11까지) |

## 코드(작업 브랜치에 끝내 둠)
- 사이트 이름·로고·페이지 제목·OG 이미지·카드/시트/결산 이미지에 찍히는 이름과 주소(`lib/site.ts` SITE_HOST)
- `lib/site.ts` CANONICAL_URL = https://talkkaknote.com, LEGACY_HOSTS 에 bangtallog.com 추가 → middleware 가 301
- 인스타 템플릿·캡션·해시태그·릴스(영안실·춘화각·성지·영수증) 새 이름
- **main 에 올리는 건 talkkaknote.com 이 Vercel 에 연결된 뒤**(먼저 올리면 bangtallog.com 이 아직 없는 주소로 넘어가 사이트가 안 열린다)

## 도메인 바꾸는 날 순서
1. Vercel → Domains → Buy → talkkaknote.com (자동 갱신 켜기)
2. 프로젝트 → Settings → Domains → **Add Domain** → talkkaknote.com → Production (www 도 추가). 기존 bangtallog.com 줄은 **그대로 둔다**(고치지 말 것 — 넘기기는 코드가 한다)
3. 새 주소가 Valid Configuration 이 되면 → main 에 올리기(배포 2~3분)
4. Supabase → Authentication → URL Configuration
   - Site URL: https://talkkaknote.com
   - Redirect URLs 에 https://talkkaknote.com/** 추가(예전 주소 줄은 한동안 남겨 둔다)
5. 구글 서치 콘솔: 속성 추가(도메인 talkkaknote.com, DNS TXT 는 Vercel DNS 에) → 예전 속성(bangtallog.com) 설정 → **주소 변경** → 새 속성 선택 → 사이트맵 https://talkkaknote.com/sitemap.xml 제출
6. 네이버 서치어드바이저: 사이트 추가 talkkaknote.com → HTML 태그 인증값을 Vercel 환경변수 NEXT_PUBLIC_NAVER_SITE_VERIFICATION 에 넣고 다시 배포(또는 값을 알려 주면 코드 기본값으로) → 사이트맵·RSS 제출 → 예전 사이트는 '사이트 이전' 메뉴가 있으면 신청
7. Vercel 환경변수 NEXT_PUBLIC_SITE_URL 이 있으면 https://talkkaknote.com 으로(없으면 그냥 둬도 됨)
8. 메일(Resend): 새 도메인 인증은 나중에 해도 된다. 그 전까지 보내는 주소는 no-reply@bangtallog.com 그대로. 인증하면 Supabase SMTP Sender 를 no-reply@talkkaknote.com 으로, 템플릿 `docs/email-reset-password.md` 붙여 넣기
9. 인스타: 아이디 bangtalkkak.note(지금), 이름 칸·소개·프로필 링크 https://talkkaknote.com (이름 칸은 14일 뒤)
10. 인스타 공지 게시물 "방탈로그가 탈깍노트로 이름을 바꿨어요" (평일)
