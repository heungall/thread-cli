export default function DataDeletionPage() {
  return (
    <main className="w-full mx-auto" style={{ maxWidth: "800px", padding: "32px 16px" }}>
      <div className="space-y-6 text-sm">
        <div>
          <span className="text-terminal-green font-bold text-lg">THREADS.TERMINAL</span>
          <span className="text-terminal-muted ml-2">// data deletion</span>
        </div>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 저장 데이터</p>
          <p className="text-terminal-muted">
            본 서비스가 데이터베이스에 저장하는 정보는 다음과 같습니다.
          </p>
          <ul className="text-terminal-muted space-y-1 pl-4">
            <li>· Threads 사용자 ID</li>
            <li>· 사용자명 (username)</li>
            <li>· 표시 이름 (display name)</li>
            <li>· 프로필 사진 URL</li>
            <li>· 로그인 세션 정보 (세션 토큰, 만료 시각)</li>
          </ul>
          <p className="text-terminal-muted">
            Threads API 인증 토큰은 서버에 저장되지 않습니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 삭제 방법</p>

          <div className="pl-4 space-y-3 text-terminal-muted">
            <div>
              <p className="text-terminal-green">방법 1 — 앱 연결 해제 (권장)</p>
              <ol className="space-y-1 pl-4 list-decimal list-inside">
                <li>Threads 앱 → 설정 → 보안 → 앱 및 웹사이트</li>
                <li>THREADS.TERMINAL 선택 → 연결 해제</li>
                <li>연결 해제 시 Meta가 자동으로 데이터 삭제 요청을 전송합니다.</li>
              </ol>
            </div>

            <div>
              <p className="text-terminal-green">방법 2 — 로그아웃</p>
              <p>
                서비스에서 logout 하면 세션 데이터가 즉시 삭제됩니다.
                계정 정보(사용자명 등)까지 완전 삭제하려면 방법 1을 이용하세요.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 삭제 확인</p>
          <p className="text-terminal-muted">
            앱 연결 해제 후 데이터베이스에서 해당 계정의 모든 정보가 자동으로 삭제됩니다.
            삭제 완료까지 최대 72시간이 소요될 수 있습니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <div className="flex gap-4 text-xs text-terminal-muted">
          <a href="/privacy" className="text-terminal-blue underline">개인정보처리방침</a>
          <a href="/terms" className="text-terminal-blue underline">서비스 약관</a>
        </div>
      </div>
    </main>
  );
}
