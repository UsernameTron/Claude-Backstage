/**
 * @claude-patterns/cost-tracker
 *
 * Type stubs for Claude Code's session cost tracking.
 * Source: cost-tracker.ts (323 LOC)
 * KB Reference: Section 29 — Cost Tracking
 */

/**
 * Per-model cost entry tracking all token types and web search usage.
 * Aggregated per model within a session.
 */
export interface SessionCostEntry {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
}

/**
 * Aggregate session costs across all models.
 */
export interface SessionCosts {
  entries: SessionCostEntry[];
  totalCostUSD: number;
}

/** In-memory storage keyed by model name. */
const costStore = new Map<string, SessionCostEntry>();

/**
 * Retrieves stored session costs from project config.
 */
export function getStoredSessionCosts(): SessionCosts {
  const entries = Array.from(costStore.values());
  const totalCostUSD = entries.reduce((sum, e) => sum + e.costUSD, 0);
  return { entries, totalCostUSD };
}

/**
 * Adds a cost entry to the running session total.
 * Aggregates by model — updates existing entry or creates new one.
 */
export function addToTotalSessionCost(entry: SessionCostEntry): void {
  const existing = costStore.get(entry.model);
  if (existing) {
    existing.inputTokens += entry.inputTokens;
    existing.outputTokens += entry.outputTokens;
    existing.cacheReadInputTokens += entry.cacheReadInputTokens;
    existing.cacheCreationInputTokens += entry.cacheCreationInputTokens;
    existing.webSearchRequests += entry.webSearchRequests;
    existing.costUSD += entry.costUSD;
  } else {
    costStore.set(entry.model, { ...entry });
  }
}

/**
 * Formats a USD cost value for display (e.g., "$1.23").
 */
export function formatTotalCost(costUSD: number): string {
  return `$${costUSD.toFixed(2)}`;
}

/**
 * Persists current session costs to project config.
 */
export function saveCurrentSessionCosts(costs: SessionCosts): void {
  costStore.clear();
  for (const entry of costs.entries) {
    costStore.set(entry.model, { ...entry });
  }
}
