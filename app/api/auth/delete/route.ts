import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Meta 데이터 삭제 요청 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const threadsUserId = body?.user_id;

    if (threadsUserId) {
      const db = createServiceClient();
      await db.from("users").delete().eq("threads_user_id", threadsUserId);
    }

    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion`,
      confirmation_code: threadsUserId ?? "unknown",
    });
  } catch {
    return NextResponse.json({ success: true });
  }
}
