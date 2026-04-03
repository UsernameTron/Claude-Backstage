# @claude-patterns/tool-registry

Three-layer tool assembly and registry for merging built-in and external tools with deny-rule filtering.

## Tier

**Build** — Design reference. Architectural pattern for new builds.

## Priority

**P2** — Supporting subsystem for tool management.

## Source Pattern

- **KB sections**: Section 6.2 — Tool compilation, Section 6.3 — Runtime deny-rule filtering

## Architecture

Tool assembly follows three filtering layers:

1. **Compile-time** — Static elimination of disabled tools at build time
2. **Runtime deny** — Dynamic deny-rule filtering per session/request
3. **Assembly** — Final merge of built-in and external (MCP) tools into a ToolPool

Tools are sorted deterministically (`sortForCacheStability`) so the prompt cache key remains stable across sessions with identical tool sets.

## Exports

- `Tool` — Tool with name, description, inputSchema, callable, permissions
- `ToolPool` — Assembled tool collection with lookup and filtering
- `ToolFilterLayer` — Union type for the three filtering layers
- `assembleToolPool(builtIn, external, denyRules)` — Full assembly pipeline
- `filterToolsByDenyRules(tools, denyRules)` — Deny-rule filter
- `sortForCacheStability(tools)` — Deterministic sort for cache keys
- `registerTool(tool)` — Add to global registry
- `getAllTools()` — Retrieve all registered tools

## Dependencies

None

## Status

Working implementation. Three-layer assembly pipeline with global registry, deny-rule filtering, and deterministic sort for prompt cache stability. 97 LOC with tests.
