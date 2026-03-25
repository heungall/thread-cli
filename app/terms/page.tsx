import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="w-full mx-auto" style={{ maxWidth: "800px", padding: "32px 16px" }}>
      <div className="space-y-6 text-sm">
        <div>
          <Link href="/" className="text-terminal-green font-bold text-lg hover:underline">THREADS.TERMINAL</Link>
          <span className="text-terminal-muted ml-2">// terms of service</span>
        </div>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 서비스 개요</p>
          <p className="text-terminal-muted">
            THREADS.TERMINAL은 Threads SNS를 터미널 스타일 인터페이스로 이용할 수 있는
            개인 도구입니다. Meta의 공식 Threads API를 통해 동작하며,
            Meta 또는 Instagram과 공식적인 제휴 관계가 없습니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 이용 조건</p>
          <ul className="text-terminal-muted space-y-1 pl-4">
            <li>· 본 서비스를 이용하려면 유효한 Threads 계정이 필요합니다.</li>
            <li>· 서비스를 통해 게시되는 모든 콘텐츠는 사용자 본인의 책임입니다.</li>
            <li>· Threads 이용약관을 준수해야 합니다.</li>
            <li>· 자동화된 방식의 대량 요청, 스팸, 악의적인 사용을 금지합니다.</li>
          </ul>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 세션 및 보안</p>
          <ul className="text-terminal-muted space-y-1 pl-4">
            <li>· 로그인 세션은 30일간 유지됩니다.</li>
            <li>· 공용 또는 공유 기기에서는 사용 후 반드시 logout 하세요.</li>
            <li>
              · logout은 이 앱의 세션만 종료합니다. Threads 계정에서 완전히
              로그아웃하려면 threads.net에서 직접 하세요.
            </li>
          </ul>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 면책 조항</p>
          <p className="text-terminal-muted">
            본 서비스는 현재 상태 그대로(as-is) 제공됩니다.
            서비스 중단, 데이터 손실, Threads API 변경으로 인한 기능 이상에 대해
            책임을 지지 않습니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 약관 변경</p>
          <p className="text-terminal-muted">
            약관은 사전 고지 없이 변경될 수 있습니다.
            변경 후 서비스를 계속 이용하면 변경된 약관에 동의한 것으로 간주합니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <p className="text-terminal-muted text-xs">
          최종 수정: 2025년 3월
        </p>
      </div>
    </main>
  );
}
