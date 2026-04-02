# Technology Stack

**Project:** claude-code-patterns
**Researched:** 2026-04-01

## Recommended Stack

### Core Runtime
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Bun | latest stable | Package manager, workspace orchestration | Native workspace support, 28x faster than npm, TypeScript-first runtime |
| TypeScript | 5.5+ | Type checking (strict mode) | ES2022 target, strict mode catches stub errors at compile time |
| Python | 3.11+ | Translate tier packages | Required for contact center domain packages |

### Linting & Formatting
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Biome | v2.x | TS/JS linting + formatting | Single config, 15x faster than ESLint, native monorepo support with nested configs |
| Ruff | latest | Python linting + formatting | Hierarchical pyproject.toml config, monorepo-aware, 10-100x faster than flake8/black |

### Build & Validation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Make | system | Polyglot task runner | Universal, no dependencies, handles TS and Python targets cleanly |
| tsc | (bundled with TS) | Type checking only (`--noEmit`) | No build artifacts needed -- stubs are the product |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/node` | latest | Node.js type definitions | If any stubs reference Node APIs (fs, path, etc.) |
| `@types/bun` | latest | Bun-specific type definitions | If stubs use Bun-specific APIs |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Package manager | Bun | npm/yarn/pnpm | Slower installs, less native TS support, project already committed to Bun |
| Task runner | Make | Nx/Turborepo | Overkill for type-stub-only project with no build step. Make is simpler, zero deps |
| TS linter | Biome v2 | ESLint + Prettier | 2 tools vs 1, 15x slower, more config files. Biome v2 has monorepo support |
| Python linter | Ruff | flake8 + black + isort | 3 tools vs 1, orders of magnitude slower, more config |
| TS config | tsconfig extends | Project references | No build step means no incremental build benefit. Extends is simpler to maintain |
| Python packaging | pip + pyproject.toml | uv/poetry | 3 packages only, pip is sufficient. No dependency resolution complexity |

## Installation

```bash
# Core
bun install

# Dev dependencies (root)
bun add -d typescript @types/node @types/bun

# Biome (root)
bun add -d @biomejs/biome

# Python (translate tier only)
python3 -m venv .venv
source .venv/bin/activate
pip install ruff
pip install -e translate/consecutive-breach-tracker
pip install -e translate/cost-per-interaction
pip install -e translate/queue-health-monitor
```

## Key Configuration Files

```
package.json              # Root: workspaces glob, devDeps
tsconfig.base.json        # Shared strict TS config
biome.json                # Root Biome config
Makefile                  # Polyglot validation targets
.python-version           # Pin Python 3.11+
translate/*/pyproject.toml # Per-package Python config
```

## Sources

- [Bun Workspaces docs](https://bun.com/docs/pm/workspaces) -- official workspace configuration
- [Biome v2 announcement](https://biomejs.dev/blog/biome-v2/) -- monorepo support, type inference
- [Ruff configuration docs](https://docs.astral.sh/ruff/configuration/) -- hierarchical config
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) -- evaluated and rejected
- [Nx blog: Managing TS Packages](https://nx.dev/blog/managing-ts-packages-in-monorepos) -- project references analysis
