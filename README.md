# claude-code-patterns

A monorepo organizing 43 buildable systems extracted from Claude Code's source tree (~1,900 files, 512K+ LOC TypeScript) and Knowledge Base v2.1. Each package provides type stubs, source file references, and dependency mappings -- a pattern library for building skills, agents, and operational tools.

**This is NOT a fork of Claude Code.** It is a build reference with type stubs only.

## What This Is

Every package maps directly to a real Claude Code subsystem with exact source paths and type signatures, so builders can extract, adapt, or design-from-scratch without reverse-engineering the codebase.

## What This Is NOT

- Not a fork or mirror of Claude Code
- Not a runtime -- packages contain type stubs and TODO comments only
- Not published to npm -- packages are consumed by copy, not install
- Not a test suite -- stubs have no behavior to test

## Quick Start

```bash
# Install dependencies (TypeScript packages)
bun install

# Check all packages are scaffolded
make scaffold-check

# Verify type stubs compile
make type-check
```

### Extract a Single Package

1. Navigate to the package: `cd packages/extract/permission-system/`
2. Read `README.md` for source file paths and type signatures
3. Copy `src/index.ts` as your starting point
4. Replace TODO comments with implementations

## Tier Legend

| Tier | Count | Language | Description | Usage Pattern |
|------|-------|----------|-------------|---------------|
| **extract/** | 16 | TypeScript | Direct extraction targets from Claude Code source | Copy the source files, adapt imports, ship |
| **build/** | 19 | TypeScript | Architectural patterns for new builds | Use source as design reference, build your own |
| **translate/** | 8 | 4 Python + 4 TS | Cross-domain pattern applications | Apply Claude Code patterns to contact center / AI domains |

## Priority Matrix

| Priority | Count | Description | Build When |
|----------|-------|-------------|------------|
| **P0** | 8 | Foundation packages | First -- everything else depends on these |
| **P1** | 10 | High-value systems | After P0 -- strong portfolio and interview value |
| **P2** | 15 | Extended capabilities | As needed -- solid engineering value |
| **P3** | 10 | Nice-to-have | When time permits |

## Full Package Inventory

### Extract Tier (16 TypeScript packages)

| # | Package | Priority | LOC | Source Reference | Dependencies |
|---|---------|----------|-----|------------------|--------------|
| 1 | permission-system | P0 | 9,409 | `utils/permissions/` (24 files) | none |
| 2 | denial-tracking | P0 | 45 | `utils/permissions/denialTracking.ts` | none |
| 3 | yolo-classifier | P1 | 1,495 | `utils/permissions/yoloClassifier.ts` | permission-system |
| 4 | streaming-tool-executor | P1 | 530 | `services/tools/StreamingToolExecutor.ts` | none |
| 5 | state-store | P2 | 603 | `state/store.ts` + `state/AppStateStore.ts` | none |
| 6 | auto-compact | P1 | 3,960 | `services/compact/` (11 files) | token-estimation |
| 7 | token-estimation | P1 | 829 | `services/tokenEstimation.ts` + `utils/tokens.ts` | none |
| 8 | cost-tracker | P0 | 323 | `cost-tracker.ts` | none |
| 9 | subprocess-env-scrubbing | P2 | 99 | `utils/subprocessEnv.ts` | none |
| 10 | config-migration | P2 | 603 | `migrations/` (11 files) | none |
| 11 | sandbox-config | P2 | 1,153 | `utils/sandbox/` + `entrypoints/sandboxTypes.ts` | path-validation |
| 12 | path-validation | P2 | 485 | `utils/permissions/pathValidation.ts` | none |
| 13 | dangerous-command-detection | P2 | 12,411 | `utils/permissions/dangerousPatterns.ts` + `BashTool/` | permission-system, path-validation |
| 14 | read-only-validation | P2 | ~500 | `utils/shell/readOnlyCommandValidation.ts` | none |
| 15 | analytics-killswitch | P3 | 4,040 | `services/analytics/` (9 files) | none |
| 16 | claudemd-memory | P1 | 2,565 | `utils/claudemd.ts` + `skills/loadSkillsDir.ts` | none |

### Build Tier (19 TypeScript packages)

| # | Package | Priority | LOC | Source Reference | Dependencies |
|---|---------|----------|-----|------------------|--------------|
| 17 | prompt-system | P0 | 2,368 | `constants/prompts.ts` + `systemPromptSections.ts` | none |
| 18 | context-injection | P0 | 1,484 | `context.ts` + `QueryEngine.ts` | none |
| 19 | agent-dialogue-loop | P1 | 3,024 | `query.ts` + `QueryEngine.ts` | streaming-tool-executor, state-store, token-estimation |
| 20 | vim-mode-fsm | P3 | 1,513 | `vim/` (5 files) | none |
| 21 | keyboard-shortcuts | P3 | 3,159 | `keybindings/` (14 files) | none |
| 22 | ink-renderer | P3 | 19,848 | `ink/` (97 files) | none |
| 23 | skills-system | P1 | 4,066 | `skills/` (20 files) | claudemd-memory |
| 24 | mcp-integration | P2 | 12,310 | `services/mcp/` (23 files) | none |
| 25 | multi-agent-coordinator | P1 | 369 | `coordinator/coordinatorMode.ts` | mcp-integration |
| 26 | cli-startup-optimization | P2 | ~2,000 | `main.tsx` + `setup.ts` | none |
| 35 | tool-schema-cache | P2 | — | Tool schema caching (Section 21.3) | none |
| 36 | tool-registry | P2 | — | Tool system + three-layer filtering (Section 6.2-6.3) | none |
| 37 | dialogue-history-manager | P2 | — | Dialogue history management (Section 19) | none |
| 38 | system-reminder-injection | P2 | — | System reminder mechanism (Section 20) | none |
| 39 | plugin-lifecycle-manager | P2 | — | Plugin system lifecycle (Section 25) | none |
| 40 | sdk-bridge | P3 | — | Server and SDK mode (Section 26) | none |
| 41 | voice-input-gating | P3 | — | Voice input system (Section 34) | none |
| 42 | output-style-system | P3 | — | Output styles + markdown rendering (Section 35) | none |
| 43 | onboarding-flow-engine | P3 | — | Onboarding flow (Section 36) | none |

### Translate Tier (4 Python + 4 TypeScript)

| # | Package | Priority | Language | Source Pattern | Dependencies |
|---|---------|----------|----------|----------------|--------------|
| 27 | consecutive-breach-tracker | P0 | Python | Denial tracking (Pattern 7) | none |
| 28 | ivr-call-flow-validator | P1 | TypeScript | Vim FSM (Recipe 5) | none |
| 29 | agent-skill-routing | P1 | Python | Permission system (Recipe 1) | none |
| 30 | cost-per-interaction | P0 | Python | Cost tracker (Pattern + source) | none |
| 31 | prompt-cache-optimizer | P0 | TypeScript | Cache-stable ordering (Pattern 4) | none |
| 32 | workforce-scheduling-coordinator | P1 | Python | Multi-agent coordinator (Section 24) | none |
| 33 | genesys-flow-security-validator | P1 | TypeScript | Security audit patterns (Sections 8-10, 38) | none |
| 34 | multi-step-ivr-input-validator | P2 | TypeScript | Compound command decomposition (Section 8.6) | ivr-call-flow-validator |

## Architecture

This monorepo uses a **tiered package structure** (Option B from the ADR). See [ARCHITECTURE.md](ARCHITECTURE.md) for the full decision record evaluating three organization options against six criteria.

The `@claude-patterns/{name}` scope hides tier directories from import paths -- packages reference each other by name without knowing their tier.

## Dependencies

See [dependency-graph.md](dependency-graph.md) for the complete cross-package dependency map with visual ASCII tree.

Key dependency chains:
- `permission-system` <- yolo-classifier, dangerous-command-detection
- `token-estimation` <- auto-compact
- `path-validation` <- sandbox-config, dangerous-command-detection
- `claudemd-memory` <- skills-system
- `mcp-integration` <- multi-agent-coordinator
- `streaming-tool-executor` + `state-store` + `token-estimation` <- agent-dialogue-loop
- `ivr-call-flow-validator` <- multi-step-ivr-input-validator

## Development

### Make Targets

```bash
make scaffold-check  # Validate all 43 dirs have required files
make type-check      # tsc --noEmit across all TS packages
make lint            # Biome (TS) + Ruff (Python)
make list-packages   # Enumerate all 43 with tier and priority
```

### Adding a New Package

1. Choose the correct tier: extract (copy from source), build (design reference), translate (cross-domain)
2. Create directory: `packages/{tier}/{package-name}/`
3. Add `package.json` with `@claude-patterns/{name}` scope
4. Add `tsconfig.json` extending `../../tsconfig.base.json` (TS) or `pyproject.toml` (Python)
5. Create `src/index.ts` or `src/{name}/__init__.py` entry point with type stubs
6. Add `README.md` documenting source file paths and type signatures
7. Update workspace globs in root `package.json` if TypeScript

### Conventions

- Package scope: `@claude-patterns/{name}` -- tier directory invisible to imports
- TypeScript: strict mode, ES2022, Bun workspaces
- Python: pip install -e, pyproject.toml
- All packages: type stubs + TODO comments only. Zero implementations.
- Entry points: `src/index.ts` (TS) or `src/{name}/__init__.py` (Python)

## Project Structure

```
claude-code-patterns/
  CLAUDE.md                    # Context injection (~2K tokens)
  README.md                    # This file
  ARCHITECTURE.md              # ADR for Option B (Tiered packages/)
  dependency-graph.md          # Cross-package relationships
  package.json                 # Bun workspace root
  tsconfig.base.json           # Shared TS config (strict, ES2022)
  Makefile                     # scaffold-check, type-check, lint
  packages/
    extract/                   # 16 TS packages
    build/                     # 19 TS packages
    translate/                 # 8 packages (4 Python, 4 TS)
```

## Status

Project initialization in progress. GSD workflow active.

## Author

Pete Connor -- AI Transformation Leader
