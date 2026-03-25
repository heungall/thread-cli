# 요구사항 정의서 — THREADS.TERMINAL

> Threads SNS를 터미널 UI로 읽고 쓰는 웹 클라이언트  
> 버전: v1.0 MVP  
> 작성일: 2026-03-24

---

## 1. 프로젝트 개요

### 1.1 한 줄 정의
Threads SNS의 공식 API를 통해 피드를 읽고 게시물을 작성하는 **터미널 스타일 웹 클라이언트**.  
이 서비스는 Threads와 사용자 사이의 **UI 레이어**이며, 데이터는 모두 Threads에 저장된다.

### 1.2 핵심 컨셉
- 피드: 코드 에디터처럼 게시물을 파싱해서 보여줌
- 작성: CLI 명령어 입력하듯 게시물 작성
- 인증: 각자 자기 Threads 계정으로 OAuth 로그인

### 1.3 목표 사용자
Threads를 사용하는 누구나 — 개발자 감성의 UI를 선호하는 사람

---

## 2. 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| Frontend | Next.js 14 (App Router) | TypeScript |
| Styling | Tailwind CSS | Terminal / ABAP 테마, CSS 변수 기반 |
| Backend | Next.js API Routes | 서버리스 |
| Auth | Threads OAuth 2.0 | Meta 공식 API |
| DB | Supabase (PostgreSQL) | 세션/유저 캐시용 |
| 배포 | Vercel | CI/CD 자동화 |

### 2.1 Threads API 주요 엔드포인트
```
GET  /me/threads              → 내 게시물 피드
GET  /me/replies              → 내 댓글
POST /me/threads              → 게시물 작성 (2단계: create → publish)
POST /threads/{id}/likes      → 좋아요
DELETE /threads/{id}/likes    → 좋아요 취소
POST /threads/{id}/reply      → 댓글 달기
GET  /threads/{id}/replies    → 댓글 목록
GET  /threads/{id}/insights   → 통계 (likes, replies, reposts, quotes)
```

> ⚠️ `like_count`, `replies_count`, `repost_count`는 post 직접 필드가 아님.
> 통계는 `/{id}/insights?metric=likes,replies,reposts,quotes` 로 별도 조회 필요.

---

## 3. 페이지 구조 (라우팅)

```
/                   → 랜딩 페이지 (로그인 유도)
/auth/callback      → Threads OAuth 콜백 처리
/feed               → 메인 피드 (로그인 필요)
/compose            → 게시물 작성 (또는 피드 내 인라인)
/profile            → 내 프로필 + 내 게시물 목록
```

---

## 4. 기능 요구사항

### 4.1 인증 (AUTH)

| ID | 기능 | 우선순위 |
|---|---|---|
| AUTH-01 | Threads OAuth 2.0 로그인 버튼 | P0 |
| AUTH-02 | 로그인 후 access_token Supabase에 암호화 저장 | P0 |
| AUTH-03 | token 만료 시 자동 refresh 또는 재로그인 유도 | P0 |
| AUTH-04 | 로그아웃 (세션 삭제) | P0 |

**로그인 화면 UX:**
```
┌─────────────────────────────────────┐
│  THREADS.TERMINAL v1.0              │
│  ─────────────────────────────────  │
│                                     │
│  > Threads 계정으로 로그인하세요.   │
│                                     │
│  [ LOGIN WITH THREADS ↗ ]           │
│                                     │
└─────────────────────────────────────┘
```

---

### 4.2 피드 (FEED)

| ID | 기능 | 우선순위 |
|---|---|---|
| FEED-01 | 로그인한 사용자의 홈 피드 조회 | P0 |
| FEED-02 | 게시물을 터미널 스타일 카드로 렌더링 | P0 |
| FEED-03 | 무한 스크롤 또는 페이지네이션 (cursor 기반) | P1 |
| FEED-04 | 피드 수동 새로고침 (`r` 키 또는 버튼) | P1 |

**피드 카드 UI 컨셉:**
```
┌─────────────────────────────────────────────────┐
│ // @username · 2h ago                           │
│ ─────────────────────────────────────────────── │
│ const post = {                                  │
│   0: "오늘 처음으로 새벽 5시에 일어났다.",      │
│   1: "커피 한 잔이 이렇게 감사할 줄이야 ☕️",   │
│ }                                               │
│                                                 │
│ #미라클모닝  #자기계발                          │
│ ─────────────────────────────────────────────── │
│ ♡ 284   ↩ 42   ⟳ 11                            │
└─────────────────────────────────────────────────┘
```

**렌더링 규칙:**
- 본문 줄바꿈 → `0: "...", 1: "..."` 형식으로 파싱
- `#해시태그` → 초록색 하이라이트
- `@멘션` → 파란색 하이라이트
- 이모지 → 그대로 표시
- 링크 → `<a href>` 처리
- **이미지/미디어 → 렌더링 안 함** (이미지가 첨부된 게시물도 텍스트만 표시)
  - 이미지가 있을 경우 카드 하단에 `// [media: image × N]` 형태로 메타 표기만
  - 예: `// [media: image × 2]`

---

### 4.3 게시물 작성 (COMPOSE)

| ID | 기능 | 우선순위 |
|---|---|---|
| COMPOSE-01 | CLI 스타일 입력창 (터미널 프롬프트 UI) | P0 |
| COMPOSE-02 | `Shift + Enter` → 줄바꿈 | P0 |
| COMPOSE-03 | `Enter` → 게시물 발행 | P0 |
| COMPOSE-04 | 글자 수 카운터 (500자 제한, Threads 기준) | P0 |
| COMPOSE-05 | 발행 전 미리보기 (파싱된 카드 형태로) | P1 |
| COMPOSE-06 | 발행 중 로딩 인디케이터 (`> publishing...`) | P0 |
| COMPOSE-07 | 발행 성공/실패 메시지 터미널 스타일 출력 | P0 |

