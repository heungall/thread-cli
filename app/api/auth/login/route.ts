import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.THREADS_APP_ID!;
  const redirectUri = process.env.THREADS_REDIRECT_URI!;
  const scope = "threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies,threads_manage_insights";

  const authUrl = new URL("https://threads.net/oauth/authorize");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("force_authentication", "1"); // 매번 계정 선택 강제

  return NextResponse.redirect(authUrl.toString());
}
