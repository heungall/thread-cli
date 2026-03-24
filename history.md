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

### 10. auth_failed (현재 미해결)
**에러:** 로그인 후 `// error: auth_failed` 표시
**원인 추정:** Vercel 환경변수 미설정으로 token exchange 또는 Supabase 연결 실패
**확인 방법:** Vercel → Deployments → Functions → `/auth/callback` 로그 확인
**상태:** 조사 중

---

## 지금 해야 할 것

### 즉시 (auth_failed 해결)
1. **Vercel 환경변수 확인**
   - Vercel → Project → Settings → Environment Variables
   - `.env.local`의 모든 값이 Vercel에도 동일하게 등록되어 있는지 확인
   - 등록 후 반드시 Redeploy 필요

2. **Vercel 함수 로그 확인**
   - Vercel → Deployments → 최신 배포 → Functions 탭
   - `/auth/callback` 호출 로그에서 실제 에러 메시지 확인

3. **Supabase 스키마 확인**
   - Supabase Dashboard → Table Editor
   - `users`, `sessions` 테이블이 실제로 생성되어 있는지 확인
   - 없으면 `supabase/schema.sql` 다시 실행

---

### auth_failed 해결 후 — Phase 2
- Threads API 피드 조회 (`/api/feed/route.ts`)
- 터미널 스타일 PostCard 컴포넌트
- FeedList 컴포넌트 (무한 스크롤)
- `/feed` 페이지 완성

### Phase 3
- ComposeBox 컴포넌트 (Shift+Enter 줄바꿈, Enter 발행)
- 게시물 발행 API Route

### Phase 4
- 좋아요 토글
- 댓글 달기

### Phase 5
- 반응형 대응 (375px+)
- 에러 핸들링 정리
- 프로덕션 배포
