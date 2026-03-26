import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const appId = process.env.THREADS_APP_ID!;
  const redirectUri = process.env.THREADS_REDIRECT_URI!;
  const scope = "threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies,threads_manage_insights";

  const state = crypto.randomBytes(32).toString("hex");

  const authUrl = new URL("https://threads.net/oauth/authorize");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("force_authentication", "1");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10분
    path: "/",
  });

  return response;
}
