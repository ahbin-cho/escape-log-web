# 클로드 도구 참고 목록 (운영자가 모아 둔 것)

운영자가 2026-11-13 에 보내 준 정리 그림(@mini_ai_ "클로드 분야별 필수 도구 50개")과 대화에서 나온 목록을 옮겨 적었다.
**확인 안 된 목록이다.** 이름만 옮겼고, 실제로 있는지·안전한지·어디서 받는지는 확인하지 않았다. 설치 전에 출처(깃허브 저장소·만든 사람)를 꼭 확인할 것.
이 저장소 작업 환경에 실제로 들어 있던 것은 `frontend-design` 하나뿐이었다(2026-11-13).

## 우리 프로젝트에서 먼저 볼 것
| 쓰임 | 도구 | 메모 |
|---|---|---|
| 디자인 방향 | frontend-design, Taste Skill | frontend-design 은 설치돼 있었고 디자인 D 정할 때 씀 |
| 사이트 쓴소리·마무리 | Impeccable, hallmark | 뻔한 구성 걸러내기 |
| 색·글꼴 한 벌 | UI UX Pro Max | |
| 애니메이션 다듬기 | emil-design-eng, apple-design | |
| 올리기 전 검수 | Web Design Guidelines | 접근성·사용성 100개 넘는 기준 |
| 브랜드 톤 | open-design | |
| 인스타 영상 | hyperframes, reels-scripting | 릴스 대본·모션 |
| 검색 노출 | claude-seo | 사이트 SEO 진단 |

디자인 기준은 `docs/design-d.md`, 인스타는 `.claude/skills/ig-*` 가 우리 쪽 기준이다. 위 도구는 보조로만.

## 그림에 있던 분야별 목록
1. **프롬프트**: prompts.chat · grill-me(시키기 전에 클로드가 먼저 질문) · prompt-master · i-have-adhd(답을 짧게 쪼개 받기) · Karpathy Skills
2. **문서·PPT·엑셀**: docx · pptx · xlsx · pdf · book-to-skill
3. **자료조사·요약**: 웹 검색 · Research · Firecrawl · chrome-devtools-mcp · Claude in Chrome
4. **웹 디자인**: UI UX Pro Max · Taste Skill · Impeccable · apple-design · Web Design Guidelines
5. **마케팅·SNS**: Agency Agents · marketingskills · claude-seo · claude-blog · clone-website
6. **영상·음성**: hyperframes · reels-scripting · Higgsfield MCP · ElevenLabs MCP · youtube-transcript
7. **앱 연결·MCP**: Gmail · Google Drive · Notion · Slack · GitHub
8. **자동화**: 예약 작업 · 자동 모드 · Composio MCP · Playwright MCP · agent-browser
9. **개발·코딩**: Context7 · Ponytail · 케이브맨 · code-review · gstack
10. **고급 활용**: ECC · skill-creator · claude-mem · nuwa-skill · superpowers

## 그림에 적힌 요령
- 도구 종류 4가지: 스킬(작업 방법을 파일로) · 플러그인(스킬·에이전트 묶음) · MCP(외부 도구 연결) · 커넥터(내 앱 연결)
- 프롬프트 공식: 역할 · 맥락 · 과제 · 제약 · 형식
- 초보 실수: 원하는 게 안 정해진 채 시작, 한 번에 열 가지 요청, 내 상황 설명 없이 질문, 출처·형식 안 정함, 설치 후 적용됐는지 확인 안 함, 답변 검토 없이 그대로 사용
- 도구 적용 4단계: 내 분야에서 하나 고르기 → 예제 하나 실행 → 결과 확인 → 내 업무에 적용
- Claude Code 명령: /init /clear /compact /model /mcp /agents /skills /review /resume /help

## 같이 받은 다른 자료
- 노션 "Claude 애니메이션 스타일 10가지 — 프롬프트 모음": 같은 장면(9:16, 3초 반복)을 스타일만 바꿔 만드는 프롬프트.
  확인된 스타일 8개: 픽셀 아트 · 칠판 분필 · 글로우 스케치 · PS2 3D · 코믹/팝아트 · 플랫 벡터 · 색종이 스톱모션 · 장난감 CGI.
  쓰임: 비행기 자리에 탈출귀를 넣어 릴스 첫 1~3초 반복 영상으로(HTML → 화면 녹화 → mp4, `tools/ig/record.cjs` 방식).
