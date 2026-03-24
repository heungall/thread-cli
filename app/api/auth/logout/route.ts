import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  // 세션 정리 후 Threads 사이트로 이동 (거기서 직접 로그아웃)
  const response = NextResponse.redirect("https://www.threads.net", { status: 303 });
  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // 즉시 만료
    path: "/",
  });
  return response;
}
