# claude-code-patterns

Type-stub monorepo for 31 Claude Code subsystems. Build reference only — no implementations.

## Tiers

- **extract/** (16 TS) — Copy, adapt, ship. Direct extraction targets from source.
- **build/** (10 TS) — Design reference. Architectural patterns for new builds.
- **translate/** (5 mixed) — New builds from pattern adaptation. 3 Python + 2 TypeScript.

## P0 Packages (build these first)

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
```

## Conventions

- Package scope: `@claude-patterns/{name}` — tier directory invisible to imports
- TypeScript: strict mode, ES2022, Bun workspaces
- Python: pip install -e, pyproject.toml
- All packages: type stubs + TODO comments only. Zero implementations.
- Entry points: `src/index.ts` (TS) or `src/{name}/__init__.py` (Python)

## Commands

```bash
make scaffold-check  # Validate all 31 dirs have required files
make type-check      # tsc --noEmit across all TS packages
make lint            # Biome (TS) + Ruff (Python)
make list-packages   # Enumerate all 31 with tier and priority
```

## Tech Stack

- Bun workspaces (not npm/yarn)
- TypeScript strict mode, ES2022 target
- Python 3.11+ for translate tier
