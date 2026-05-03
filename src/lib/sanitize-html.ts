const BLOCKED_ELEMENT_PATTERN =
  /<(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\/\1>/gi;
const BLOCKED_SELF_CLOSING_PATTERN =
  /<(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi;
const INLINE_HANDLER_PATTERN = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JAVASCRIPT_URL_PATTERN =
  /\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  return html
    .replace(BLOCKED_ELEMENT_PATTERN, "")
    .replace(BLOCKED_SELF_CLOSING_PATTERN, "")
    .replace(INLINE_HANDLER_PATTERN, "")
    .replace(JAVASCRIPT_URL_PATTERN, "");
}
