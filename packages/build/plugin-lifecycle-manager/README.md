# @claude-patterns/plugin-lifecycle-manager

Four-phase plugin lifecycle: Discovery, Cache, Cleanup, and Telemetry.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P2** — Manages plugin installation, versioning, cache invalidation, and session activation.

## Source Reference

- **Source pattern**: Plugin system lifecycle (Section 25)
- **KB sections**: Section 25 (Plugin System)

## Architecture

Four-phase lifecycle: Discovery (`getPluginSeedDirs()`) then Cache (`loadAllPluginsCacheOnly()`) then Cleanup (`cleanupOrphanedPluginVersionsInBackground()`) then Telemetry (`logPluginsEnabledForSession()`). Manages plugin installation, versioning, cache invalidation, and session-level activation tracking.

Each phase is independently executable, allowing partial lifecycle runs (e.g., cache-only load on fast startup, full discovery on first run). Orphan cleanup runs in the background to avoid blocking session start.

## Exports

- `PluginManifest` — Interface for plugin metadata including name, version, skills, hooks
- `PluginState` — Union type tracking plugin through lifecycle stages
- `PluginLifecycleConfig` — Configuration for seed directories, cache location, max age
- `PluginLifecycleManager` — Class managing the four-phase lifecycle

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
