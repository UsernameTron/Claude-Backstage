# @claude-patterns/cli-startup-optimization

CLI startup phases, lazy module loading, and fast-path patterns.

## Source Reference

- **Files:** `main.tsx` + `setup.ts`
- **LOC:** ~2,000
- **KB:** Recipe 4, Section 26 — CLI Startup Optimization
- **Tier:** Build P2

## Key Concepts

- **6-phase startup** — pre_init, config_load, auth_check, mcp_connect, prompt_assemble, ready
- **Lazy module loading** — Critical/deferred/idle priority scheduling defers non-essential imports
- **Fast path** — Bare mode and print mode skip interactive setup for faster cold start

## Exports

- `StartupPhase` — 6-phase union type
- `StartupConfig` — Startup behavior flags (bareMode, printMode, etc.)
- `LazyModule` — Module descriptor with name, loader, priority
- `StartupMetrics` — Per-phase timing and deferred module count
- `main()` — CLI entry point
- `setup()` — Initialization function
- `registerLazyModule()` — Register module for lazy loading
- `getStartupMetrics()` — Retrieve startup timing data

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
