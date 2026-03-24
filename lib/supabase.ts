import { createClient } from "@supabase/supabase-js";

// 서버 사이드용 (service role key — API Route에서만 사용)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export type User = {
  id: string;
  threads_user_id: string;
  username: string | null;
  display_name: string | null;
  profile_pic_url: string | null;
  access_token: string;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
};
