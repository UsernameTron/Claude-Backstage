---
phase: 03-extract-tier-completion
plan: 02
subsystem: extract-tier-dependent-packages
tags: [extract, type-stubs, cross-package-deps, workspace-wiring]
dependency_graph:
  requires: [permission-system, token-estimation, path-validation]
  provides: [yolo-classifier, auto-compact, sandbox-config, dangerous-command-detection]
  affects: [extract-tier]
tech_stack:
  added: []
  patterns: [workspace-dependency-wiring, cross-package-type-imports]
key_files:
  created:
    - packages/extract/yolo-classifier/package.json
    - packages/extract/yolo-classifier/tsconfig.json
    - packages/extract/yolo-classifier/src/index.ts
    - packages/extract/yolo-classifier/README.md
    - packages/extract/auto-compact/package.json
    - packages/extract/auto-compact/tsconfig.json
    - packages/extract/auto-compact/src/index.ts
    - packages/extract/auto-compact/README.md
    - packages/extract/sandbox-config/package.json
    - packages/extract/sandbox-config/tsconfig.json
    - packages/extract/sandbox-config/src/index.ts
    - packages/extract/sandbox-config/README.md
    - packages/extract/dangerous-command-detection/package.json
    - packages/extract/dangerous-command-detection/tsconfig.json
    - packages/extract/dangerous-command-detection/src/index.ts
    - packages/extract/dangerous-command-detection/README.md
  modified: []
decisions:
  - Cross-package imports use `import type` for type-only imports and value imports for re-exported constants
metrics:
  duration: 3min
  completed: 2026-04-02
---

# Phase 03 Plan 02: Dependent Extract Packages Summary

4 dependent extract packages scaffolded with workspace dependency wiring: yolo-classifier (permission-system), auto-compact (token-estimation), sandbox-config (path-validation), dangerous-command-detection (permission-system + path-validation).

## What Was Done

### Task 1: yolo-classifier and auto-compact (c08c873)

- **yolo-classifier**: Model-watching-model architecture stubs. Imports `PermissionMode`/`PermissionResult` from `@claude-patterns/permission-system` via `workspace:*`. Exports `YoloClassifierResult`, `classifierDecision`, `classifierShared`, `classifierToPermission`.
- **auto-compact**: Threshold-based compaction stubs. Imports `Message`/`TokenUsage` from `@claude-patterns/token-estimation` via `workspace:*`. Exports `COMPACT_THRESHOLDS`, `CompactionResult`, `CompactBoundary`, `compactConversation`, `partialCompactConversation`, `shouldAutoCompact`, `getEffectiveWindow`.

### Task 2: sandbox-config and dangerous-command-detection (8b00b3c)

- **sandbox-config**: Self-referential security stubs. Imports `PathCheckResult`/`FileOperationType` from `@claude-patterns/path-validation` via `workspace:*`. Exports `SandboxConfig`, `ISandboxManager`, `convertToSandboxRuntimeConfig`, `resolveSandboxFilesystemPath`, `shouldUseSandbox`, `containsExcludedCommand`.
- **dangerous-command-detection**: Compound command decomposition stubs. Imports from BOTH `@claude-patterns/permission-system` AND `@claude-patterns/path-validation`. Re-exports `DANGEROUS_BASH_PATTERNS` and `CROSS_PLATFORM_CODE_EXEC`. Exports `decomposeCompoundCommand`, `isDangerousCommand`, `parseForSecurity`, `isCommandSafeForPlanMode`, `isFileDangerousForOperation`.

## Verification Results

- All 16 extract packages pass `tsc --noEmit`
- `make scaffold-check` reports 16/16 extract packages present (21/31 total)
- All 5 cross-package import lines verified via grep
- `bun install` resolves all workspace deps (34 packages, 0 changes)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

All functions in all 4 packages contain `TODO` comments referencing source paths and throw `Error("TODO: ...")`. This is intentional per project design (type stubs only, zero implementations).
