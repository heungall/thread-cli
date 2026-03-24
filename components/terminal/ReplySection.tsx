"use client";

import { useState, useRef } from "react";
import type { ThreadsReply } from "@/lib/threads-api";

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type Status =
  | { type: "idle" }
  | { type: "publishing" }
  | { type: "success" }
  | { type: "error"; message: string };

type Props = {
  postId: string;
  replyCount: number;
};

export default function ReplySection({ postId, replyCount }: Props) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<ThreadsReply[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function loadReplies() {
    if (replies !== null) return; // 이미 로드됨
    setLoadingReplies(true);
    try {
      const res = await fetch(`/api/reply?postId=${postId}`);
      const data = await res.json();
      setReplies(data.data ?? []);
    } catch {
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) loadReplies();
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await publish();
    }
  }

  async function publish() {
    if (!text.trim() || status.type === "publishing") return;
    setStatus({ type: "publishing" });

    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "오류 발생" });
        return;
      }

      setStatus({ type: "success" });
      setText("");
      // 새 댓글을 목록에 낙관적으로 추가
      setReplies((prev) => [
        ...(prev ?? []),
        {
          id: data.id,
          text: text.trim(),
          timestamp: new Date().toISOString(),
          username: "me",
        },
      ]);
      setTimeout(() => setStatus({ type: "idle" }), 1500);
    } catch {
      setStatus({ type: "error", message: "네트워크 오류" });
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {/* 토글 버튼 */}
      <button
        onClick={toggle}
        className="text-terminal-muted text-xs hover:text-terminal-blue transition-colors"
      >
        ↩ {replyCount > 0 ? `${replyCount}개 댓글` : "댓글 달기"}{" "}
        {replyCount > 0 && (open ? "▲" : "▼")}
      </button>

      {open && (
        <div className="pl-3 border-l border-terminal-border space-y-3">
          {/* 댓글 목록 */}
          {loadingReplies && (
            <p className="text-terminal-muted text-xs animate-pulse">// loading replies...</p>
          )}
          {replies && replies.length === 0 && !loadingReplies && (
            <p className="text-terminal-muted text-xs">// 댓글이 없습니다.</p>
          )}
          {replies &&
            replies.map((reply) => (
              <div key={reply.id} className="text-xs space-y-0.5">
                <div className="text-terminal-muted">
                  <span className="text-terminal-blue">@{reply.username}</span>
                  <span className="mx-1">·</span>
                  <span>{timeAgo(reply.timestamp)}</span>
                </div>
                <div className="text-terminal-text">{reply.text}</div>
              </div>
            ))}

          {/* 댓글 입력창 */}
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-terminal-green text-xs mt-0.5 select-none">&gt;</span>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status.type === "publishing"}
                placeholder="댓글 입력..."
                rows={2}
                className="flex-1 bg-transparent text-terminal-text text-xs resize-none outline-none placeholder:text-terminal-border disabled:opacity-50"
              />
            </div>

            {status.type === "publishing" && (
              <p className="text-terminal-yellow text-xs animate-pulse">&gt; publishing...</p>
            )}
            {status.type === "success" && (
              <p className="text-terminal-green text-xs">&gt; ✓ 댓글이 달렸습니다.</p>
            )}
            {status.type === "error" && (
              <p className="text-terminal-red text-xs">&gt; ✗ {status.message}</p>
            )}

            <p className="text-terminal-muted text-xs">
              <span className="text-terminal-green">[Enter]</span> 발행{" "}
              <span className="text-terminal-green">[Shift+Enter]</span> 줄바꿈
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
