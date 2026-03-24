"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const MAX_LENGTH = 500;

type Status =
  | { type: "idle" }
  | { type: "publishing" }
  | { type: "success" }
  | { type: "error"; message: string };

type Props = {
  username: string;
};

export default function ComposeBox({ username }: Props) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const remaining = MAX_LENGTH - text.length;
  const isOver = remaining < 0;

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await publish();
      }
    },
    [text]
  );

  async function publish() {
    if (!text.trim() || isOver || status.type === "publishing") return;

    setStatus({ type: "publishing" });

    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "알 수 없는 오류" });
        return;
      }

      setStatus({ type: "success" });
      setText("");
      setTimeout(() => {
        setStatus({ type: "idle" });
        setOpen(false);
        router.refresh();
      }, 1500);
    } catch {
      setStatus({ type: "error", message: "네트워크 오류가 발생했습니다." });
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => textareaRef.current?.focus(), 50);
        }}
        className="w-full text-left terminal-card text-terminal-muted text-sm hover:border-terminal-green transition-colors mb-4"
      >
        <span className="text-terminal-green">root@threads:~$</span>{" "}
        <span className="cursor-blink">new_post</span>
      </button>
    );
  }

  return (
    <div className="terminal-card mb-4 space-y-3">
      {/* 헤더 */}
      <div className="text-xs text-terminal-muted flex items-center justify-between">
        <span>
          <span className="text-terminal-green">root@threads:~$</span> new_post
        </span>
        <button
          onClick={() => { setOpen(false); setText(""); setStatus({ type: "idle" }); }}
          className="hover:text-terminal-red transition-colors"
        >
          [esc]
        </button>
      </div>

      <div className="border-t border-terminal-border" />

      {/* 입력창 */}
      <div className="flex gap-2">
        <span className="text-terminal-green text-sm mt-0.5 select-none">&gt;</span>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status.type === "publishing"}
          placeholder="내용을 입력하세요..."
          rows={4}
          className="flex-1 bg-transparent text-terminal-text text-sm resize-none outline-none placeholder:text-terminal-border disabled:opacity-50"
        />
      </div>

      {/* 상태 메시지 */}
      {status.type === "publishing" && (
        <p className="text-terminal-yellow text-xs animate-pulse">
          &gt; publishing...
        </p>
      )}
      {status.type === "success" && (
        <p className="text-terminal-green text-xs">
          &gt; ✓ 게시물이 발행되었습니다.
        </p>
      )}
      {status.type === "error" && (
        <p className="text-terminal-red text-xs">
          &gt; ✗ {status.message}
        </p>
      )}

      <div className="border-t border-terminal-border" />

      {/* 푸터 */}
      <div className="flex items-center justify-between text-xs text-terminal-muted">
        <span>
          <span className="text-terminal-green">[Shift+Enter]</span> 줄바꿈
          {"  "}
          <span className="text-terminal-green">[Enter]</span> 발행
        </span>
        <span className={isOver ? "text-terminal-red font-bold" : remaining <= 50 ? "text-terminal-yellow" : ""}>
          {text.length} / {MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