**작성창 UX:**
```
┌─────────────────────────────────────────────────┐
│ root@threads:~$ new_post                        │
│ ─────────────────────────────────────────────── │
│ > |                                             │
│                                                 │
│                                                 │
│ ─────────────────────────────────────────────── │
│ [Shift+Enter] 줄바꿈   [Enter] 발행   0 / 500  │
└─────────────────────────────────────────────────┘
```

---

### 4.4 좋아요 / 반응 (LIKE)

| ID | 기능 | 우선순위 |
|---|---|---|
| LIKE-01 | 게시물 좋아요 토글 | P0 |
| LIKE-02 | 좋아요 수 실시간 반영 (Optimistic UI) | P1 |

---

### 4.5 댓글 (REPLY)

| ID | 기능 | 우선순위 |
|---|---|---|
| REPLY-01 | 게시물에 댓글 달기 | P0 |
| REPLY-02 | 댓글 목록 펼치기/접기 | P1 |
| REPLY-03 | 댓글 입력도 CLI 스타일 (Shift+Enter 줄바꿈) | P0 |

---

## 5. 비기능 요구사항

| 항목 | 요구사항 |
|---|---|
| 성능 | 피드 최초 로딩 3초 이내 |
| 보안 | access_token 서버사이드에서만 처리 (클라이언트 노출 금지) |
| 반응형 | 모바일 대응 (375px 이상) |
| 브라우저 | Chrome, Safari, Firefox 최신 버전 |
| 접근성 | 키보드 네비게이션 지원 |

---

## 6. 환경변수 목록

```env
# Threads API (Meta Developer Console에서 발급)
THREADS_APP_ID=
THREADS_APP_SECRET=
THREADS_REDIRECT_URI=https://yourdomain.com/auth/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 앱 설정
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 7. Supabase DB 스키마

```sql
-- 유저 테이블 (Threads 계정 정보 캐시)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_user_id TEXT UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  profile_pic_url TEXT,
  access_token TEXT NOT NULL,        -- 암호화 저장 권장
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 세션 테이블 (next-auth 또는 커스텀)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. 디렉토리 구조 (권장)

```
threads-terminal/
├── app/
│   ├── page.tsx                  # 랜딩
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth 콜백
│   ├── feed/
│   │   └── page.tsx              # 메인 피드
│   └── profile/
│       └── page.tsx
├── components/
│   ├── terminal/
│   │   ├── PostCard.tsx          # 게시물 카드
│   │   ├── ComposeBox.tsx        # 작성창
│   │   ├── FeedList.tsx          # 피드 목록
│   │   └── TerminalHeader.tsx    # 상단 터미널 헤더
│   └── ui/                       # 공통 컴포넌트
├── lib/
│   ├── threads-api.ts            # Threads API 클라이언트
│   ├── supabase.ts               # Supabase 클라이언트
│   └── auth.ts                   # 인증 헬퍼
├── app/api/
│   ├── feed/route.ts             # 피드 조회 API
│   ├── post/route.ts             # 게시물 작성 API
│   ├── like/route.ts             # 좋아요 API
│   └── reply/route.ts            # 댓글 API
└── styles/
    └── terminal.css              # 터미널 테마 CSS
```

---

## 9. MVP 개발 순서

```
Phase 1 — 기반 ✅
  ├── Next.js 14 프로젝트 세팅 + Vercel 연결 (GitHub CI/CD)
  ├── Supabase 세팅 + DB 스키마 적용
  └── Threads OAuth 로그인 구현

Phase 2 — 피드 ✅
  ├── Threads API 클라이언트 구현
  ├── 피드 조회 API Route (커서 기반 페이지네이션)
  └── 터미널 스타일 PostCard + FeedList 컴포넌트

Phase 3 — 작성 ✅
  ├── ComposeBox 컴포넌트 (Enter 발행, Shift+Enter 줄바꿈, 500자 카운터)
  └── 게시물 발행 API Route (2단계: create → publish)

Phase 4 — 인터랙션 ✅
  ├── 좋아요 토글 (Optimistic UI)
  ├── 통계 (Insights API, 클릭 시 로드)
  └── 댓글 목록 보기 + 댓글 달기 (ReplySection)

Phase 4.5 — UI 커스터마이징 ✅ (추가)
  ├── 폰트 선택 (D2Coding / 둥근모, localStorage 유지)
  └── 테마 선택 (Terminal 다크 / ABAP 라이트, localStorage 유지)

Phase 5 — 마무리
  ├── 반응형 대응 (375px+)
  ├── 에러 핸들링 정리
  └── Vercel 프로덕션 배포 (앱 심사 후 rate limit 확대)
```

---

## 10. 주요 제약사항 / 참고사항

- **Threads API Rate Limit**: 기본 200 req/hour (앱 심사 후 확대 가능)
- **게시물 발행 2단계**: Threads API는 `create_media` → `publish` 두 단계로 나뉨
- **access_token 보안**: 클라이언트에 절대 노출 금지, 모든 API 호출은 서버사이드에서 처리
- **Threads API 공식 문서**: https://developers.facebook.com/docs/threads

## 11. 보안 요구사항

- access_token → Supabase 저장 전 AES-256 암호화 (ENCRYPTION_KEY 환경변수로 관리)
- Supabase RLS 활성화 → users 테이블은 본인 row만 접근 가능
- 클라이언트에는 세션 쿠키만 전달, token은 절대 노출 금지
---

*이 문서는 Claude Code 작업 시작 전 컨텍스트로 사용하세요.*