-- THREADS.TERMINAL — Supabase DB 스키마
-- Supabase Dashboard > SQL Editor에서 실행하세요.

-- 유저 테이블 (Threads 계정 정보 캐시)
CREATE TABLE IF NOT EXISTS users (
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

-- 세션 테이블
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 만료된 세션 자동 정리 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_users_threads_id ON users(threads_user_id);

-- RLS(Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- service_role은 모든 접근 허용 (API Routes에서 service role key 사용)
-- anon/authenticated 는 접근 불가 (access_token 보호)
CREATE POLICY "service_role_all_users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_sessions" ON sessions
  FOR ALL USING (auth.role() = 'service_role');
