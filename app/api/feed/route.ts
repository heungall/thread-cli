import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserFeed } from "@/lib/threads-api";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getSessionUser(sessionToken);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;

  try {
    const result = await getUserFeed(user.access_token, cursor);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Feed fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
