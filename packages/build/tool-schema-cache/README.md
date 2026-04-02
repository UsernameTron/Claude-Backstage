# @claude-patterns/tool-schema-cache

Tool schema caching pattern that freezes schemas at session start for prompt cache stability.

## Tier

**Build** — Design reference. Architectural pattern for new builds.

## Priority

**P2** — Supporting subsystem for prompt cache optimization.

## Source Pattern

- **KB sections**: Section 21.3 — Tool schema freezing for cache stability

## Architecture

Tool schemas are frozen at session start so that mid-session feature flag changes do not invalidate the prompt cache prefix. The cache provides a deterministic ordering of schemas (`getStableSchemaList`) to ensure consistent cache keys across turns.

### Cache Policies

- **freeze_on_start** — Lock schemas at session init (default for stability)
- **refresh_on_change** — Re-cache when tool set changes
- **manual** — Only refresh on explicit `invalidate()` call

## Exports

- `CachePolicy` — Union type for cache refresh policies
- `Tool` — Minimal tool representation (name, description, inputSchema)
- `CachedToolSchema` — Cached schema snapshot with timestamp
- `ToolSchemaCache` — Cache manager class with get/set/refresh/invalidate/getStableSchemaList

## Dependencies

None

## Status

Type stubs only. All methods throw `Error`.
