import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "THREADS.TERMINAL",
};

export default function Home({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
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

          {searchParams.error && (
            <p className="text-terminal-red text-xs border border-terminal-red/30 px-3 py-2">
              // error: {
                {
                  auth_failed: "인증에 실패했습니다.",
                  missing_code: "인증 코드가 없습니다.",
                  invalid_state: "잘못된 요청입니다. 다시 시도해주세요.",
                }[searchParams.error] ?? "오류가 발생했습니다."
              }
            </p>
          )}

          <Link
            href="/api/auth/login"
            className="block w-full text-center border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg transition-colors py-2 px-4 text-sm font-bold"
          >
            LOGIN WITH THREADS ↗
          </Link>

          <div className="border-t border-terminal-border" />

          <div className="text-terminal-muted text-xs space-y-1">
            <p className="text-terminal-yellow">// 사용 전 안내</p>
            <p>· logout은 이 앱 세션만 종료합니다. Threads 계정 로그아웃은 <span className="text-terminal-blue">threads.net</span>에서 직접 하세요.</p>
            <p>· 로그인 세션은 <span className="text-terminal-green">30일</span> 유지됩니다. 공용 PC에서는 사용 후 반드시 logout 하세요.</p>
            <p>· 인증 토큰은 서버에 저장되지 않으며, 암호화된 쿠키로만 보관됩니다.</p>
          </div>

          <div className="flex gap-4 text-xs text-terminal-muted">
            <Link href="/privacy" className="hover:text-terminal-blue transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-terminal-blue transition-colors">서비스 약관</Link>
            <Link href="/data-deletion" className="hover:text-terminal-blue transition-colors">데이터 삭제</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
