# DevOps Handoff -- claude-code-patterns

## 1. Project Summary

Type-stub monorepo organizing 43 Claude Code subsystems as independently extractable packages across three tiers. This is a **build reference only** -- no runtime behavior, no deployable artifacts, no executable code.

Each package maps directly to a real Claude Code subsystem with:
- Exact source file paths and LOC counts
- Type signatures matching the source architecture
- Cross-package dependency mappings via `@claude-patterns/{name}` workspace references
- Knowledge Base v2.1 section references for design context

**Package distribution:** 16 extract (TS), 19 build (TS), 8 translate (4 Python + 4 TS) = 43 total.

## 2. Environment Requirements

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Bun** | >= 1.0 | TypeScript package management, workspace resolution |
| **Node.js** | >= 18 | TypeScript compiler (`tsc --noEmit`) |
| **Python** | >= 3.11 | Translate tier Python packages (3 packages) |
| **Make** | any | Build targets (scaffold-check, type-check, lint) |

**Not required:**
- No database or external services
- No Docker or container runtime
- No cloud credentials or API keys
- No CI/CD pipeline

## 3. How to Run

### Initial Setup

```bash
# Install TypeScript dependencies (all 39 TS packages)
bun install

# Validate all 43 packages are scaffolded
make scaffold-check
# Expected output: 43/43 packages present

# Type-check all 39 TypeScript packages
make type-check
# Expected output: 39 packages checked, 0 failed
```

### Python Packages (Translate Tier)

```bash
# Install each Python package in editable mode
pip install -e packages/translate/consecutive-breach-tracker/
pip install -e packages/translate/cost-per-interaction/
pip install -e packages/translate/agent-skill-routing/
pip install -e packages/translate/workforce-scheduling-coordinator/
```

### Linting

```bash
# Run both linters
make lint

# Or individually:
# TypeScript (Biome v2)
npx @biomejs/biome check packages/extract packages/build \
  packages/translate/ivr-call-flow-validator \
  packages/translate/prompt-cache-optimizer \
  packages/translate/genesys-flow-security-validator \
  packages/translate/multi-step-ivr-input-validator

# Python (Ruff)
ruff check packages/translate/consecutive-breach-tracker \
  packages/translate/cost-per-interaction \
  packages/translate/agent-skill-routing \
  packages/translate/workforce-scheduling-coordinator
```

### All Make Targets

```bash
make scaffold-check  # Validate all 43 dirs have required files
make type-check      # tsc --noEmit across all TS packages
make lint            # Biome (TS) + Ruff (Python)
make list-packages   # Enumerate all 43 with tier and priority
```

## 4. Configuration Reference

| File | Purpose |
|------|---------|
| `package.json` | Bun workspace root, defines workspace globs for all TS packages |
| `tsconfig.base.json` | Shared TypeScript config: strict mode, ES2022 target, Bun types |
| `biome.json` | Biome v2 linter/formatter config for TypeScript packages |
| `ruff.toml` | Ruff linter config for Python packages (py311, E/F/I/UP/B rules) |
| `Makefile` | Build targets: scaffold-check, type-check, lint, list-packages |
| Per-package `tsconfig.json` | Extends `tsconfig.base.json` with relative path |
| Per-package `pyproject.toml` | Python package metadata (translate tier only) |
| Per-package `package.json` | `@claude-patterns/{name}` scoped package manifest |

### TypeScript Configuration

- **Strict mode**: All strict checks enabled
- **Target**: ES2022
- **Module**: ESNext with Bun module resolution
- **Types**: `["bun-types"]`
- **No emit**: Implementations run via Bun; no compilation output required

### Python Configuration (ruff.toml)

- **Target**: Python 3.11
- **Line length**: 120
- **Selected rules**: E (pycodestyle), F (pyflakes), I (isort), UP (pyupgrade), B (flake8-bugbear)

## 5. Security Notes

- **No secrets, API keys, or credentials** anywhere in the repository
- **No runtime code that connects to external services** -- all packages are self-contained with no outbound network calls
- **No external service connections** -- no HTTP calls, no database connections, no file I/O
- **Source file paths** reference Claude Code internals (e.g., `utils/permissions/`) but contain no proprietary source code
- **No vendored dependencies** beyond standard dev tooling (TypeScript, Biome, Ruff)

