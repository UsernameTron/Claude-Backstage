# @claude-patterns/plugin-lifecycle-manager

Plugin system lifecycle management with four-phase lifecycle: Discovery, Cache, Cleanup, Telemetry.

## Tier

**Build** — Design reference. Architectural pattern for new builds.

## Priority

**P2** — Supporting subsystem for plugin ecosystem management.

## Source Pattern

- **KB sections**: Section 25 — Plugin system lifecycle

## Architecture

The plugin lifecycle follows four phases:

1. **Discovery** — Scan seed directories (user, project, system) for plugin manifests
2. **Cache** — Persist discovered manifests for fast startup on subsequent sessions
3. **Cleanup** — Remove orphaned plugins that are cached but no longer present in seed directories
4. **Telemetry** — Log which plugins are active in each session for analytics

### Plugin States

Plugins transition through states: `discovered` -> `cached` -> `active`. Plugins that disappear from seed dirs become `orphaned` and are cleaned up. Failed plugins enter `error` state.

## Exports

- `PluginState` — Union of 5 lifecycle states
- `PluginManifest` — Plugin descriptor (name, version, skills, mcpServers, hooks)
- `PluginLifecycleConfig` — Manager config (seedDirs, cacheDir, maxCacheAge)
- `PluginLifecycleManager` — Manager class with discover/cache/cleanup/telemetry operations

## Dependencies

None

## Status

Working implementation. `PluginLifecycleManager` provides functional `discover()` (simulated seed directory scan), `loadFromCache()` (cached manifest loading), `cleanupOrphaned()` (orphan removal), `logSessionPlugins()` (telemetry recording), `getState()` (lifecycle state lookup), and `activate()` (state transition to active). Tests verify the four-phase lifecycle (see `__tests__/`).
