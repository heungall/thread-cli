import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import TerminalHeader from "@/components/terminal/TerminalHeader";
import Link from "next/link";

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
    <main className="w-full mx-auto" style={{ maxWidth: "800px", padding: "32px 16px" }}>
      <TerminalHeader username={user.username ?? "unknown"} section="profile" />

      <div className="space-y-4 text-sm">
        <div className="space-y-2">
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

        <div className="border-t border-terminal-border" />

        <div className="space-y-1 text-xs text-terminal-muted">
          <p className="text-terminal-yellow">// links</p>
          <p>
            <span className="text-terminal-green">$</span>{" "}
            <a
              href={`https://www.threads.net/@${encodeURIComponent(user.username ?? "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-blue hover:underline"
            >
              threads.net/@{user.username} ↗
            </a>
          </p>
        </div>

        <div className="border-t border-terminal-border" />

        <div className="space-y-1 text-xs text-terminal-muted">
          <p className="text-terminal-yellow">// session</p>
          <p>· 세션은 30일 유지됩니다.</p>
          <p>· 인증 토큰은 암호화된 쿠키로만 보관됩니다.</p>
          <p>· 로그아웃 시 모든 세션 데이터가 삭제됩니다.</p>
        </div>

        <div className="flex gap-4 text-xs">
          <Link href="/feed" className="text-terminal-green hover:underline">
            ← 피드로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
