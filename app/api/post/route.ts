import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getAccessToken } from "@/lib/auth";
import { createPost, deleteMedia } from "@/lib/threads-api";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "500자를 초과했습니다." }, { status: 400 });
  }

  try {
    const result = await createPost(accessToken, text.trim());
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("Post error:", err);
    return NextResponse.json({ error: "게시물 발행에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getSessionUser(sessionToken);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = getAccessToken(request);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mediaId = request.nextUrl.searchParams.get("id");
  if (!mediaId) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await deleteMedia(accessToken, mediaId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
