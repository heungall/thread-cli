import Settings from "./Settings";

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
          <span className="text-terminal-green font-bold tracking-wide">
            THREADS.TERMINAL
          </span>
          <span className="text-terminal-muted text-sm ml-2">// {section}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Settings />
          <span className="text-terminal-blue">@{username}</span>
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
