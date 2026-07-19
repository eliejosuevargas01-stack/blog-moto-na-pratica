"use client";

import React, { useEffect, useState } from "react";

interface SafeHtmlProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<[^>]*>/g, "");
}

export default function SafeHtml({ html, className, tag = "div" }: SafeHtmlProps) {
  const Tag = tag as any;
  // Initial render (SSR): use a safe stripped version to avoid importing jsdom on server
  const [sanitized, setSanitized] = useState<string>(() => stripHtml(html || ""));

  useEffect(() => {
    let mounted = true;
    // Dynamically import DOMPurify on the client only
    (async () => {
      try {
        const DOMPurifyMod = await import("isomorphic-dompurify");
        const DOMPurify = (DOMPurifyMod && (DOMPurifyMod.default || DOMPurifyMod)) as any;
        const clean = DOMPurify.sanitize(html || "");
        if (mounted) setSanitized(clean);
      } catch (e) {
        if (mounted) setSanitized(stripHtml(html || ""));
      }
    })();
    return () => { mounted = false; };
  }, [html]);

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
