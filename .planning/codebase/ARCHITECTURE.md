# Architecture

**Analysis Date:** 2026-04-02

## Pattern Overview

**Overall:** Tiered type-stub monorepo

**Key Characteristics:**
- 43 packages organized into 3 tiers by usage intent (extract, build, translate)
- Zero implementations — all packages contain type stubs with TODO comments only
- Each package maps 1:1 to a real Claude Code subsystem with exact source file paths
- Bun workspaces for TypeScript; `pip install -e` for Python
- `@claude-patterns/{name}` scope hides tier directories from import paths

## Tier System

**Extract (16 TypeScript packages):**
- Purpose: Direct extraction targets from Claude Code source
- Usage: Copy source files, adapt imports, ship
- Location: `packages/extract/`
- Contains: Permission system, cost tracking, state management, token estimation, security validation
- These packages have the most complete type stubs because they map directly to copyable source

**Build (19 TypeScript packages):**
- Purpose: Architectural patterns used as design reference for new builds
- Usage: Study source as reference, build your own implementation
- Location: `packages/build/`
- Contains: Prompt system, context injection, agent dialogue loop, MCP integration, UI systems
- These packages define interfaces and class shapes but require original implementation work

**Translate (4 Python + 4 TypeScript):**
- Purpose: Cross-domain pattern applications — Claude Code patterns applied to contact center / AI domains
- Usage: Apply Claude Code patterns to different problem domains
- Location: `packages/translate/`
- Contains: IVR validators, breach tracking, workforce scheduling, cost aggregation
- Python packages are excluded from Bun workspaces — managed via `pip install -e`
- TypeScript packages are explicitly listed in root workspace globs

## Package Anatomy

Every package follows the same scaffold structure regardless of tier:

**TypeScript package:**
```
packages/{tier}/{name}/
  package.json          # @claude-patterns/{name}, version 0.0.0, private
  tsconfig.json         # extends ../../../tsconfig.base.json
  README.md             # Source reference, key exports, architecture notes
  src/
    index.ts            # Type stubs + TODO comments
```

**Python package:**
```
packages/translate/{name}/
  pyproject.toml        # claude-patterns-{name}, requires-python >=3.11
  README.md             # Source pattern reference, key exports
  src/
    {snake_name}/
      __init__.py       # Type stubs + TODO comments (raise NotImplementedError)
```

## Dependency Resolution

**Workspace references:** TypeScript packages declare dependencies using `"workspace:*"` in `package.json`. The `@claude-patterns/{name}` scope resolves across tiers — a package in `extract/` can depend on a package in `build/` without knowing the tier path.

**Import pattern (cross-tier):**
```typescript
import type { ToolResult } from "@claude-patterns/streaming-tool-executor";
import type { Store } from "@claude-patterns/state-store";
```

**Key dependency chains (from `dependency-graph.md`):**
- `permission-system` <- `yolo-classifier`, `dangerous-command-detection`
- `token-estimation` <- `auto-compact`
- `path-validation` <- `sandbox-config`, `dangerous-command-detection`
- `claudemd-memory` <- `skills-system`
- `mcp-integration` <- `multi-agent-coordinator`
- `streaming-tool-executor` + `state-store` + `token-estimation` <- `agent-dialogue-loop`
- `ivr-call-flow-validator` <- `multi-step-ivr-input-validator`

**Independent packages (no monorepo dependencies):** 30 of 43 packages have zero upstream dependencies and can be built in any order.

## Priority System

Packages are prioritized P0-P3 to sequence build order:

| Priority | Count | Build When |
|----------|-------|------------|
| P0 | 8 | First — foundation packages everything else depends on |
| P1 | 10 | After P0 — high-value systems |
| P2 | 17 | As needed — extended capabilities |
| P3 | 8 | When time permits |

**Recommended build order:**
1. Independent P0 packages (no dependency resolution needed)
2. `permission-system` — foundation for downstream packages
3. Mid-tier packages with single downstream consumers (`path-validation`, `token-estimation`, `claudemd-memory`, `mcp-integration`)
4. Dependent packages last (`yolo-classifier`, `dangerous-command-detection`, `auto-compact`, `sandbox-config`, `skills-system`, `multi-agent-coordinator`, `agent-dialogue-loop`)

## Data Flow

**Package consumption flow (by tier):**

1. Developer identifies a Claude Code subsystem to use
2. Finds the corresponding package via tier + README
3. Copies `src/index.ts` (or `__init__.py`) as starting point
4. Reads README for source file paths in `claude-code/src/`
5. Replaces TODO stubs with real implementation extracted/adapted from source

**Type stub pattern:**
- TypeScript: Functions `throw new Error("TODO: extract from ...")` with full JSDoc
- Python: Methods `raise NotImplementedError("TODO: translate from ...")` with docstrings
- Both include KB section references for context

## Entry Points

**Monorepo root:**
- Location: `package.json` at project root
- Purpose: Bun workspace configuration listing all TS packages
- Workspace globs: `packages/extract/*`, `packages/build/*`, plus 4 explicit translate TS packages

**Per-package entry:**
- TypeScript: `src/index.ts` (declared as both `main` and `types` in `package.json`)
- Python: `src/{snake_name}/__init__.py`

**Makefile targets:**
- `make scaffold-check` — Validates all 43 dirs have required files
- `make type-check` — `tsc --noEmit` across all TS packages
- `make lint` — Biome (TS) + Ruff (Python)
- `make list-packages` — Enumerate all 43 with tier and priority

## Reference Source

**Location:** `claude-code/` directory (gitignored, separate git repo)

The `claude-code/src/` directory contains a subset of Claude Code's actual source tree used as reference material. Package READMEs reference exact paths within this tree (e.g., `utils/permissions/` for permission-system). This directory is not part of the monorepo deliverable — it exists solely as a lookup reference during implementation.

Key source directories mapped to packages:
- `claude-code/src/utils/permissions/` -> `permission-system`, `yolo-classifier`, `dangerous-command-detection`, `path-validation`
- `claude-code/src/query.ts` + `QueryEngine.ts` -> `agent-dialogue-loop`, `context-injection`
- `claude-code/src/services/mcp/` -> `mcp-integration`
- `claude-code/src/skills/` -> `skills-system`
- `claude-code/src/vim/` -> `vim-mode-fsm`
- `claude-code/src/ink/` -> `ink-renderer`
- `claude-code/src/constants/prompts.ts` -> `prompt-system`

## Cross-Cutting Concerns

**Logging:** Not applicable — type stubs only, no runtime behavior
**Validation:** Type-level validation via TypeScript strict mode and `tsc --noEmit`
**Error Handling:** All stubs throw `Error("TODO: ...")` (TS) or `NotImplementedError("TODO: ...")` (Python) — implementers replace these with real logic

## Design Decisions

**ADR: Tiered vs Flat vs Domain organization** (documented in `ARCHITECTURE.md` at project root):
- Flat (Option A) rejected: 43 dirs to scan, poor discoverability
- Domain (Option C) rejected: unclear domain boundaries, cross-domain deps
- Tiered (Option B) selected: tier name = usage intent, KB v2.1 aligned, ~80 tokens for context injection vs ~150 for flat

**Scope hiding:** `@claude-patterns/{name}` deliberately hides tier path from import resolution. Moving a package between tiers requires zero import changes in dependents.

**No runtime, no tests:** Packages are type stubs only — there is no behavior to test. Validation is structural (scaffold-check) and type-level (tsc --noEmit).

---

*Architecture analysis: 2026-04-02*
