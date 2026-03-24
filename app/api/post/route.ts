import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createPost } from "@/lib/threads-api";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getSessionUser(sessionToken);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "500자를 초과했습니다." }, { status: 400 });
  }

  try {
    const result = await createPost(user.access_token, text.trim());
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("Post error:", err);
    return NextResponse.json({ error: "게시물 발행에 실패했습니다." }, { status: 500 });
  }
}
