# Codebase Structure

**Analysis Date:** 2026-04-02

## Directory Layout

```
claude-code-patterns/
├── .claude/
│   ├── skills/                          # 5 project-scoped skills
│   │   ├── agent-architecture-review/
│   │   ├── monorepo-pattern-extractor/
│   │   ├── permission-system-generator/
│   │   ├── security-threat-modeler/
│   │   └── streaming-agent-loop-builder/
│   └── worktrees/                       # Git worktree state (gitignored)
├── .planning/
│   ├── codebase/                        # Codebase mapping docs (this directory)
│   ├── phases/                          # GSD phase plans
│   ├── research/                        # Research artifacts
│   ├── config.json                      # GSD config
│   ├── PROJECT.md                       # Project context
│   ├── REQUIREMENTS.md                  # Requirements tracking
│   ├── ROADMAP.md                       # Milestone roadmap
│   └── STATE.md                         # Current execution state
├── claude-code/                         # Reference source (gitignored, separate repo)
│   └── src/                             # Claude Code source tree subset
├── packages/
│   ├── extract/                         # 16 TypeScript packages (copy + adapt)
│   │   ├── analytics-killswitch/
│   │   ├── auto-compact/
│   │   ├── claudemd-memory/
│   │   ├── config-migration/
│   │   ├── cost-tracker/
│   │   ├── dangerous-command-detection/
│   │   ├── denial-tracking/
│   │   ├── path-validation/
│   │   ├── permission-system/
│   │   ├── read-only-validation/
│   │   ├── sandbox-config/
│   │   ├── state-store/
│   │   ├── streaming-tool-executor/
│   │   ├── subprocess-env-scrubbing/
│   │   ├── token-estimation/
│   │   └── yolo-classifier/
│   ├── build/                           # 19 TypeScript packages (design reference)
│   │   ├── agent-dialogue-loop/
│   │   ├── cli-startup-optimization/
│   │   ├── context-injection/
│   │   ├── dialogue-history-manager/
│   │   ├── ink-renderer/
│   │   ├── keyboard-shortcuts/
│   │   ├── mcp-integration/
│   │   ├── multi-agent-coordinator/
│   │   ├── onboarding-flow-engine/
│   │   ├── output-style-system/
│   │   ├── plugin-lifecycle-manager/
│   │   ├── prompt-system/
│   │   ├── sdk-bridge/
│   │   ├── skills-system/
│   │   ├── system-reminder-injection/
│   │   ├── tool-registry/
│   │   ├── tool-schema-cache/
│   │   ├── vim-mode-fsm/
│   │   └── voice-input-gating/
│   └── translate/                       # 4 Python + 4 TypeScript packages
│       ├── agent-skill-routing/         # Python
│       ├── consecutive-breach-tracker/  # Python
│       ├── cost-per-interaction/        # Python
│       ├── genesys-flow-security-validator/  # TypeScript
│       ├── ivr-call-flow-validator/     # TypeScript
│       ├── multi-step-ivr-input-validator/   # TypeScript
│       ├── prompt-cache-optimizer/      # TypeScript
│       └── workforce-scheduling-coordinator/ # Python
├── docs/                                # Documentation
├── state/                               # Session audit trail (gitignored)
├── tasks/                               # Governance tracking
│   └── lessons.md
├── ARCHITECTURE.md                      # ADR: tiered package organization
├── biome.json                           # TypeScript linter/formatter config
├── bun.lock                             # Bun lockfile
├── CLAUDE.md                            # Context injection for Claude Code
├── dependency-graph.md                  # Cross-package dependency map
├── IMPLEMENTATION-PLAYBOOK.md           # Implementation guide
├── Makefile                             # scaffold-check, type-check, lint, list-packages
├── package.json                         # Bun workspace root
├── README.md                            # Project documentation
├── ruff.toml                            # Python linter config
├── SCAFFOLD-EXPANSION-PROMPT.md         # Scaffold generation prompt (gitignored)
└── tsconfig.base.json                   # Shared TypeScript config
```

## Directory Purposes

**`packages/extract/`:**
- Purpose: Direct extraction targets — copy from Claude Code source, adapt, ship
- Contains: 16 TypeScript packages with type stubs
- Key packages: `permission-system` (P0 foundation), `cost-tracker`, `denial-tracking`, `token-estimation`

**`packages/build/`:**
- Purpose: Design reference — study source architecture, build your own
- Contains: 19 TypeScript packages with type stubs
- Key packages: `prompt-system`, `context-injection`, `agent-dialogue-loop`, `skills-system`

**`packages/translate/`:**
- Purpose: Cross-domain pattern applications — Claude Code patterns applied to contact center / AI
- Contains: 4 Python + 4 TypeScript packages
- Key packages: `consecutive-breach-tracker` (Python, P0), `prompt-cache-optimizer` (TS, P0)

**`claude-code/`:**
- Purpose: Reference source tree for looking up real Claude Code implementations
- Contains: Subset of Claude Code source (`src/` directory)
- Generated: No — cloned separately
- Committed: No — gitignored, has its own `.git`

