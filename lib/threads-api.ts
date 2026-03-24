const THREADS_API_BASE = "https://graph.threads.net/v1.0";
const THREADS_OAUTH_URL = "https://graph.threads.net/oauth/access_token";

// ─── OAuth ───────────────────────────────────────────────

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.THREADS_APP_ID!,
    client_secret: process.env.THREADS_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: process.env.THREADS_REDIRECT_URI!,
    code,
  });

  const res = await fetch(THREADS_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>;
}

export async function getThreadsUserProfile(accessToken: string) {
  const res = await fetch(
    `${THREADS_API_BASE}/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`
  );

  if (!res.ok) throw new Error("Failed to fetch user profile");

  return res.json() as Promise<{
    id: string;
    username: string;
    name: string;
    threads_profile_picture_url: string;
  }>;
}

// ─── Feed ────────────────────────────────────────────────

export type ThreadsPost = {
  id: string;
  text: string;
  timestamp: string;
  media_type: string;
  permalink: string;
  like_count?: number;
  replies_count?: number;
  repost_count?: number;
  has_liked?: boolean;
};

export async function getUserFeed(
  accessToken: string,
  cursor?: string
): Promise<{ data: ThreadsPost[]; paging?: { cursors?: { after?: string } } }> {
  const fields = "id,text,timestamp,media_type,permalink,like_count,replies_count,repost_count,has_liked";
  const url = new URL(`${THREADS_API_BASE}/me/threads`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", accessToken);
  if (cursor) url.searchParams.set("after", cursor);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

// ─── Compose ─────────────────────────────────────────────

export async function createPost(accessToken: string, text: string) {
  // Step 1: create media container
  const userId = await getMyUserId(accessToken);

  const createRes = await fetch(`${THREADS_API_BASE}/${userId}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "TEXT",
      text,
      access_token: accessToken,
    }),
  });

  if (!createRes.ok) throw new Error("Failed to create post container");
  const { id: creationId } = await createRes.json();

  // Step 2: publish
  const publishRes = await fetch(
    `${THREADS_API_BASE}/${userId}/threads_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    }
  );

  if (!publishRes.ok) throw new Error("Failed to publish post");
  return publishRes.json() as Promise<{ id: string }>;
}

// ─── Like ────────────────────────────────────────────────

export async function likePost(accessToken: string, postId: string) {
  const res = await fetch(
    `${THREADS_API_BASE}/${postId}/likes?access_token=${accessToken}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

export async function unlikePost(accessToken: string, postId: string) {
  const res = await fetch(
    `${THREADS_API_BASE}/${postId}/likes?access_token=${accessToken}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to unlike post");
  return res.json();
}

// ─── Reply ───────────────────────────────────────────────

export async function replyToPost(
  accessToken: string,
  postId: string,
  text: string
) {
  const userId = await getMyUserId(accessToken);

  const createRes = await fetch(`${THREADS_API_BASE}/${userId}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "TEXT",
      text,
      reply_to_id: postId,
      access_token: accessToken,
    }),
  });

  if (!createRes.ok) throw new Error("Failed to create reply container");
  const { id: creationId } = await createRes.json();

  const publishRes = await fetch(
    `${THREADS_API_BASE}/${userId}/threads_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    }
  );

  if (!publishRes.ok) throw new Error("Failed to publish reply");
  return publishRes.json() as Promise<{ id: string }>;
}

// ─── Replies ─────────────────────────────────────────────

export type ThreadsReply = {
  id: string;
  text: string;
  timestamp: string;
  username: string;
};

export async function getPostReplies(
  accessToken: string,
  postId: string
): Promise<{ data: ThreadsReply[] }> {
  const fields = "id,text,timestamp,username";
  const url = new URL(`${THREADS_API_BASE}/${postId}/replies`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch replies");
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────

async function getMyUserId(accessToken: string): Promise<string> {
  const res = await fetch(
    `${THREADS_API_BASE}/me?fields=id&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to get user id");
  const data = await res.json();
  return data.id;
}