## 6. Deployment Maturity

**Not deployed -- local reference only.**

| Aspect | Status |
|--------|--------|
| CI/CD pipeline | None -- single-developer build reference |
| Registry publishing | None -- packages consumed by copy, not install |
| Docker / containers | None -- no containerization needed |
| Monitoring / logging | None -- no runtime to monitor |
| Environment promotion | N/A -- no staging/production environments |

## 7. Known Technical Debt

| Item | Impact | Notes |
|------|--------|-------|
| ink-renderer simplified | 19,848 LOC reduced to working subset | High-level types and core render logic; full pipeline not modeled |
| No CI/CD | No automated checks on push | Acceptable for single-developer reference project |

## 8. Package Inventory

### Extract Tier (16 TypeScript)

| # | Package | Priority | LOC | Dependencies |
|---|---------|----------|-----|--------------|
| 1 | permission-system | P0 | 9,409 | none |
| 2 | denial-tracking | P0 | 45 | none |
| 3 | cost-tracker | P0 | 323 | none |
| 4 | state-store | P2 | 603 | none |
| 5 | streaming-tool-executor | P1 | 530 | none |
| 6 | token-estimation | P1 | 829 | none |
| 7 | subprocess-env-scrubbing | P2 | 99 | none |
| 8 | config-migration | P2 | 603 | none |
| 9 | path-validation | P2 | 485 | none |
| 10 | read-only-validation | P2 | ~500 | none |
| 11 | analytics-killswitch | P3 | 4,040 | none |
| 12 | claudemd-memory | P1 | 2,565 | none |
| 13 | yolo-classifier | P1 | 1,495 | permission-system |
| 14 | auto-compact | P1 | 3,960 | token-estimation |
| 15 | sandbox-config | P2 | 1,153 | path-validation |
| 16 | dangerous-command-detection | P2 | 12,411 | permission-system, path-validation |

### Build Tier (19 TypeScript)

| # | Package | Priority | LOC | Dependencies |
|---|---------|----------|-----|--------------|
| 17 | prompt-system | P0 | 2,368 | none |
| 18 | context-injection | P0 | 1,484 | none |
| 19 | agent-dialogue-loop | P1 | 3,024 | streaming-tool-executor, state-store, token-estimation |
| 20 | skills-system | P1 | 4,066 | claudemd-memory |
| 21 | multi-agent-coordinator | P1 | 369 | mcp-integration |
| 22 | mcp-integration | P2 | 12,310 | none |
| 23 | vim-mode-fsm | P3 | 1,513 | none |
| 24 | keyboard-shortcuts | P3 | 3,159 | none |
| 25 | ink-renderer | P3 | 19,848 | none |
| 26 | cli-startup-optimization | P2 | ~2,000 | none |

### Build Tier Expansion (9 TypeScript, #35-43)

| # | Package | Priority | LOC | Dependencies |
|---|---------|----------|-----|--------------|
| 35 | tool-schema-cache | P2 | ~500 | none |
| 36 | tool-registry | P2 | ~1,000 | none |
| 37 | dialogue-history-manager | P2 | ~800 | none |
| 38 | system-reminder-injection | P2 | ~600 | none |
| 39 | plugin-lifecycle-manager | P2 | ~1,200 | none |
| 40 | sdk-bridge | P3 | ~800 | none |
| 41 | voice-input-gating | P3 | ~400 | none |
| 42 | output-style-system | P3 | ~600 | none |
| 43 | onboarding-flow-engine | P3 | ~500 | none |

### Translate Tier (4 Python + 4 TypeScript)

| # | Package | Priority | Language | Dependencies |
|---|---------|----------|----------|--------------|
| 27 | consecutive-breach-tracker | P0 | Python | none |
| 28 | cost-per-interaction | P0 | Python | none |
| 29 | prompt-cache-optimizer | P0 | TypeScript | none |
| 30 | ivr-call-flow-validator | P1 | TypeScript | none |
| 31 | agent-skill-routing | P1 | Python | none |
| 32 | workforce-scheduling-coordinator | P1 | Python | none |
| 33 | genesys-flow-security-validator | P1 | TypeScript | none |
| 34 | multi-step-ivr-input-validator | P2 | TypeScript | ivr-call-flow-validator |
