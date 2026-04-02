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

// Hybrid estimation: exact API count + rough estimate for new messages
export function countTokensWithAPI(messages: Message[]): number {
  // TODO: extract from services/tokenEstimation.ts
  throw new Error("TODO: extract from services/tokenEstimation.ts");
}

// Rough estimation: ~4 chars per token heuristic
export function roughTokenCountEstimation(text: string): number {
  // TODO: extract from utils/tokens.ts
  throw new Error("TODO: extract from utils/tokens.ts");
}

// Rough estimation for message arrays
export function roughTokenCountEstimationForMessages(
  messages: Message[],
): number {
  // TODO: extract from services/tokenEstimation.ts
  throw new Error("TODO: extract from services/tokenEstimation.ts");
}

// File-type aware bytes-per-token ratio
export function bytesPerTokenForFileType(fileExtension: string): number {
  // TODO: extract from utils/tokens.ts
  throw new Error("TODO: extract from utils/tokens.ts");
}

// Hybrid: finds most recent exact count, adds rough estimate for new messages
export function tokenCountWithEstimation(messages: Message[]): number {
  // TODO: extract from services/tokenEstimation.ts
  throw new Error("TODO: extract from services/tokenEstimation.ts");
}
