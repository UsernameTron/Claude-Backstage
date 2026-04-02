# @claude-patterns/tool-registry

Three-layer tool assembly: compile-time elimination, runtime deny-rule filtering, and built-in/external merge.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P2** — Foundation for tool system architecture.

## Source Reference

- **Source pattern**: Tool system + three-layer filtering (Section 6.2-6.3)
- **KB sections**: Section 6 (Tool System), Section 6.3 (Three-Layer Tool Filtering)

## Architecture

Three-layer tool assembly: compile-time elimination (feature flags) then runtime deny-rule filtering then merge built-in + external tools. The `assembleToolPool()` pattern ensures built-in tools are a sorted contiguous prefix for cache stability, with external (MCP) tools appended after.

This layered filtering approach means each layer operates independently: compile-time removes tools that should never exist in this build, runtime deny rules handle per-session configuration, and assembly merges the final pool with deterministic ordering.

## Exports

- `Tool` — Interface for a registered tool with name, schema, call function, and permissions
- `ToolPool` — Interface for the assembled tool collection with lookup and filter
- `ToolFilterLayer` — Type for the three filtering layers
- `assembleToolPool` — Assembles final tool pool from built-in, external, and deny rules
- `filterToolsByDenyRules` — Applies runtime deny rules to a tool list
- `sortForCacheStability` — Deterministic sort: built-in prefix, external suffix
- `registerTool` — Register a single tool
- `getAllTools` — Retrieve all registered tools

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
