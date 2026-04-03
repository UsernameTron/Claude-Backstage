# claude-code-patterns

Implementation monorepo for 43 Claude Code subsystems — working code (extract/translate) and design references (build) — with 567 tests.

## Tiers

- **extract/** (16 TS) — Copy, adapt, ship. Direct extraction targets from source.
- **build/** (19 TS) — Design reference. Architectural patterns for new builds.
- **translate/** (8 mixed) — New builds from pattern adaptation. 4 Python + 4 TypeScript.

## P0 Packages (core foundation)

1. `permission-system` — Foundation. Permission rules, modes, and evaluation (9.4K LOC)
2. `denial-tracking` — Denial counter with adaptive fallback (45 LOC)
3. `cost-tracker` — Session cost tracking and formatting (323 LOC)
4. `prompt-system` — System prompt assembly and section management (2.4K LOC)
5. `context-injection` — Dual-position context injection pattern (1.5K LOC)
6. `consecutive-breach-tracker` — Python. Queue breach detection with escalation (Pattern 7)
7. `cost-per-interaction` — Python. Channel cost aggregation (Pattern from #8)
8. `prompt-cache-optimizer` — Cache ordering with 3-tier scoping (Pattern 4)

## Dependencies

```
permission-system <- yolo-classifier, dangerous-command-detection
token-estimation  <- auto-compact
path-validation   <- sandbox-config, dangerous-command-detection
claudemd-memory   <- skills-system
mcp-integration   <- multi-agent-coordinator
streaming-tool-executor + state-store + token-estimation <- agent-dialogue-loop
ivr-call-flow-validator <- multi-step-ivr-input-validator
```

## Conventions

- Package scope: `@claude-patterns/{name}` — tier directory invisible to imports
- TypeScript: strict mode, ES2022, Bun workspaces
- Python: pip install -e, pyproject.toml
- All packages: working implementations (extract/translate tiers) and architectural references (build tier) with tests (567 tests across 43 packages)
- Entry points: `src/index.ts` (TS) or `src/{name}/__init__.py` (Python)
- Test isolation: packages with module-level mutable state export `resetState()` for test cleanup
- Type safety: runtime type guards over `as` assertions — use `satisfies` or guard functions instead of unsafe casts

## Commands

```bash
make scaffold-check  # Validate all 43 dirs have required files
make type-check      # tsc --noEmit across all TS packages
make lint            # Biome (TS) + Ruff (Python)
make test            # Run all tests (513 TS + 54 Python)
make list-packages   # Enumerate all 43 with tier and priority
```

## Tech Stack

- Bun workspaces (not npm/yarn)
- TypeScript strict mode, ES2022 target
- Python 3.11+ for translate tier
