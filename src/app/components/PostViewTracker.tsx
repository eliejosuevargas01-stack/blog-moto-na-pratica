"use client";

import { useEffect } from "react";

export default function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return;
    fetch("/api/posts/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
