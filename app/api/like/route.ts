import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getAccessToken } from "@/lib/auth";
import { likePost, unlikePost } from "@/lib/threads-api";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, liked } = await request.json();
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  try {
    if (liked) {
      await unlikePost(accessToken, postId);
    } else {
      await likePost(accessToken, postId);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Like error:", err);
    return NextResponse.json({ error: "좋아요 처리에 실패했습니다." }, { status: 500 });
  }
}
