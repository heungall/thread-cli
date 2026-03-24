import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getThreadsUserProfile } from "@/lib/threads-api";
import { upsertUser, createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorMessage = searchParams.get("error_message");

  if (error || errorCode || !code) {
    const msg = errorMessage ?? error ?? "missing_code";
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(msg)}`, request.url)
    );
  }

  try {
    // 1. code → access_token 교환
    const tokenData = await exchangeCodeForToken(code);

    // 2. Threads 유저 프로필 조회
    const profile = await getThreadsUserProfile(tokenData.access_token);

    // 3. Supabase에 유저 upsert + 세션 생성
    const user = await upsertUser({
      threads_user_id: profile.id,
      username: profile.username,
      display_name: profile.name,
      profile_pic_url: profile.threads_profile_picture_url,
      access_token: tokenData.access_token,
      token_expires_at: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
    });

    const session = await createSession(user.id);

    // 4. 세션 쿠키 설정 후 피드로 리다이렉트
    const response = NextResponse.redirect(new URL("/feed", request.url));
    response.cookies.set("session_token", session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(session.expires_at),
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
