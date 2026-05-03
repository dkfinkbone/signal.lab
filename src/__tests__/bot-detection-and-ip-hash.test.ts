import { detectBotFamily } from "@/lib/bot-detection";
import { hashIp } from "@/lib/ip-hash";

// ---------------------------------------------------------------------------
// Bot detection
// ---------------------------------------------------------------------------

describe("detectBotFamily", () => {
  const cases: [string, string][] = [
    ["Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)", "GPTBot"],
    ["OAI-SearchBot/1.0", "OAI-SearchBot"],
    ["ChatGPT-User/1.0", "ChatGPT-User"],
    ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Googlebot"],
    ["Google-InspectionTool/1.0", "Google-InspectionTool"],
    ["CCBot/2.0 (https://commoncrawl.org/faq/)", "CCBot"],
    ["PerplexityBot/1.0", "PerplexityBot"],
    ["ClaudeBot/1.0", "ClaudeBot"],
    ["anthropic-ai/1.0", "anthropic-ai"],
    ["Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "Bingbot"],
    ["Applebot/0.1 (compatible; bingbot/2.0)", "Applebot"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "unknown"],
    ["", "unknown"],
  ];

  test.each(cases)("UA %s → %s", (ua, expected) => {
    expect(detectBotFamily(ua)).toBe(expected);
  });

  it("returns unknown for null/undefined", () => {
    expect(detectBotFamily(null)).toBe("unknown");
    expect(detectBotFamily(undefined)).toBe("unknown");
  });

  it("is case-insensitive for GPTBot", () => {
    expect(detectBotFamily("gptbot/1.0")).toBe("GPTBot");
  });
});

// ---------------------------------------------------------------------------
// IP hashing — raw IP must never be recoverable
// ---------------------------------------------------------------------------

describe("hashIp", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, ATTRIBUTION_SALT: "test-salt-abc123" };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("returns a hex string for a valid IP", () => {
    const result = hashIp("192.168.1.1");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same IP and salt", () => {
    expect(hashIp("10.0.0.1")).toBe(hashIp("10.0.0.1"));
  });

  it("produces different hashes for different IPs", () => {
    expect(hashIp("10.0.0.1")).not.toBe(hashIp("10.0.0.2"));
  });

  it("raw IP is not present in the hash output", () => {
    const ip = "203.0.113.42";
    const hash = hashIp(ip)!;
    expect(hash).not.toContain(ip);
    expect(hash).not.toContain("203");
  });

  it("returns null for null input", () => {
    expect(hashIp(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(hashIp(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(hashIp("")).toBeNull();
  });

  it("different salts produce different hashes", () => {
    const hash1 = hashIp("192.168.1.1");
    process.env.ATTRIBUTION_SALT = "different-salt-xyz";
    const hash2 = hashIp("192.168.1.1");
    expect(hash1).not.toBe(hash2);
  });
});
