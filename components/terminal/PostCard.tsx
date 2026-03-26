"use client";

import { useState } from "react";
import type { ThreadsPost, PostInsights } from "@/lib/threads-api";
import ReplySection from "./ReplySection";

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function parseText(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  // 줄바꿈을 "0: "...", 1: "..."" 형식으로 렌더링
  if (lines.length > 1) {
    nodes.push(
      <div key="obj-open" className="text-terminal-muted">
        {"{"}
      </div>
    );
    lines.forEach((line, i) => {
      nodes.push(
        <div key={i} className="pl-4">
          <span className="text-terminal-yellow">{i}</span>
          <span className="text-terminal-muted">: </span>
          <span className="text-terminal-muted">&quot;</span>
          {highlightLine(line)}
          <span className="text-terminal-muted">&quot;</span>
          {i < lines.length - 1 && (
            <span className="text-terminal-muted">,</span>
          )}
        </div>
      );
    });
    nodes.push(
      <div key="obj-close" className="text-terminal-muted">
        {"}"}
      </div>
    );
  } else {
    nodes.push(<div key="single">{highlightLine(text)}</div>);
  }

  return nodes;
}

function highlightLine(line: string): React.ReactNode[] {
  // #해시태그, @멘션, URL 하이라이트
  const parts = line.split(/(#[\w가-힣]+|@[\w가-힣.]+|https?:\/\/\S+)/g);
  return parts.map((part, i) => {
    if (/^#[\w가-힣]+$/.test(part)) {
      return (
        <span key={i} className="text-terminal-green">
          {part}
        </span>
      );
    }
    if (/^@[\w가-힣.]+$/.test(part)) {
      return (
        <span key={i} className="text-terminal-blue">
          {part}
        </span>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-terminal-blue underline"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function mediaLabel(mediaType: string): string | null {
  const type = mediaType?.toUpperCase();
  if (type === "IMAGE") return "image × 1";
  if (type === "CAROUSEL_ALBUM") return "image × N";
  if (type === "VIDEO") return "video × 1";
  return null;
}

type Props = {
  post: ThreadsPost;
  username: string;
  onDelete?: (postId: string) => void;
};

export default function PostCard({ post, username, onDelete }: Props) {
  const media = mediaLabel(post.media_type);
  const [insights, setInsights] = useState<PostInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/post?id=${post.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(post.id);
      }
    } catch {
      // silent fail
    } finally {
      setDeleting(false);
    }
  }

  async function loadInsights() {
    if (insights || loadingInsights) return;
    setLoadingInsights(true);
    try {
      const res = await fetch(`/api/insights?postId=${post.id}`);
      if (res.ok) {
        const data: PostInsights = await res.json();
        setInsights(data);
      }
    } finally {
      setLoadingInsights(false);
    }
  }

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    const prevLiked = liked;
    setLiked(!prevLiked);
    if (insights) {
      setInsights({ ...insights, likes: insights.likes + (prevLiked ? -1 : 1) });
    }
    try {
      await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, liked: prevLiked }),
      });
    } catch {
      setLiked(prevLiked);
      if (insights) {
        setInsights({ ...insights, likes: insights.likes + (prevLiked ? 1 : -1) });
      }
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="terminal-card text-sm space-y-3">
      {/* 헤더 */}
      <div className="text-terminal-muted text-xs flex items-center justify-between">
        <div>
          <span className="text-terminal-blue">// @{username}</span>
          <span className="mx-2">·</span>
          <span>{timeAgo(post.timestamp)}</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-terminal-muted hover:text-terminal-red transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "[x]"}
        </button>
      </div>

      <div className="border-t border-terminal-border" />

      {/* 본문 */}
      <div className="text-terminal-text leading-relaxed font-mono">
        {post.text ? parseText(post.text) : post.media_type === "REPOST_FACADE" ? (
          <div className="text-terminal-muted text-xs space-y-1">
            <span>// repost</span>
            {post.permalink && (
              <div>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-blue hover:underline"
                >
                  원본 보기 ↗
                </a>
              </div>
            )}
          </div>
        ) : (
          <span className="text-terminal-muted italic">// (empty)</span>
        )}
      </div>

      {/* 인용 표기 */}
      {post.is_quote_post && (
        <div className="text-terminal-muted text-xs">
          // quote —{" "}
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-terminal-blue hover:underline"
          >
            인용 원본 보기 ↗
          </a>
        </div>
      )}

      {/* 미디어 표기 */}
      {media && (
        <div className="text-terminal-muted text-xs">
          // [media: {media}]
        </div>
      )}

      <div className="border-t border-terminal-border" />

      {/* 카운터 */}
      <div className="flex items-center gap-4 text-xs">
        <button
          onClick={toggleLike}
          disabled={liking}
          className={`transition-colors ${liked ? "text-terminal-red" : "text-terminal-muted hover:text-terminal-red"}`}
        >
          {liked ? "♥" : "♡"} {insights ? insights.likes : "—"}
        </button>
        <span className="text-terminal-muted">
          ↩ {insights ? insights.replies : "—"}
        </span>
        <span className="text-terminal-muted">
          ⟳ {insights ? insights.reposts : "—"}
        </span>
        {!insights && (
          <button
            onClick={loadInsights}
            disabled={loadingInsights}
            className="text-terminal-border hover:text-terminal-muted transition-colors ml-auto"
          >
            {loadingInsights ? "..." : "[stats ↓]"}
          </button>
        )}
      </div>

      {/* 댓글 섹션 */}
      <ReplySection postId={post.id} replyCount={insights?.replies ?? 0} currentUsername={username} />
    </div>
  );
}
