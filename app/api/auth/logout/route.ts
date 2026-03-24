import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  // 303 See Other: POST 후 GET으로 리다이렉트 (브라우저 표준)
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // 즉시 만료
    path: "/",
  });
  return response;
}
