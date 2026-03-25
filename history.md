# THREADS.TERMINAL — 작업 히스토리

## Phase 1 셋업 (2026-03-24)

---

### 1. Next.js 프로젝트 초기화 실패
**원인:** `create-next-app`이 기존 `REQUIREMENT.md` 파일 때문에 충돌
**해결:** 수동으로 `package.json`, `tsconfig.json`, `tailwind.config.ts` 등 파일 직접 생성

---

### 2. `next.config.ts` 미지원
**에러:** `Configuring Next.js via 'next.config.ts' is not supported`
**원인:** Next.js 14는 `.ts` 설정 파일 미지원
**해결:** `next.config.ts` → `next.config.mjs` 로 변경

---

### 3. 빌드 시 Supabase 초기화 에러
**에러:** `supabaseUrl is required`
**원인:** `lib/supabase.ts`에서 모듈 로드 시 `createClient()`를 즉시 실행 → env 변수 없으면 빌드 실패
**해결:** 모듈 레벨 초기화 제거, `createServiceClient()` 함수 안으로 이동 (지연 초기화)

---

### 4. Next.js 보안 취약점
**경고:** `next@14.2.29` 보안 취약점 존재
**해결:** `next@14.2.35` (패치 버전)으로 업그레이드

---

### 5. git push 실패
**에러:** `failed to push some refs`
**원인:** remote가 `master`, `origin` 두 개 중복 등록됨
**해결:** `git push origin master` 로 push 성공 → 중복 remote `master` 삭제

---

### 6. Threads OAuth — HTTP 차단
**에러:** `안전하지 않은 로그인이 차단되었습니다 (error_code: 1349187)`
**원인:** Meta Threads OAuth는 `https://`만 허용. `localhost`의 `http://`를 차단
**해결:** Vercel 배포 URL(`https://thread-cli.vercel.app`)로 `THREADS_REDIRECT_URI` 변경

---

### 7. OAuth Redirect URI 화이트리스트 에러
**에러:** `차단된 URL입니다: 리디렉션 URI가 앱 클라이언트 OAuth 설정의 화이트리스트에 없음`
**원인:** Meta Developer Console에 Redirect URI 미등록
**해결 과정:**
- Meta 콘솔 "앱 인증" 섹션 → 저장 안 됨 (네이티브 앱 토글 ON 문제)
- "제거 콜백 URL", "삭제 콜백 URL" 필드가 비어 있어서 저장 불가
- `/api/auth/deauthorize`, `/api/auth/delete` API Route 추가
- "앱 인증 → 콜백 URL 승인" 에도 동일 URL 등록 필요했음

---

### 8. 테스터 초대 미수락
**에러:** `Invalid Request: The user has not accepted the invite to test the app (error_code: 1349245)`
**원인:** 앱이 개발 모드 → 테스터로 등록된 계정만 로그인 가능, 초대 수락 필요
**해결:** Threads 모바일 앱 → 설정 → 계정 → 개발자 초대 에서 수락

---

### 9. 콜백에서 Meta 에러 JSON 노출
**현상:** 에러 발생 시 브라우저에 `{"error_message":"...","error_code":...}` 원문 노출
**원인:** 콜백 핸들러가 `error` 파라미터만 체크, Meta가 보내는 `error_code` / `error_message` 파라미터 미처리
**해결:** `app/auth/callback/route.ts`에서 `error_code`, `error_message` 파라미터 추가 처리 → 랜딩 페이지로 리다이렉트
랜딩 페이지(`app/page.tsx`)에 에러 메시지 표시 추가

---

### 10. auth_failed
**에러:** 로그인 후 `// error: auth_failed` 표시
**원인:** `tokenData.expires_in`이 `undefined` → `new Date(NaN).toISOString()` 에서 `RangeError` 발생
**해결:** `expires_in` 없을 때 기본 60일로 fallback 처리

---

## Phase 2 — 피드 (2026-03-24)

### 구현 완료
- `/api/feed/route.ts` — 세션 인증 후 Threads API 호출
- `PostCard.tsx` — 줄바꿈 `0: "...", 1: "..."` 파싱, `#해시태그` 초록, `@멘션` 파란, 미디어 메타 표기
- `FeedList.tsx` — 초기 로딩, `r` 키 새로고침, "load more" 커서 페이지네이션
- `TerminalHeader.tsx` — 유저명 + logout 버튼

### 트러블
- **로그아웃 후 동일 계정 자동 재로그인** → `threads.net`으로 리다이렉트 (거기서 직접 로그아웃)
- **로그아웃 POST 리다이렉트** → 303 상태코드 + cookie `expires: 0` 으로 명시적 만료

---

## Phase 3 — 게시물 작성 (2026-03-24)

### 구현 완료
- `/api/post/route.ts` — Threads 2단계 발행 (create_media → publish)
- `ComposeBox.tsx` — CLI 스타일 입력창
  - `Enter` 발행 / `Shift+Enter` 줄바꿈
  - 500자 카운터 (50자 이하 노란색, 초과 빨간색)
  - `> publishing...` 로딩, 성공/실패 터미널 메시지
  - 발행 성공 후 `router.refresh()`로 피드 새로고침

---

## Phase 4 — 인터랙션 (2026-03-25)

### 구현 완료
- **댓글 (ReplySection.tsx)**
  - `↩ N개 댓글 ▼` 클릭 → 댓글 목록 펼치기/접기
  - 댓글 목록 조회 (`GET /api/reply?postId=`)
  - 댓글 작성 (`POST /api/reply`) — Enter 발행, Shift+Enter 줄바꿈
  - 발행 후 목록 낙관적 업데이트
- **좋아요 토글 (PostCard)**
  - `♡` / `♥` 토글, 클릭 시 빨간색
  - Optimistic UI (즉시 반영, 실패 시 롤백)
- **통계 (Insights)**
  - `like_count` 등 post 직접 필드 미지원 확인 → Threads insights API 사용
  - 기본 `—` 표시, `[stats ↓]` 클릭 시 `/api/insights?postId=` 호출
  - 좋아요수 / 댓글수 / 리포스트수 표시

---

## 폰트 / 테마 (2026-03-25)

### 폰트
- JetBrains Mono (Google Fonts) 제거 → 시스템 폰트로 변경
- **D2Coding** (네이버, 리가처 버전) + **둥근모** 셀프호스팅
- 헤더 select box로 전환, localStorage 유지

### 테마
- CSS 변수 기반 테마 시스템 (`rgb()` 채널 분리로 opacity 수정자 지원)
- **Terminal** — 다크 (GitHub 스타일)
- **ABAP** — 라이트 (SAP 에디터 스타일: 흰 배경, 검정 텍스트, 파란 키워드, 초록 코멘트)
- 헤더 select box로 전환, localStorage 유지

---

## 남은 작업 (Phase 5)

- 반응형 대응 (375px+)
- 에러 핸들링 정리
- 프로덕션 배포 (앱 심사 후 rate limit 확대)
