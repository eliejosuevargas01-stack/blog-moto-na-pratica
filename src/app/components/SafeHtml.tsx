import React from "react";
import DOMPurify from "isomorphic-dompurify";

export const ALLOWED_SAFE_TAGS = [
  "b", "i", "strong", "em", "span", "a", "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "div", "ul", "ol", "li", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "img", "figure", "figcaption", "blockquote", "code", "pre", "br", "hr",
  "sub", "sup", "mark", "del", "ins", "small", "s", "time"
];

export const ALLOWED_SAFE_ATTR = [
  "class", "className", "id", "href", "target", "rel", "src", "alt", "style",
  "title", "width", "height", "loading", "colspan", "rowspan", "align"
];

export const SAFE_DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ALLOWED_SAFE_TAGS,
  ALLOWED_ATTR: ALLOWED_SAFE_ATTR,
};

export function sanitizeSafeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, SAFE_DOMPURIFY_CONFIG);
}

interface SafeHtmlProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
}

export default function SafeHtml({ html, className, style, tag = "div" }: SafeHtmlProps) {
  const clean = sanitizeSafeHtml(html);

  return React.createElement(tag, {
    className,
    style,
    dangerouslySetInnerHTML: { __html: clean }
  });
}
