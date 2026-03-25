"use client";

import { useState } from "react";

export default function HelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-terminal-muted hover:text-terminal-green transition-colors text-xs"
      >
        {open ? "[?] close" : "[?]"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-6 z-50 text-xs"
          style={{
            width: "320px",
            background: "rgb(var(--color-surface))",
            border: "1px solid rgb(var(--color-border))",
            padding: "12px 14px",
            lineHeight: "1.8",
          }}
        >
          <div className="text-terminal-green font-bold mb-2">// THREADS.TERMINAL — 사용 안내</div>

          <div className="space-y-2 text-terminal-muted">
            <div>
              <span className="text-terminal-yellow">로그아웃</span>
              <br />
              logout 버튼은 이 앱의 세션만 종료합니다.
              <br />
              Threads 계정에서 완전히 로그아웃하려면{" "}
              <span className="text-terminal-blue">threads.net</span>에서 직접 로그아웃하세요.
            </div>

            <div className="border-t border-terminal-border" />

            <div>
              <span className="text-terminal-yellow">세션</span>
              <br />
              로그인 세션은 <span className="text-terminal-green">30일</span> 유지됩니다.
              <br />
              만료 후 자동으로 로그아웃되며 재로그인이 필요합니다.
            </div>

            <div className="border-t border-terminal-border" />

            <div>
              <span className="text-terminal-yellow">키보드 단축키</span>
              <br />
              <span className="text-terminal-green">r</span> — 피드 새로고침
              <br />
              <span className="text-terminal-green">Enter</span> — 게시물 발행
              <br />
              <span className="text-terminal-green">Shift+Enter</span> — 줄바꿈
            </div>

            <div className="border-t border-terminal-border" />

            <div>
              <span className="text-terminal-yellow">보안</span>
              <br />
              인증 토큰은 서버에 저장되지 않습니다.
              <br />
              암호화된 상태로 브라우저 쿠키에만 보관됩니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
