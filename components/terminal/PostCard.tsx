import type { ThreadsPost } from "@/lib/threads-api";

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
};

export default function PostCard({ post, username }: Props) {
  const media = mediaLabel(post.media_type);

  return (
    <div className="terminal-card text-sm space-y-3">
      {/* 헤더 */}
      <div className="text-terminal-muted text-xs">
        <span className="text-terminal-blue">// @{username}</span>
        <span className="mx-2">·</span>
        <span>{timeAgo(post.timestamp)}</span>
      </div>

      <div className="border-t border-terminal-border" />

      {/* 본문 */}
      <div className="text-terminal-text leading-relaxed font-mono">
        {post.text ? parseText(post.text) : (
          <span className="text-terminal-muted italic">// (empty)</span>
        )}
      </div>

      {/* 미디어 표기 */}
      {media && (
        <div className="text-terminal-muted text-xs">
          // [media: {media}]
        </div>
      )}

      <div className="border-t border-terminal-border" />

      {/* 카운터 */}
      <div className="flex gap-6 text-terminal-muted text-xs">
        <span>♡ {post.like_count ?? 0}</span>
        <span>↩ {post.replies_count ?? 0}</span>
        <span>⟳ {post.repost_count ?? 0}</span>
      </div>
    </div>
  );
}
