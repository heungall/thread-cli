import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getPostInsights } from "@/lib/threads-api";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  try {
    const insights = await getPostInsights(user.access_token, postId);
    return NextResponse.json(insights);
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json({ error: "통계를 불러오지 못했습니다." }, { status: 500 });
  }
}
