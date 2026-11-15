# 탈깍.로그 이름 바꾸기 (준비만 해 둠)

운영자 결정(2026-11-15): 같은 이름 "방탈로그"(bangtalog.com · @bangtalog · 플레이스토어 앱)가 먼저 있어서
**탈깍.로그**로 바꾼다. 인스타 이름 칸을 14일 뒤에야 바꿀 수 있어서, 그때 한 번에 바꾼다.

| 어디 | 새 표기 |
|---|---|
| 브랜드 | 탈깍.로그 (점은 주황 #E49A4A) |
| 인스타 아이디 | @talkkak.log |
| 인스타 이름 칸 | 탈깍.로그 \| 방탈출 기록·추천 |
| 해시태그 | #탈깍로그 (점은 해시태그에 못 씀) |
| 도메인 | talkkak.com (Vercel 에서 구입) |

## 바꾸는 날 순서
1. 인스타: 아이디 → talkkak.log, 이름 → "탈깍.로그 | 방탈출 기록·추천"
2. 사이트 이름: `git apply docs/rebrand/talkkak-site.patch` (이름·로고·OG 이미지·카드 문구, 테스트 통과 확인함)
3. 도메인 연결 후: `lib/site.ts` CANONICAL_URL → https://talkkak.com, LEGACY_HOSTS 에 bangtallog.com·www.bangtallog.com 추가
   (카드·이미지에 찍히는 주소는 SITE_HOST 로 따라 바뀜). Supabase Auth Site URL·Redirect URLs, 네이버·구글 서치 콘솔 새 도메인 등록
4. 인스타 도구: tools/ig 템플릿·pack.py·캡션의 방탈로그/BANGTALLOG/@bangtal_log/#방탈로그/bangtallog.com 일괄 변경
5. CLAUDE.md·HANDOFF 이름 변경
