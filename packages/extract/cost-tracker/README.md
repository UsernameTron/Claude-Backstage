# @claude-patterns/cost-tracker

Session cost tracking for Claude Code. Aggregates per-model token usage and costs with OpenTelemetry counter support.

## Source Reference

- **Path:** `cost-tracker.ts` (323 LOC)
- **KB Section:** 29 — Cost Tracking
- **Tier:** Extract (P0)

## Key Exports

### Types
- `SessionCostEntry` — Per-model cost record with 6 token/usage fields plus costUSD
- `SessionCosts` — Aggregate entries array with totalCostUSD

### Functions
- `getStoredSessionCosts()` — Retrieves persisted session costs from project config
- `addToTotalSessionCost()` — Adds or aggregates a cost entry by model
- `formatTotalCost()` — Formats USD cost for display
- `saveCurrentSessionCosts()` — Persists costs to project config

## Architecture

Costs are aggregated per model within a session. Each API call produces a `SessionCostEntry` that is merged into the running total. OpenTelemetry counters report by token type (`inputTokens`, `outputTokens`, `cacheReadInputTokens`, `cacheCreationInputTokens`, `webSearchRequests`).

## Dependencies

None — standalone cost tracking utility.
