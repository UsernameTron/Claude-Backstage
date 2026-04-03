# @claude-patterns/auto-compact

Threshold-based auto-compaction system. Summarizes and replaces older messages when context window usage approaches limits, with boundary markers and 200K special handling.

- **Source:** `services/compact/` (11 files, 3,960 LOC)
- **KB:** Section 18
- **Tier:** Extract P1
- **Depends:** token-estimation
- **Downstream:** agent-dialogue-loop (Phase 4)

## Key Pattern

Auto-compact triggers when token count exceeds `effectiveWindow - 13,000`. The effective window is `modelContextWindow - min(maxOutputTokens, 20,000)`. Compaction creates a summary boundary marker preserving recent context while replacing older messages. Contexts over 200K tokens get special handling.

## Status

Working implementation. Exports `getEffectiveWindow()`, `shouldAutoCompact()`, `compactConversation()`, and `partialCompactConversation()` with message summarization, boundary markers, and token estimation via the `token-estimation` dependency. Tests in `src/auto-compact.test.ts`.
