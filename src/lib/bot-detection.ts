import type { BotFamily } from "@/types";

const BOT_PATTERNS: [RegExp, BotFamily][] = [
  [/GPTBot/i, "GPTBot"],
  [/OAI-SearchBot/i, "OAI-SearchBot"],
  [/ChatGPT-User/i, "ChatGPT-User"],
  [/Google-InspectionTool/i, "Google-InspectionTool"],
  [/Googlebot/i, "Googlebot"],
  [/CCBot/i, "CCBot"],
  [/PerplexityBot/i, "PerplexityBot"],
  [/ClaudeBot/i, "ClaudeBot"],
  [/anthropic-ai/i, "anthropic-ai"],
  [/Applebot/i, "Applebot"],
  [/bingbot/i, "Bingbot"],
];

export function detectBotFamily(userAgent: string | null | undefined): BotFamily {
  if (!userAgent) return "unknown";
  for (const [pattern, family] of BOT_PATTERNS) {
    if (pattern.test(userAgent)) return family;
  }
  return "unknown";
}