**`.claude/skills/`:**
- Purpose: 5 project-scoped Claude Code skills for development assistance
- Contains: `agent-architecture-review`, `monorepo-pattern-extractor`, `permission-system-generator`, `security-threat-modeler`, `streaming-agent-loop-builder`

**`.planning/`:**
- Purpose: GSD execution state — phases, roadmap, project context
- Contains: `STATE.md`, `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, phase plans

## Key File Locations

**Entry Points:**
- `package.json`: Bun workspace root defining all TS package globs
- `Makefile`: Primary build/validation commands
- `tsconfig.base.json`: Shared TypeScript config (strict, ES2022, Bun types)

**Configuration:**
- `biome.json`: TypeScript linting and formatting (2-space indent, double quotes, semicolons)
- `ruff.toml`: Python linting (target py311, line-length 120, select E/F/I/UP/B)
- `tsconfig.base.json`: TypeScript strict mode, ES2022, bundler module resolution

**Core Reference Docs:**
- `ARCHITECTURE.md`: ADR documenting the tiered organization decision
- `dependency-graph.md`: Complete cross-package dependency map with ASCII tree
- `IMPLEMENTATION-PLAYBOOK.md`: Guide for implementing packages
- `README.md`: Full package inventory with priorities, LOC, source references

**Per-Package Critical Files:**
- `packages/{tier}/{name}/src/index.ts`: TypeScript type stubs (entry point)
- `packages/{tier}/{name}/src/{snake_name}/__init__.py`: Python type stubs (entry point)
- `packages/{tier}/{name}/README.md`: Source paths, key exports, architecture notes
- `packages/{tier}/{name}/package.json`: Workspace manifest with `@claude-patterns/{name}` scope
- `packages/{tier}/{name}/tsconfig.json`: Extends `tsconfig.base.json` (TS only)
- `packages/{tier}/{name}/pyproject.toml`: Python package manifest (Python only)

## Naming Conventions

**Files:**
- TypeScript entry: `src/index.ts` (always)
- Python entry: `src/{snake_case_name}/__init__.py`
- Package manifest: `package.json` (TS) or `pyproject.toml` (Python)
- TypeScript config: `tsconfig.json` extending base

**Directories:**
- Package names: kebab-case (`permission-system`, `cost-tracker`)
- Python source dirs: snake_case matching package name (`consecutive_breach_tracker`)
- Tiers: lowercase single word (`extract`, `build`, `translate`)

**Package scope:**
- npm scope: `@claude-patterns/{name}` — tier directory invisible to imports
- Python naming: `claude-patterns-{kebab-name}` in pyproject.toml

## Where to Add New Code

**New TypeScript package (extract or build tier):**
1. Create directory: `packages/{extract|build}/{package-name}/`
2. Add `package.json` with `"name": "@claude-patterns/{name}"`, version `0.0.0`, private true
3. Add `tsconfig.json`: `{"extends": "../../../tsconfig.base.json", "compilerOptions": {"rootDir": "src", "outDir": "dist"}, "include": ["src"]}`
4. Create `src/index.ts` with type stubs, JSDoc, and TODO comments
5. Create `README.md` with source reference, key exports, architecture notes
6. Packages in `extract/*` and `build/*` are auto-included by workspace globs

**New TypeScript package (translate tier):**
- Same as above but in `packages/translate/{name}/`
- Must explicitly add to `workspaces` array in root `package.json`

**New Python package (translate tier only):**
1. Create directory: `packages/translate/{package-name}/`
2. Add `pyproject.toml` with `name = "claude-patterns-{name}"`, requires-python `>=3.11`
3. Create `src/{snake_name}/__init__.py` with type stubs using `raise NotImplementedError`
4. Create `README.md` with source pattern reference
5. Add source path to `ruff.toml` `src` list
6. Do NOT add to root `package.json` workspaces (Python packages managed by pip)
7. Add package name to `TRANSLATE_PY_PKGS` in `Makefile`

**New skill:**
- Location: `.claude/skills/{skill-name}/SKILL.md`

**New documentation:**
- Project docs: `docs/`
- Architecture decisions: root-level markdown files
- GSD plans: `.planning/phases/`

## Special Directories

**`claude-code/`:**
- Purpose: Reference copy of Claude Code source tree
- Generated: No (manually cloned)
- Committed: No (gitignored, has own `.git`)
- Usage: Lookup source implementations when building packages

**`node_modules/`:**
- Purpose: Bun-managed dependencies
- Generated: Yes (`bun install`)
- Committed: No

**`state/`:**
- Purpose: Session audit trail
- Generated: Yes (by GSD framework)
- Committed: No (gitignored)

**`.ruff_cache/`:**
- Purpose: Ruff linter cache
- Generated: Yes
- Committed: No (gitignored)

**`dist/` (per-package):**
- Purpose: TypeScript build output
- Generated: Yes (`tsc`)
- Committed: No (gitignored)
- Note: Not currently used — packages use `src/index.ts` directly as entry point

---

*Structure analysis: 2026-04-02*
