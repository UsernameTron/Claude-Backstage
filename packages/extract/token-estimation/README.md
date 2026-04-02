# @claude-patterns/token-estimation

Hybrid exact+rough token estimation strategy that avoids expensive API calls.

## Source Reference

- **Files:** `services/tokenEstimation.ts` + `utils/tokens.ts`
- **LOC:** 829
- **KB Section:** 18 — Token Estimation
- **Tier:** Extract P1

## Key Concepts

- **Hybrid strategy** — Uses cached exact API counts for older messages, rough estimates for new ones
- **~4 chars/token heuristic** — Rough estimation fallback
- **File-type awareness** — Different bytes-per-token ratios for different file extensions

## Exports

- `countTokensWithAPI()` — Exact API-based token count
- `roughTokenCountEstimation()` — ~4 chars/token heuristic
- `roughTokenCountEstimationForMessages()` — Rough estimate for message arrays
- `bytesPerTokenForFileType()` — File-extension-aware ratio
- `tokenCountWithEstimation()` — Hybrid: exact + rough combined
- `Message` / `TokenUsage` — Interface types

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** auto-compact
