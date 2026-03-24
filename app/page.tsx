import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="terminal-card w-full max-w-lg">
        <div className="mb-4 text-terminal-muted text-xs flex gap-2">
          <span className="w-3 h-3 rounded-full bg-terminal-red inline-block" />
          <span className="w-3 h-3 rounded-full bg-terminal-yellow inline-block" />
          <span className="w-3 h-3 rounded-full bg-terminal-green inline-block" />
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-terminal-green font-bold text-lg">
              THREADS.TERMINAL
            </span>
            <span className="text-terminal-muted text-sm ml-2">v1.0</span>
          </div>

          <div className="border-t border-terminal-border my-2" />

          <p className="text-terminal-muted text-sm">
            <span className="text-terminal-green">$</span> Threads 계정으로
            로그인하세요.
          </p>

          <Link
            href="/api/auth/login"
            className="block w-full text-center border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-colors py-2 px-4 text-sm font-bold"
          >
            LOGIN WITH THREADS ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
