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

  // OAuth state 검증 (CSRF 방지)
  const state = searchParams.get("state");
  const savedState = request.cookies.get("oauth_state")?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      new URL("/?error=invalid_state", request.url)
    );
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const profile = await getThreadsUserProfile(tokenData.access_token);

    const user = await upsertUser({
      threads_user_id: profile.id,
      username: profile.username,
      display_name: profile.name,
      profile_pic_url: profile.threads_profile_picture_url,
    });

    const session = await createSession(user.id);

    const tokenExpiry = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

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

    // oauth_state 쿠키 삭제
    response.cookies.set("oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("OAuth callback error:", message);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
