import { createServiceClient, User, Session } from "./supabase";
import crypto from "crypto";

type UpsertUserInput = {
  threads_user_id: string;
  username: string;
  display_name: string;
  profile_pic_url: string;
  access_token: string;
  token_expires_at: string;
};

export async function upsertUser(input: UpsertUserInput): Promise<User> {
  const db = createServiceClient();

  const { data, error } = await db
    .from("users")
    .upsert(
      {
        threads_user_id: input.threads_user_id,
        username: input.username,
        display_name: input.display_name,
        profile_pic_url: input.profile_pic_url,
        access_token: input.access_token,
        token_expires_at: input.token_expires_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "threads_user_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`upsertUser failed: ${error.message}`);
  return data as User;
}

export async function createSession(userId: string): Promise<Session> {
  const db = createServiceClient();
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일

  const { data, error } = await db
    .from("sessions")
    .insert({
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`createSession failed: ${error.message}`);
  return data as Session;
}

export async function getSessionUser(
  sessionToken: string
): Promise<User | null> {
  const db = createServiceClient();

  const { data: session, error: sessionError } = await db
    .from("sessions")
    .select("*, users(*)")
    .eq("session_token", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (sessionError || !session) return null;

  return (session as { users: User }).users;
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const db = createServiceClient();
  await db.from("sessions").delete().eq("session_token", sessionToken);
}
