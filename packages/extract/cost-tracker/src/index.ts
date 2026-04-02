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

/**
 * Retrieves stored session costs from project config.
 */
export function getStoredSessionCosts(): SessionCosts {
  // TODO: extract from cost-tracker.ts
  throw new Error("TODO: extract from cost-tracker.ts");
}

/**
 * Adds a cost entry to the running session total.
 * Aggregates by model — updates existing entry or creates new one.
 */
export function addToTotalSessionCost(entry: SessionCostEntry): void {
  // TODO: extract from cost-tracker.ts
  throw new Error("TODO: extract from cost-tracker.ts");
}

/**
 * Formats a USD cost value for display (e.g., "$1.23").
 */
export function formatTotalCost(costUSD: number): string {
  // TODO: extract from cost-tracker.ts
  throw new Error("TODO: extract from cost-tracker.ts");
}

/**
 * Persists current session costs to project config.
 */
export function saveCurrentSessionCosts(costs: SessionCosts): void {
  // TODO: extract from cost-tracker.ts
  throw new Error("TODO: extract from cost-tracker.ts");
}
