import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import TerminalHeader from "@/components/terminal/TerminalHeader";
import FeedList from "@/components/terminal/FeedList";
import ComposeBox from "@/components/terminal/ComposeBox";

export default async function FeedPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) redirect("/");

  const user = await getSessionUser(sessionToken);
  if (!user) redirect("/");

  return (
    <main className="w-full mx-auto" style={{ maxWidth: "800px", padding: "32px 16px" }}>
      <TerminalHeader username={user.username ?? "unknown"} section="feed" />
      <ComposeBox username={user.username ?? "unknown"} />
      <FeedList username={user.username ?? "unknown"} />
    </main>
  );
}
