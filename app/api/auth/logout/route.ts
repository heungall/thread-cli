import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  const response = NextResponse.redirect("https://www.threads.net", { status: 303 });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    expires: new Date(0),
    path: "/",
  };

  response.cookies.set("session_token", "", cookieOptions);
  response.cookies.set("access_token", "", cookieOptions);

  return response;
}
