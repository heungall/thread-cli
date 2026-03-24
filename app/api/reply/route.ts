import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { replyToPost, getPostReplies } from "@/lib/threads-api";

// 댓글 목록 조회
export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  try {
    const result = await getPostReplies(user.access_token, postId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Reply fetch error:", err);
    return NextResponse.json({ error: "댓글을 불러오지 못했습니다." }, { status: 500 });
  }
}

// 댓글 작성
export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, text } = await request.json();

  if (!postId || !text?.trim()) {
    return NextResponse.json({ error: "postId와 내용을 입력해주세요." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "500자를 초과했습니다." }, { status: 400 });
  }

  try {
    const result = await replyToPost(user.access_token, postId, text.trim());
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("Reply post error:", err);
    return NextResponse.json({ error: "댓글 발행에 실패했습니다." }, { status: 500 });
  }
}
