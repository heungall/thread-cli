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

// ─── 단일 댓글 아이템 (재귀적으로 대댓글 지원) ───

function ReplyItem({
  reply,
  depth,
  currentUsername,
  onDelete,
}: {
  reply: ThreadsReply;
  depth: number;
  currentUsername: string;
  onDelete?: (replyId: string) => void;
}) {
  const [subOpen, setSubOpen] = useState(false);
  const [subReplies, setSubReplies] = useState<ThreadsReply[] | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isMine = reply.username === currentUsername || reply.username === "me";

  async function handleDelete() {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/post?id=${reply.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleted(true);
        onDelete?.(reply.id);
      }
    } catch {
      // silent fail
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) return null;

  async function loadSubReplies() {
    if (subReplies !== null) return;
    setLoadingSub(true);
    try {
      const res = await fetch(`/api/reply?postId=${reply.id}`);
      const data = await res.json();
      setSubReplies(data.data ?? []);
    } catch {
      setSubReplies([]);
    } finally {
      setLoadingSub(false);
    }
  }

  function toggleSub() {
    const next = !subOpen;
    setSubOpen(next);
    if (next) loadSubReplies();
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
        body: JSON.stringify({ postId: reply.id, text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data.error ?? "오류 발생" });
        return;
      }

      setStatus({ type: "success" });
      setText("");
      setReplyOpen(false);
      // 대댓글 목록에 낙관적 추가
      setSubReplies((prev) => [
        ...(prev ?? []),
        {
          id: data.id,
          text: text.trim(),
          timestamp: new Date().toISOString(),
          username: "me",
        },
      ]);
      if (!subOpen) setSubOpen(true);
      setTimeout(() => setStatus({ type: "idle" }), 1500);
    } catch {
      setStatus({ type: "error", message: "네트워크 오류" });
    }
  }

  // 최대 3단계까지 대댓글 허용
  const maxDepth = 3;
  // 깊이별 트리 기호
  const prefix = depth === 1 ? "├─" : depth === 2 ? "│ └─" : "│   └─";

  return (
    <div className="text-xs space-y-1">
      <div className="text-terminal-muted">
        <span className="text-terminal-border mr-1">{prefix}</span>
        <span className="text-terminal-blue">@{reply.username}</span>
        <span className="mx-1">·</span>
        <span>{timeAgo(reply.timestamp)}</span>
        {/* 답글 / 대댓글 / 삭제 버튼 — 댓글 옆에 인라인 */}
        {depth < maxDepth && (
          <>
            <span className="mx-1">·</span>
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="hover:text-terminal-blue transition-colors"
            >
              ↩ 답글
            </button>
            <span className="mx-1">·</span>
            <button
              onClick={toggleSub}
              className="hover:text-terminal-blue transition-colors"
            >
              {subOpen ? "▲" : "▼ 대댓글"}
            </button>
          </>
        )}
        {isMine && (
          <>
            <span className="mx-1">·</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="hover:text-terminal-red transition-colors disabled:opacity-50"
            >
              {deleting ? "..." : "[x]"}
            </button>
          </>
        )}
      </div>
      <div className="text-terminal-text" style={{ paddingLeft: `${depth * 12}px` }}>{reply.text}</div>

      {/* 답글 입력 */}
      {replyOpen && (
        <div style={{ paddingLeft: `${depth * 12}px` }} className="space-y-1 mt-1">
          <div className="flex gap-2">
            <span className="text-terminal-green text-xs mt-0.5 select-none">&gt;</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status.type === "publishing"}
              placeholder={`@${reply.username}에게 답글...`}
              rows={2}
              className="flex-1 bg-transparent text-terminal-text text-xs resize-none outline-none placeholder:text-terminal-border disabled:opacity-50"
            />
          </div>
          {status.type === "publishing" && (
            <p className="text-terminal-yellow text-xs animate-pulse">&gt; publishing...</p>
          )}
          {status.type === "success" && (
            <p className="text-terminal-green text-xs">&gt; ✓ 답글이 달렸습니다.</p>
          )}
          {status.type === "error" && (
            <p className="text-terminal-red text-xs">&gt; ✗ {status.message}</p>
          )}
        </div>
      )}

      {/* 대댓글 목록 (재귀) */}
      {subOpen && (
        <div className="space-y-3 mt-1">
          {loadingSub && (
            <p className="text-terminal-muted text-xs animate-pulse">// loading...</p>
          )}
          {subReplies && subReplies.length === 0 && !loadingSub && (
            <p className="text-terminal-muted text-xs">// 대댓글이 없습니다.</p>
          )}
          {subReplies &&
            subReplies.map((sub) => (
              <ReplyItem
                key={sub.id}
                reply={sub}
                depth={depth + 1}
                currentUsername={currentUsername}
                onDelete={(id) => setSubReplies((prev) => prev?.filter((r) => r.id !== id) ?? null)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ─── 메인 ReplySection (게시물 단위) ───

type Props = {
  postId: string;
  replyCount: number;
  currentUsername: string;
};

export default function ReplySection({ postId, replyCount, currentUsername }: Props) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<ThreadsReply[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function loadReplies() {
    if (replies !== null) return;
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
              <ReplyItem
                key={reply.id}
                reply={reply}
                depth={1}
                currentUsername={currentUsername}
                onDelete={(id) => setReplies((prev) => prev?.filter((r) => r.id !== id) ?? null)}
              />
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
