import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Meta가 유저가 앱 연결 해제 시 호출하는 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const threadsUserId = body?.user_id;

    if (threadsUserId) {
      const db = createServiceClient();
      await db.from("sessions")
        .delete()
        .eq("user_id", db.from("users").select("id").eq("threads_user_id", threadsUserId));
      await db.from("users").delete().eq("threads_user_id", threadsUserId);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
