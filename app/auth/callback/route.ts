import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getThreadsUserProfile } from "@/lib/threads-api";
import { upsertUser, createSession } from "@/lib/auth";
import { encryptToken } from "@/lib/token-crypto";

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

    // 3. Supabase에 유저 upsert (토큰 저장 안 함)
    const user = await upsertUser({
      threads_user_id: profile.id,
      username: profile.username,
      display_name: profile.name,
      profile_pic_url: profile.threads_profile_picture_url,
    });

    const session = await createSession(user.id);

    const tokenExpiry = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 기본 60일

    // 4. 세션 쿠키 + 암호화된 토큰 쿠키 설정
    const response = NextResponse.redirect(new URL("/feed", request.url));

    response.cookies.set("session_token", session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(session.expires_at),
      path: "/",
    });

    response.cookies.set("access_token", encryptToken(tokenData.access_token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: tokenExpiry,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
