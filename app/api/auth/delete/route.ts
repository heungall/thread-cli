import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import crypto from "crypto";

function verifySignedRequest(signedRequest: string, appSecret: string): string | null {
  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const expected = crypto.createHmac("sha256", appSecret).update(payload).digest();

  if (!crypto.timingSafeEqual(sig, expected)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return decoded.user_id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signedRequest = body?.signed_request;
    const appSecret = process.env.THREADS_APP_SECRET;

    let threadsUserId: string | null = null;

    if (signedRequest && appSecret) {
      threadsUserId = verifySignedRequest(signedRequest, appSecret);
    } else {
      threadsUserId = body?.user_id;
    }

    if (threadsUserId) {
      const db = createServiceClient();
      const { data: user } = await db
        .from("users")
        .select("id")
        .eq("threads_user_id", threadsUserId)
        .single();

      if (user) {
        await db.from("sessions").delete().eq("user_id", user.id);
        await db.from("users").delete().eq("threads_user_id", threadsUserId);
      }
    }

    const confirmCode = crypto.randomBytes(16).toString("hex");
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion`,
      confirmation_code: confirmCode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Data deletion error:", message);
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion`,
      confirmation_code: "error",
    });
  }
}
