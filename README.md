# claude-code-patterns

A monorepo organizing 31 buildable systems extracted from Claude Code's source tree (~1,900 files, 512K+ LOC TypeScript) and Knowledge Base v2.1. Each package provides type stubs, source file references, and dependency mappings — a pattern library for building skills, agents, and operational tools.

**This is NOT a fork of Claude Code.** It is a build reference with type stubs only.

## What This Does

Every package maps directly to a real Claude Code subsystem with exact source paths and type signatures, so builders can extract, adapt, or design-from-scratch without reverse-engineering the codebase.

## Tier Legend

| Tier | Count | Language | Purpose |
|------|-------|----------|---------|
| **extract/** | 16 | TypeScript | Copy, adapt, ship. Direct extraction targets. |
| **build/** | 10 | TypeScript | Design reference. Architectural patterns. |
| **translate/** | 5 | 3 Python + 2 TS | New builds adapted from Claude Code patterns. |

## Priority Matrix

| Priority | Packages | Description |
|----------|----------|-------------|
| **P0** | 8 | Foundation — build these first |
| **P1** | 8 | Core systems — depend on P0 |
| **P2** | 10 | Extended capabilities |
| **P3** | 5 | Nice-to-have |

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

## Package Inventory

### Extract Tier (16 TypeScript)

| # | Package | Priority | LOC | KB Section |
|---|---------|----------|-----|------------|
| 1 | permission-system | P0 | 9,409 | §8 |
| 2 | denial-tracking | P0 | 45 | §8 |
| 3 | yolo-classifier | P1 | 1,495 | §8 |
| 4 | streaming-tool-executor | P1 | 530 | §6 |
| 5 | state-store | P2 | 603 | §7 |
| 6 | auto-compact | P1 | 3,960 | §18-19 |
| 7 | token-estimation | P1 | 829 | §18 |
| 8 | cost-tracker | P0 | 323 | §29 |
| 9 | subprocess-env-scrubbing | P2 | 99 | §13 |
| 10 | config-migration | P2 | 603 | §4 |
| 11 | sandbox-config | P2 | 1,153 | §9 |
| 12 | path-validation | P2 | 485 | §10 |
| 13 | dangerous-command-detection | P2 | 12,411 | §10 |
| 14 | read-only-validation | P2 | ~500 | §10 |
| 15 | analytics-killswitch | P3 | 4,040 | §14 |
| 16 | claudemd-memory | P1 | 2,565 | §17 |

### Build Tier (10 TypeScript)

| # | Package | Priority | LOC | KB Section |
|---|---------|----------|-----|------------|
| 17 | prompt-system | P0 | 2,368 | §15 |
| 18 | context-injection | P0 | 1,484 | §16 |
| 19 | agent-dialogue-loop | P1 | 3,024 | §5 |
| 20 | vim-mode-fsm | P3 | 1,513 | §32 |
| 21 | keyboard-shortcuts | P3 | 3,159 | §33 |
| 22 | ink-renderer | P3 | 19,848 | §31 |
| 23 | skills-system | P1 | 4,066 | §22 |
| 24 | mcp-integration | P2 | 12,310 | §23 |
| 25 | multi-agent-coordinator | P1 | 369 | §24 |
| 26 | cli-startup-optimization | P2 | ~2,000 | §2 |

### Translate Tier (3 Python + 2 TypeScript)

| # | Package | Priority | Language | KB Section |
|---|---------|----------|----------|------------|
| 27 | consecutive-breach-tracker | P0 | Python | §43 |
| 28 | ivr-call-flow-validator | P1 | TypeScript | §43 |
| 29 | agent-skill-routing | P1 | Python | §43 |
| 30 | cost-per-interaction | P0 | Python | §43 |
| 31 | prompt-cache-optimizer | P0 | TypeScript | §43 |

## Project Structure

```
claude-code-patterns/
├── CLAUDE.md                    # Context injection (~2K tokens)
├── README.md                    # This file
├── ARCHITECTURE.md              # ADR for Option B (Tiered packages/)
├── dependency-graph.md          # Cross-package relationships
├── package.json                 # Bun workspace root
├── tsconfig.base.json           # Shared TS config (strict, ES2022)
├── Makefile                     # scaffold-check, type-check, lint
├── packages/
│   ├── extract/                 # 16 TS packages
│   ├── build/                   # 10 TS packages
│   └── translate/               # 5 packages (3 Python, 2 TS)
└── docs/
    ├── patterns/                # 14 design patterns from KB §37
    └── recipes/                 # 6 implementation recipes from KB §42
```

## Status

Project initialization in progress. GSD workflow active.

## Author

Pete Connor — AI Transformation Leader
