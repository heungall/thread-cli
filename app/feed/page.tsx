import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export default async function FeedPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/");
  }

  const user = await getSessionUser(sessionToken);
  if (!user) {
    redirect("/");
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-terminal-green font-bold">THREADS.TERMINAL</span>
          <span className="text-terminal-muted text-sm ml-2">// feed</span>
        </div>
        <div className="text-terminal-muted text-xs">
          <span className="text-terminal-blue">@{user.username}</span>
        </div>
      </div>

      <div className="border-t border-terminal-border mb-6" />

      <p className="text-terminal-muted text-sm terminal-prompt">
        피드를 불러오는 중... (Phase 2에서 구현)
      </p>
    </main>
  );
}
