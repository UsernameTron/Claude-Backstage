/**
 * @claude-patterns/auto-compact
 *
 * Threshold-based auto-compaction with summary and boundary markers.
 * Source: services/compact/ (11 files, 3,960 LOC)
 * KB: Section 18 — Auto-Compact
 * Tier: Extract P1
 */

import type { Message, TokenUsage } from "@claude-patterns/token-estimation";

// Auto-compact threshold constants (KB section 18.2)
export const COMPACT_THRESHOLDS = {
  // effectiveWindow = modelContextWindow - min(maxOutputTokens, 20_000)
  // autoCompactThreshold = effectiveWindow - 13_000
  autoCompactBuffer: 13_000,
  // warningThreshold = effectiveWindow - 20_000
  warningBuffer: 20_000,
  // Max failures before giving up
  maxConsecutiveFailures: 3,
  // Special handling threshold for extremely long contexts
  longContextThreshold: 200_000,
} as const;

// Result of a compaction operation
export interface CompactionResult {
  compactedMessages: Message[];
  summary: string;
  tokensRemoved: number;
  tokensRemaining: number;
  success: boolean;
}

// Compact boundary marker in message history
export interface CompactBoundary {
  type: "compactBoundary";
  summary: string;
  originalTokenCount: number;
}

// Full conversation compaction — summarizes and replaces older messages
export function compactConversation(
  messages: Message[],
  modelContextWindow: number,
  maxOutputTokens: number,
): Promise<CompactionResult> {
  // TODO: extract from services/compact/
  throw new Error("TODO: extract from services/compact/");
}

// Partial compaction — preserves recent messages, compacts older ones
export function partialCompactConversation(
  messages: Message[],
  targetTokenCount: number,
): Promise<CompactionResult> {
  // TODO: extract from services/compact/
  throw new Error("TODO: extract from services/compact/");
}

// Check if compaction should trigger based on current token usage
export function shouldAutoCompact(
  currentTokens: number,
  modelContextWindow: number,
  maxOutputTokens: number,
): boolean {
  // TODO: extract from services/compact/
  throw new Error("TODO: extract from services/compact/");
}

// Calculate the effective window for a given model
export function getEffectiveWindow(
  modelContextWindow: number,
  maxOutputTokens: number,
): number {
  // TODO: extract from services/compact/
  throw new Error("TODO: extract from services/compact/");
}
