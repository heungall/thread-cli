import Link from "next/link";
import Settings from "./Settings";
import HelpPanel from "./HelpPanel";

type Props = {
  username: string;
  section?: string;
};

export default function TerminalHeader({ username, section = "feed" }: Props) {
  return (
    <div className="mb-6">
      {/* abap-titlebar 클래스: ABAP 테마에서 SAP 파란 타이틀바로 변환 */}
      <div className="abap-titlebar flex items-center justify-between py-1">
        <div>
          <Link href="/feed" className="text-terminal-green font-bold tracking-wide hover:underline">
            THREADS.TERMINAL
          </Link>
          <span className="text-terminal-muted text-sm ml-2">// {section}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Settings />
          <HelpPanel />
          <Link href="/profile" className="text-terminal-blue hover:underline">
            @{username}
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-terminal-muted hover:text-terminal-red transition-colors"
            >
              logout
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-terminal-border mt-3" />
    </div>
  );
}
