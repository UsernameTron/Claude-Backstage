# claude-code-patterns

## What This Is

A type-stub monorepo organizing 43 Claude Code subsystems across 3 tiers (extract/16 TS, build/19 TS, translate/4 Python + 4 TS). Each package provides type signatures, source file references, and dependency mappings — a pattern library for building skills, agents, and operational tools from Claude Code's architecture.

## Core Value

Every package maps directly to a real Claude Code subsystem with exact source paths and type signatures, so builders can extract, adapt, or design-from-scratch without reverse-engineering the codebase.

## Requirements

### Validated

- Monorepo root with Bun workspaces for 39 TypeScript packages — v2.1
- Tiered package structure: extract/ (16 TS), build/ (19 TS), translate/ (4 Python + 4 TS) — v2.1
- Each package has README.md, entry point stub, manifest, tsconfig (TS only) — v2.1
- Type stubs compile with strict mode (`tsc --noEmit` passes all 39 TS packages) — v2.1
- Python packages install via `pip install -e` (4 packages, verified structurally) — v2.1
- CLAUDE.md under 2K tokens provides useful context injection — v2.1
- dependency-graph.md maps all 9 cross-package dependency chains — v2.1
- ARCHITECTURE.md documents ADR for Option B (Tiered packages/) — v2.1
- Makefile with scaffold-check (43/43), type-check, lint targets — v2.1
- 12 expansion packages (#32-43) from KB v2.1 gap analysis — v2.1

### Active

- [ ] Implement all 43 packages from type stubs to working code (6 waves)
- [ ] Each package: replace TODO throws with real implementations
- [ ] Tests for each implemented package
- [ ] Cross-package runtime imports resolve (not just type-level)
- [ ] make type-check, make lint pass after each wave

## Current Milestone: v2.2 Implementations

**Goal:** Replace all TODO-throwing type stubs with working implementations across 43 packages in 6 waves, following the IMPLEMENTATION-PLAYBOOK.md build order.

**Target features:**
- Wave 1: 4 quick-win packages (45-323 LOC)
- Wave 2: 4 core architecture packages (up to 9.4K LOC)
- Wave 3: 11 P1 portfolio packages with dependency chains
- Wave 4: 8 P2 engineering packages
- Wave 5: 4 P3 packages
- Wave 6: 12 expansion packages

### Out of Scope

- Implementations beyond type stubs — this is a reference library, not a runtime
- Runtime tests — stubs have no behavior to test
- CI/CD pipelines — single-developer build reference
- npm publishing — packages are consumed by copy, not install
- Claude Code source vendoring — source paths are references, not copies

## Context

- 43 packages across 3 tiers: 16 extract (copy-adapt-ship), 19 build (design reference), 8 translate (cross-domain patterns)
- 3,748 lines of type stubs across 263 files
- 9 cross-package dependency chains verified (workspace:* references)
- Knowledge Base v2.1 (83.6 KB) provided all 43 system mappings
- Codebase map: 7 documents in `.planning/codebase/`

## Constraints

- **Tech stack**: Bun workspaces for TypeScript, pip for Python — no npm, no yarn
- **Language split**: 39 TypeScript packages + 4 Python packages, managed independently
- **No implementations**: All packages contain type stubs and TODO comments only
- **Compilation**: `tsc --noEmit` with strict mode must pass for all TS packages
- **Context budget**: CLAUDE.md must stay under 2K tokens for efficient injection
- **Source access**: claude-code/src/ not directly accessible; stubs based on KB v2.1 and plan specifications

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Option B: Tiered packages/ | 1:1 KB v2.1 mapping, ~80 token context injection, matches operator mental model | Good — clean discoverability |
| Bun over npm/yarn | Faster installs, native workspace support, TypeScript-first | Good — zero issues |
| Type stubs only | Reduces scope to ~120 files, validates structure before investing in implementations | Good — shipped 263 files in 2 days |
| @claude-patterns/ scope | Workspace references ignore tier directory, clean import paths | Good — all 9 dep chains resolve |
| Mixed TS/Python | 4 translate packages are Python (contact center domain), rest TypeScript | Good — clean separation |
| tsconfig 3-level extends | packages/tier/name/ requires ../../../tsconfig.base.json | Good — all 3 agents auto-corrected |
| setuptools.build_meta | Python 3.14 breaks legacy backend | Good — all 4 Python packages install |
| Worktree isolation for independent plans only | Dependent plans need prior-wave commits visible | Learned — Wave 2+ runs without isolation |

---
## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-03 — Phase 10 (Wave 5 P3 Nice to Have) complete — 4 P3 packages implemented with 53 tests*
