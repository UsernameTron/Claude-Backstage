# Research Summary: claude-code-patterns

**Domain:** Type-stub monorepo / build reference library
**Researched:** 2026-04-01
**Overall confidence:** HIGH

## Executive Summary

The claude-code-patterns monorepo is well-served by its chosen stack of Bun workspaces + TypeScript strict mode + Python pyproject.toml. Bun's native workspace support handles 28+ packages without performance issues, and the `workspace:*` protocol provides clean inter-package references. The `@claude-patterns/` scoped naming convention works but has a known Bun filter bug that requires a specific workaround in the Makefile.

TypeScript project references are overkill for this project. Because all packages are type stubs with no runtime code and no build step, the incremental compilation benefits of project references are irrelevant. A simple `tsconfig.base.json` with `extends` in each package is the right call -- less maintenance, same type-checking outcome.

The mixed TS/Python challenge is minimal here because the 3 Python packages are fully independent from the 28 TypeScript packages (no cross-language imports). Keeping them in a `translate/` tier with independent `pyproject.toml` files and validating via Makefile targets is the standard polyglot monorepo pattern.

Biome v2 is the correct linter choice over ESLint for this project. It is 15x faster, requires a single config file, and has native monorepo support with nested configurations. Ruff handles the Python side with hierarchical pyproject.toml configuration.

## Key Findings

**Stack:** Bun workspaces + tsconfig extends + Biome v2 + Ruff. No build step needed.
**Architecture:** Flat workspace globs with tier subdirectories (`extract/*`, `build/*`, `translate/*`).
**Critical pitfall:** Bun `--filter '*'` does not match scoped `@claude-patterns/` packages. Must use `--filter '@*/*'` or path-based filtering.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Monorepo Scaffold** - Set up root package.json, tsconfig.base.json, biome.json, Makefile
   - Addresses: workspace configuration, tool chain setup
   - Avoids: scoped package filter bug (configure path-based filtering from day one)

2. **P0 Package Stubs** - Scaffold the 8 priority packages with correct structure
   - Addresses: permission-system, denial-tracking, cost-tracker, prompt-system, context-injection, consecutive-breach-tracker, cost-per-interaction, prompt-cache-optimizer
   - Avoids: cross-package dependency issues by starting with foundation packages

3. **Remaining Extract Tier** - Complete the 16 extract/ packages
   - Addresses: bulk of the type stubs
   - Avoids: dependency ordering issues (P0 packages are already in place)

4. **Build + Translate Tiers** - Complete build/ (10) and translate/ (5) packages
   - Addresses: design reference and Python packages
   - Avoids: mixed-language complexity by handling Python last

**Phase ordering rationale:**
- Root tooling must exist before any packages (Makefile, tsconfig, biome)
- P0 packages are dependency foundations -- other packages reference them
- Extract tier is the largest and most directly usable
- Python packages are independent and can be done last without blocking anything

**Research flags for phases:**
- Phase 1: Standard patterns, unlikely to need further research
- Phase 2: May need phase-specific research on exact type stub patterns for complex subsystems (permission-system at 9.4K LOC)
- Phase 4: Python packaging is straightforward, no research needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Bun workspaces are well-documented, verified via official docs |
| Features | HIGH | Type stubs only -- scope is narrow and well-defined |
| Architecture | HIGH | Standard monorepo patterns, nothing novel |
| Pitfalls | HIGH | Scoped package filter bug verified via GitHub issues |

## Gaps to Address

- Exact Bun version to pin (latest stable should work, but verify workspace protocol support)
- Whether `bun-workspaces` CLI tool adds value over raw Bun for 28+ packages
- Python virtual environment strategy (single venv vs per-package) -- likely single venv with `pip install -e` for all 3
