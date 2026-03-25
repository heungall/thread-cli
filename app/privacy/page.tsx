export default function PrivacyPage() {
  return (
    <main className="w-full mx-auto" style={{ maxWidth: "800px", padding: "32px 16px" }}>
      <div className="space-y-6 text-sm">
        <div>
          <span className="text-terminal-green font-bold text-lg">THREADS.TERMINAL</span>
          <span className="text-terminal-muted ml-2">// privacy policy</span>
        </div>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 수집하는 정보</p>
          <p className="text-terminal-muted">
            Threads 계정으로 로그인 시 다음 정보를 수집합니다.
          </p>
          <ul className="text-terminal-muted space-y-1 pl-4">
            <li>· Threads 사용자 ID</li>
            <li>· 사용자명 (username)</li>
            <li>· 표시 이름 (display name)</li>
            <li>· 프로필 사진 URL</li>
          </ul>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 수집하지 않는 정보</p>
          <p className="text-terminal-muted">
            Threads API 인증 토큰(access token)은 서버 데이터베이스에 저장하지 않습니다.
            토큰은 AES-256-GCM으로 암호화되어 사용자의 브라우저 쿠키에만 보관되며,
            로그아웃 시 즉시 삭제됩니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 정보 이용 목적</p>
          <ul className="text-terminal-muted space-y-1 pl-4">
            <li>· 사용자 인증 및 세션 유지</li>
            <li>· 화면에 사용자명 표시</li>
          </ul>
          <p className="text-terminal-muted">
            수집된 정보는 제3자에게 제공하거나 마케팅 목적으로 사용하지 않습니다.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 데이터 보관 및 삭제</p>
          <p className="text-terminal-muted">
            로그인 세션은 30일 후 자동 만료됩니다.
            계정 데이터 삭제를 원하시면{" "}
            <a href="/data-deletion" className="text-terminal-blue underline">
              데이터 삭제 페이지
            </a>
            를 참고하세요.
          </p>
        </section>

        <div className="border-t border-terminal-border" />

        <section className="space-y-2">
          <p className="text-terminal-yellow">// 제3자 서비스</p>
          <p className="text-terminal-muted">
            본 서비스는 Meta의 Threads API를 사용합니다.
            Threads 이용약관 및 개인정보처리방침은{" "}
            <a
              href="https://help.instagram.com/515230437301944"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-blue underline"
            >
              Meta 공식 페이지
            </a>
            를 참고하세요.
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
