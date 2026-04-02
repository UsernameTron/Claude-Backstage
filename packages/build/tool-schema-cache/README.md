# @claude-patterns/tool-schema-cache

Per-session tool schema caching to prevent prompt jitter from feature flag changes.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P2** — Core infrastructure for cache-stable tool ordering.

## Source Reference

- **Source pattern**: Tool schema caching (Section 21.3)
- **KB sections**: Section 21.3 (Tool Schema Caching), Section 6.3 (Cache-Stable Tool Ordering)

## Architecture

API tool schemas are cached per-session to prevent prompt jitter. When feature flags flip mid-session, tools may appear/disappear. Without caching, every tool list change invalidates the entire prompt cache downstream.

The cache freezes the tool schema set at session start and only updates on explicit refresh. This ensures deterministic tool ordering across the session lifetime, which is critical for prompt cache hit rates.

## Exports

- `ToolSchemaCache` — Class managing cached tool schemas with freeze/refresh lifecycle
- `CachedToolSchema` — Interface for a single cached schema entry with timestamp
- `CachePolicy` — Union type controlling cache behavior: freeze_on_start, refresh_on_change, manual

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
