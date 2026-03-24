"use client";

import { useState, useEffect, useCallback } from "react";
import PostCard from "./PostCard";
import type { ThreadsPost } from "@/lib/threads-api";

type FeedResponse = {
  data: ThreadsPost[];
  paging?: { cursors?: { after?: string } };
};

type Props = {
  username: string;
};

export default function FeedList({ username }: Props) {
  const [posts, setPosts] = useState<ThreadsPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (nextCursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = nextCursor ? `/api/feed?cursor=${nextCursor}` : "/api/feed";
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const data: FeedResponse = await res.json();

      setPosts((prev) =>
        nextCursor ? [...prev, ...data.data] : data.data
      );
      setCursor(data.paging?.cursors?.after ?? null);
    } catch {
      setError("// error: failed to load feed");
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // 'r' 키로 새로고침
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          fetchFeed();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fetchFeed]);

  if (!initialLoaded) {
    return (
      <div className="text-terminal-muted text-sm animate-pulse">
        <span className="text-terminal-green">$</span> fetching feed...
      </div>
    );
  }

  if (error) {
    return <p className="text-terminal-red text-sm">{error}</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="text-terminal-muted text-sm">
        // no posts found
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-terminal-muted mb-2">
        <span>// {posts.length} posts loaded</span>
        <button
          onClick={() => fetchFeed()}
          className="hover:text-terminal-green transition-colors"
        >
          [r] refresh
        </button>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} username={username} />
      ))}

      {cursor && (
        <button
          onClick={() => fetchFeed(cursor)}
          disabled={loading}
          className="w-full text-center text-terminal-muted text-xs border border-terminal-border py-2 hover:border-terminal-green hover:text-terminal-green transition-colors disabled:opacity-50"
        >
          {loading ? "// loading..." : "// load more ↓"}
        </button>
      )}

      {loading && posts.length > 0 && (
        <p className="text-terminal-muted text-xs animate-pulse text-center">
          // loading...
        </p>
      )}
    </div>
  );
}
