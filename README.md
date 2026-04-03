# claude-code-patterns

A monorepo of 43 working implementations extracted from Claude Code's source tree (~1,900 files, 512K+ LOC TypeScript) and Knowledge Base v2.1. Each package provides working reference code, tests, source file references, and dependency mappings -- a pattern library for building skills, agents, and operational tools.

**This is NOT a fork of Claude Code.** It is a build reference with working implementations.

## What This Is

Every package maps directly to a real Claude Code subsystem with exact source paths, working implementations, and test coverage, so builders can extract, adapt, or design-from-scratch without reverse-engineering the codebase.

## What This Is NOT

- Not a fork or mirror of Claude Code
- Not published to npm -- packages are consumed by copy, not install
- Not production runtime -- implementations are reference patterns, not deployment artifacts

## Quick Start

```bash
# Install dependencies (TypeScript packages)
bun install

# Check all packages are scaffolded
make scaffold-check

# Verify all packages compile
make type-check

# Run all tests (513 TS + 54 Python)
make test
```

### Use a Package

1. Navigate to the package: `cd packages/extract/permission-system/`
2. Read `README.md` for source file paths and type signatures
3. Read the implementation in `src/index.ts` for working patterns
4. Run tests: `bun test` to see behavior in action
5. Copy and adapt for your own project

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
| **P2** | 17 | Extended capabilities | As needed -- solid engineering value |
| **P3** | 8 | Nice-to-have | When time permits |

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
| 35 | tool-schema-cache | P2 | ~500 | Tool schema caching (Sec 21.3) | none |
| 36 | tool-registry | P2 | ~1,000 | Tool system (Sec 6.2-6.3) | none |
| 37 | dialogue-history-manager | P2 | ~800 | Dialogue history (Sec 19) | none |
| 38 | system-reminder-injection | P2 | ~600 | System reminder mechanism (Sec 20) | none |
| 39 | plugin-lifecycle-manager | P2 | ~1,200 | Plugin system (Sec 25) | none |
| 40 | sdk-bridge | P3 | ~800 | Server/SDK mode (Sec 26) | none |
| 41 | voice-input-gating | P3 | ~400 | Voice input system (Sec 34) | none |
| 42 | output-style-system | P3 | ~600 | Output styles + markdown (Sec 35) | none |
| 43 | onboarding-flow-engine | P3 | ~500 | Onboarding flow (Sec 36) | none |

### Translate Tier (4 Python + 4 TypeScript)

| # | Package | Priority | Language | Source Pattern | Dependencies |
|---|---------|----------|----------|----------------|--------------|
| 27 | consecutive-breach-tracker | P0 | Python | Denial tracking (Pattern 7) | none |
| 28 | ivr-call-flow-validator | P1 | TypeScript | Vim FSM (Recipe 5) | none |
| 29 | agent-skill-routing | P1 | Python | Permission system (Recipe 1) | none |
| 30 | cost-per-interaction | P0 | Python | Cost tracker (Pattern + source) | none |
| 31 | prompt-cache-optimizer | P0 | TypeScript | Cache-stable ordering (Pattern 4) | none |
| 32 | workforce-scheduling-coordinator | P1 | Python | Multi-agent coordinator (Sec 24) | none |
| 33 | genesys-flow-security-validator | P1 | TypeScript | Security audit patterns (Sec 8-10, 38) | none |
| 34 | multi-step-ivr-input-validator | P2 | TypeScript | Compound command decomposition (Sec 8.6) | ivr-call-flow-validator |

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
make test            # Run all tests (513 TS + 54 Python)
make list-packages   # Enumerate all 43 with tier and priority
```

### Conventions

- Package scope: `@claude-patterns/{name}` -- tier directory invisible to imports
- TypeScript: strict mode, ES2022, Bun workspaces
- Python: pip install -e, pyproject.toml
- All packages: working reference implementations with tests (567 tests across 43 packages)
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
  Makefile                     # scaffold-check, type-check, lint, test
  packages/
    extract/                   # 16 TS packages
    build/                     # 19 TS packages
    translate/                 # 8 packages (4 Python, 4 TS)
```

## Status

v2.2 complete. All 43 packages implemented with 567 tests. Zero TODO throws. Full monorepo build clean.

## Author

Pete Connor -- AI Transformation Leader
