---
phase: 09-wave4-p2-engineering
plan: 02
subsystem: mcp-integration, cli-startup-optimization
tags: [build-tier, mcp, cli, startup, lazy-loading, tdd]
dependency_graph:
  requires: []
  provides: [mcp-integration, cli-startup-optimization]
  affects: [multi-agent-coordinator]
tech_stack:
  added: []
  patterns: [config-validation, phase-sequencing, lazy-module-registration, connection-state-machine]
key_files:
  created:
    - packages/build/mcp-integration/src/mcp-integration.test.ts
    - packages/build/cli-startup-optimization/src/cli-startup-optimization.test.ts
  modified:
    - packages/build/mcp-integration/src/index.ts
    - packages/build/cli-startup-optimization/src/index.ts
decisions:
  - "Config validation uses switch dispatch on transport type for extensibility"
  - "Module-level state with resetState() for test isolation (matches project pattern)"
  - "Critical lazy modules load synchronously on register; deferred counted at metrics collection"
metrics:
  duration: 2min
  completed: 2026-04-03
---

# Phase 09 Plan 02: Build Standalone (mcp-integration + cli-startup-optimization) Summary

MCP server connection lifecycle with config validation and tool proxying; CLI startup with 6-phase sequencing and priority-based lazy module loading.

## What Was Built

### mcp-integration
- `connectToServer()`: validates config per transport type (stdio needs command, http/sse needs url), returns McpConnection with connected/error status
- `getMcpToolsCommandsAndResources()`: aggregates tools/resources from connected servers only, filters disconnected
- `disconnectServer()`: sets status to disconnected, clears tools/resources arrays
- `proxyToolCall()`: validates connection status and tool existence before returning simulated result

### cli-startup-optimization
- `main()`: runs 6 ordered phases (pre_init, config_load, auth_check, mcp_connect, prompt_assemble, ready) with per-phase timing
- `setup()`: runs config_load + auth_check + optional mcp_connect (skipped in bareMode)
- `registerLazyModule()`: critical priority loads immediately, deferred/idle stored for later
- `getStartupMetrics()`: returns totalMs, per-phase breakdown, deferred module count

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 RED | bfdd242 | Failing tests for mcp-integration (14 tests) |
| 1 GREEN | 35a57d5 | Implement mcp-integration (14 pass) |
| 2 RED | f34a5aa | Failing tests for cli-startup-optimization (13 tests) |
| 2 GREEN | d8d70e1 | Implement cli-startup-optimization (13 pass) |

## Test Results

- **mcp-integration**: 14 tests, 26 assertions, all passing
- **cli-startup-optimization**: 13 tests, 29 assertions, all passing
- **Total**: 27 tests, 55 assertions
- **tsc --noEmit**: clean for both packages

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None. All TODO throws replaced with working implementations.

## Self-Check: PASSED
