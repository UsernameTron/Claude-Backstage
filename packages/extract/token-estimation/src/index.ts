/**
 * @claude-patterns/token-estimation
 *
 * Hybrid exact+rough token estimation strategy.
 * Source: services/tokenEstimation.ts + utils/tokens.ts (829 LOC)
 * KB: Section 18 — Token Estimation
 * Tier: Extract P1
 */

export interface Message {
  role: "user" | "assistant";
  content: string | unknown[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
}

/** Overhead tokens per message for role/structure metadata (~4 tokens). */
const MESSAGE_OVERHEAD = 4;

/**
 * Bytes-per-token lookup for common file extensions.
 * Lower ratio = more tokens per byte (denser content).
 */
const BYTES_PER_TOKEN_MAP: Record<string, number> = {
  ".ts": 3.5,
  ".tsx": 3.5,
  ".js": 3.5,
  ".jsx": 3.5,
  ".py": 3.8,
  ".rb": 3.8,
  ".go": 3.8,
  ".rs": 3.5,
  ".java": 3.8,
  ".c": 3.5,
  ".cpp": 3.5,
  ".h": 3.5,
  ".json": 4.0,
  ".yaml": 4.0,
  ".yml": 4.0,
  ".toml": 4.0,
  ".md": 4.5,
  ".txt": 4.5,
  ".html": 4.0,
  ".css": 3.8,
  ".sql": 4.0,
  ".sh": 4.0,
};

const DEFAULT_BYTES_PER_TOKEN = 4.0;

/**
 * Rough estimation: ~4 chars per token heuristic.
 * Returns Math.ceil(text.length / 4).
 */
export function roughTokenCountEstimation(text: string): number {
  if (text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Rough estimation for message arrays.
 * Sums roughTokenCountEstimation across message contents
 * plus overhead per message (~4 tokens for role/structure).
 */
export function roughTokenCountEstimationForMessages(
  messages: Message[],
): number {
  let total = 0;
  for (const msg of messages) {
    const contentText =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);
    total += roughTokenCountEstimation(contentText) + MESSAGE_OVERHEAD;
  }
  return total;
}

/**
 * File-type aware bytes-per-token ratio.
 * Returns the expected bytes per token for the given file extension.
 */
export function bytesPerTokenForFileType(fileExtension: string): number {
  return BYTES_PER_TOKEN_MAP[fileExtension] ?? DEFAULT_BYTES_PER_TOKEN;
}

/**
 * Hybrid estimation: exact API count + rough estimate for new messages.
 * In this pattern library, delegates to roughTokenCountEstimationForMessages
 * since no real API is available.
 */
export function countTokensWithAPI(messages: Message[]): number {
  return roughTokenCountEstimationForMessages(messages);
}

/**
 * Hybrid: finds most recent exact count, adds rough estimate for new messages.
 * Delegates to roughTokenCountEstimationForMessages in pattern lib.
 */
export function tokenCountWithEstimation(messages: Message[]): number {
  return roughTokenCountEstimationForMessages(messages);
}
