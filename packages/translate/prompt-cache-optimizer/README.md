# prompt-cache-optimizer

Prompt cache optimization for API cost reduction, translated from Claude Code's cache-stable ordering pattern.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P0** — Core translate package.

## Source Pattern

- **Pattern 4**: Cache-Stable Ordering
- **Source file**: `constants/prompts.ts` (cache ordering logic)
- **KB sections**: Section 15 (Prompt Caching), Pattern 4

## How It Works

Claude Code achieves 40-70% cost reduction by maintaining cache-stable prefix ordering in system prompts. The key insight: inserting dynamic content between static content invalidates all downstream cache entries.

### Three-Tier Scoping

| Scope | Content Type | Cache Behavior |
|-------|-------------|----------------|
| Global | System prompt, tool definitions | Shared across all requests |
| Org | Organization config, custom rules | Shared within org |
| None | Conversation history, per-turn context | Never cached |

### Ordering Rule

```
[Global content] -> [Org content] -> [CACHE BOUNDARY] -> [Dynamic content]
```

Content before the boundary marker is cache-stable. Content after may change per request. Moving the boundary further right increases cache hit rate but reduces personalization flexibility.

## Exports

- `optimizeCacheOrder(segments)` — Reorder segments for optimal cache utilization
- `isStableSegment(segment)` — Check if segment belongs before cache boundary
- `estimateCacheSavings(totalTokens, stableTokens)` — Estimate cost reduction ratio
- `CacheScope` — Enum: Global, Org, None
- `CacheSegment` — Interface: content, scope, stable flag
- `CacheOptimizationResult` — Interface: ordered segments, hit rate, boundary position
- `CACHE_BOUNDARY_MARKER` — Constant boundary string

## Status

Type stubs only. All functions throw `Error("TODO")`.
