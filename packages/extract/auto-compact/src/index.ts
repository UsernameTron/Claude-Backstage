/**
 * @claude-patterns/auto-compact
 *
 * Threshold-based auto-compaction with summary and boundary markers.
 * Source: services/compact/ (11 files, 3,960 LOC)
 * KB: Section 18 — Auto-Compact
 * Tier: Extract P1
 */

import type { Message, TokenUsage } from "@claude-patterns/token-estimation";
import { roughTokenCountEstimation } from "@claude-patterns/token-estimation";

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

// Calculate the effective window for a given model
export function getEffectiveWindow(
  modelContextWindow: number,
  maxOutputTokens: number,
): number {
  return modelContextWindow - Math.min(maxOutputTokens, 20_000);
}

// Check if compaction should trigger based on current token usage
export function shouldAutoCompact(
  currentTokens: number,
  modelContextWindow: number,
  maxOutputTokens: number,
): boolean {
  const effectiveWindow = getEffectiveWindow(
    modelContextWindow,
    maxOutputTokens,
  );
  const threshold = effectiveWindow - COMPACT_THRESHOLDS.autoCompactBuffer;
  return currentTokens > threshold;
}

/**
 * Estimate token count for a message array using rough heuristic.
 */
function estimateMessageTokens(messages: Message[]): number {
  let total = 0;
  for (const msg of messages) {
    const text =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);
    total += roughTokenCountEstimation(text) + 4; // 4 tokens overhead per message
  }
  return total;
}

// Full conversation compaction — summarizes and replaces older messages
export async function compactConversation(
  messages: Message[],
  modelContextWindow: number,
  maxOutputTokens: number,
): Promise<CompactionResult> {
  const originalTokens = estimateMessageTokens(messages);

  // Build summary from all message content
  const summaryParts: string[] = [];
  for (const msg of messages) {
    const text =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);
    summaryParts.push(`[${msg.role}]: ${text.slice(0, 200)}`);
  }
  const summary = `Compacted ${messages.length} messages: ${summaryParts.join("; ").slice(0, 500)}`;

  // Replace all messages with a single summary message
  const compactedMessages: Message[] = [
    { role: "assistant", content: summary },
  ];
  const remainingTokens = estimateMessageTokens(compactedMessages);

  return {
    compactedMessages,
    summary,
    tokensRemoved: originalTokens - remainingTokens,
    tokensRemaining: remainingTokens,
    success: true,
  };
}

// Partial compaction — preserves recent messages, compacts older ones
export async function partialCompactConversation(
  messages: Message[],
  targetTokenCount: number,
): Promise<CompactionResult> {
  if (messages.length <= 2) {
    // Nothing to compact — keep as-is
    const tokens = estimateMessageTokens(messages);
    return {
      compactedMessages: [...messages],
      summary: "No compaction needed",
      tokensRemoved: 0,
      tokensRemaining: tokens,
      success: true,
    };
  }

  // Keep the last 2 messages intact, compact earlier ones
  const preserveCount = Math.min(2, messages.length);
  const recentMessages = messages.slice(-preserveCount);
  const olderMessages = messages.slice(0, -preserveCount);

  // Build summary of older messages
  const summaryParts: string[] = [];
  for (const msg of olderMessages) {
    const text =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);
    summaryParts.push(`[${msg.role}]: ${text.slice(0, 200)}`);
  }
  const summary = `Compacted ${olderMessages.length} older messages: ${summaryParts.join("; ").slice(0, 500)}`;

  const compactedMessages: Message[] = [
    { role: "assistant", content: summary },
    ...recentMessages,
  ];

  const originalTokens = estimateMessageTokens(messages);
  const remainingTokens = estimateMessageTokens(compactedMessages);

  return {
    compactedMessages,
    summary,
    tokensRemoved: originalTokens - remainingTokens,
    tokensRemaining: remainingTokens,
    success: true,
  };
}
