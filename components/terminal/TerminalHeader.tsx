import FontToggle from "./FontToggle";

type Props = {
  username: string;
  section?: string;
};

export default function TerminalHeader({ username, section = "feed" }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-terminal-green font-bold">THREADS.TERMINAL</span>
          <span className="text-terminal-muted text-sm ml-2">// {section}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <FontToggle />
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
