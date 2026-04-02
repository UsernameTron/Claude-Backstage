# claude-code-patterns

## What This Is

A monorepo organizing 43 buildable systems extracted from Claude Code's source tree (~1,900 files, 512K+ LOC TypeScript) and Knowledge Base v2.1. Each package provides type stubs, source file references, and dependency mappings — a pattern library for building skills, agents, and operational tools. This is NOT a fork of Claude Code. It is a build reference with type stubs only.

## Core Value

Every package maps directly to a real Claude Code subsystem with exact source paths and type signatures, so builders can extract, adapt, or design-from-scratch without reverse-engineering the codebase.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Monorepo root with Bun workspaces for 35 TypeScript packages
- [ ] Tiered package structure: extract/ (16 TS), build/ (19 TS), translate/ (4 Python + 4 TS)
- [ ] Each package has README.md, entry point stub, manifest, tsconfig (TS only)
- [ ] Type stubs compile with strict mode (`tsc --noEmit` passes)
- [ ] Python packages install via `pip install -e`
- [ ] CLAUDE.md under 2K tokens provides useful context injection
- [ ] dependency-graph.md maps all cross-package relationships
- [ ] ARCHITECTURE.md documents ADR for Option B (Tiered packages/)
- [ ] Makefile with scaffold-check, type-check, lint targets
- [ ] P0 packages (7 items) compile and resolve correctly

### Out of Scope

- Implementations beyond type stubs — this is a reference library, not a runtime
- Runtime tests — stubs have no behavior to test
- CI/CD pipelines — single-developer build reference
- npm publishing — packages are consumed by copy, not install
- Claude Code source vendoring — source paths are references, not copies

## Context

- Source tree at `~/projects/Inside Claude Code/claude-code/src/` provides exact file paths and type signatures
- Knowledge Base v2.1 (83.6 KB) identifies 31 systems across 3 tiers with 14 design patterns and 6 recipes
- Build Inventory maps each system to priority (P0-P3), LOC estimate, dependencies, and KB sections
- The operator thinks in Extract/Build/Translate terms — the tier tells HOW to use each package
- Cross-package deps resolve via `@claude-patterns/` workspace names — tier directory is invisible to imports

## Constraints

- **Tech stack**: Bun workspaces for TypeScript, pip for Python — no npm, no yarn
- **Language split**: 28 TypeScript packages + 3 Python packages, managed independently
- **No implementations**: All packages contain type stubs and TODO comments only
- **Compilation**: `tsc --noEmit` with strict mode must pass for all TS packages
- **Context budget**: CLAUDE.md must stay under 2K tokens for efficient injection
- **Source access**: claude-code/src/ may not be directly accessible; stubs based on KB v2.1 and plan specifications

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Option B: Tiered packages/ | 1:1 KB v2.1 mapping, ~80 token context injection, matches operator mental model | — Pending |
| Bun over npm/yarn | Faster installs, native workspace support, TypeScript-first | — Pending |
| Type stubs only | Reduces scope to ~120 files, validates structure before investing in implementations | — Pending |
| @claude-patterns/ scope | Workspace references ignore tier directory, clean import paths | — Pending |
| Mixed TS/Python | 3 translate packages are Python (contact center domain), rest TypeScript | — Pending |

---
*Last updated: 2026-04-01 after project initialization*
