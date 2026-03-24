import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export default async function ProfilePage() {
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
      <div className="mb-6">
        <span className="text-terminal-green font-bold">THREADS.TERMINAL</span>
        <span className="text-terminal-muted text-sm ml-2">// profile</span>
      </div>

      <div className="border-t border-terminal-border mb-6" />

      <div className="terminal-card space-y-2 text-sm">
        <p>
          <span className="text-terminal-muted">username:</span>{" "}
          <span className="text-terminal-blue">@{user.username}</span>
        </p>
        <p>
          <span className="text-terminal-muted">display_name:</span>{" "}
          <span className="text-terminal-text">{user.display_name}</span>
        </p>
        <p>
          <span className="text-terminal-muted">threads_id:</span>{" "}
          <span className="text-terminal-text">{user.threads_user_id}</span>
        </p>
      </div>
    </main>
  );
}
