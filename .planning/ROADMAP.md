# Roadmap: claude-code-patterns

## Overview

Build a type-stub monorepo organizing 31 Claude Code subsystems across 3 tiers. Start with root tooling (Bun workspaces, TypeScript strict mode, Makefile), scaffold P0 foundation packages, then complete remaining tiers. All packages are type stubs only — zero implementations.

## Phases

- [x] **Phase 1: Monorepo Scaffold** - Root tooling, configs, and validation infrastructure (completed 2026-04-02)
- [ ] **Phase 2: P0 Package Stubs** - 8 foundation packages across all 3 tiers
- [ ] **Phase 3: Extract Tier Completion** - Remaining 14 extract/ packages (P1-P3)
- [ ] **Phase 4: Build + Translate Completion** - Remaining 8 build/ + 3 translate/ packages, docs finalization

## Phase Details

### Phase 1: Monorepo Scaffold
**Goal**: Working monorepo root where `bun install` resolves workspaces, `tsc --noEmit` runs, and `make scaffold-check` validates structure
**Depends on**: Nothing (first phase)
**Requirements**: FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-5.1, FR-5.2
**Success Criteria** (what must be TRUE):
  1. `bun install` completes without errors and resolves `@claude-patterns/` workspace refs
  2. `tsc --noEmit` runs successfully against tsconfig.base.json (no packages yet, but config valid)
  3. `make scaffold-check` target exists and runs (will report 0/31 packages until Phase 2)
  4. ARCHITECTURE.md, CLAUDE.md, README.md, and dependency-graph.md exist at root
**Plans:** 2/2 plans complete

Plans:
- [x] 01-01-PLAN.md — Root configs: package.json, tsconfig.base.json, biome.json, Makefile
- [x] 01-02-PLAN.md — Root documentation: ARCHITECTURE.md, CLAUDE.md, README.md, dependency-graph.md

### Phase 2: P0 Package Stubs
**Goal**: All 8 P0 packages scaffolded with README, entry point stubs, manifests, and passing `tsc --noEmit`
**Depends on**: Phase 1
**Requirements**: FR-2.1, FR-2.2, FR-2.8, FR-3.1, FR-3.2, FR-4.1, FR-4.4, FR-4.5, NFR-1, NFR-2, NFR-3
**Success Criteria** (what must be TRUE):
  1. `tsc --noEmit` passes for all 5 TS P0 packages (permission-system, denial-tracking, cost-tracker, prompt-system, context-injection)
  2. `pip install -e` succeeds for both Python P0 packages (consecutive-breach-tracker, cost-per-interaction)
  3. prompt-cache-optimizer (TS translate) compiles with `tsc --noEmit`
  4. `make scaffold-check` reports 8/31 packages present
  5. Each package has README.md with source refs, entry point stub, and manifest
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Extract tier P0: permission-system, denial-tracking, cost-tracker
- [x] 02-02-PLAN.md — Build tier P0: prompt-system, context-injection
- [x] 02-03-PLAN.md — Translate tier P0: consecutive-breach-tracker, cost-per-interaction, prompt-cache-optimizer

### Phase 3: Extract Tier Completion
**Goal**: All 16 extract/ packages scaffolded with correct dependency wiring
**Depends on**: Phase 2
**Requirements**: FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-2.7, FR-2.9, FR-2.10, FR-2.11, FR-2.12, FR-2.13, FR-2.14, FR-2.15, FR-2.16, NFR-1, NFR-3, NFR-4
**Success Criteria** (what must be TRUE):
  1. `tsc --noEmit` passes for all 16 extract/ packages
  2. Cross-package deps resolve: yolo-classifier imports from permission-system, auto-compact from token-estimation
  3. `make scaffold-check` reports 16/16 extract packages present
  4. dangerous-command-detection correctly depends on both permission-system and path-validation
**Plans**: TBD

Plans:
- [ ] 03-01: Standalone extract packages — state-store, streaming-tool-executor, token-estimation, subprocess-env-scrubbing, config-migration, path-validation, read-only-validation, analytics-killswitch, claudemd-memory
- [ ] 03-02: Dependent extract packages — yolo-classifier, auto-compact, sandbox-config, dangerous-command-detection

### Phase 4: Build + Translate Completion
**Goal**: All 31 packages present, full monorepo compiles, documentation finalized
**Depends on**: Phase 3
**Requirements**: FR-3.3, FR-3.4, FR-3.5, FR-3.6, FR-3.7, FR-3.8, FR-3.9, FR-3.10, FR-4.2, FR-4.3, FR-1.5, FR-1.6, FR-1.7, FR-5.3, FR-5.4, NFR-1, NFR-4, NFR-5
**Success Criteria** (what must be TRUE):
  1. `tsc --noEmit` passes for all 28 TypeScript packages
  2. `pip install -e` succeeds for all 3 Python packages
  3. `make scaffold-check` reports 31/31 packages present
  4. skills-system imports from claudemd-memory, multi-agent-coordinator from mcp-integration
  5. docs/DEVOPS-HANDOFF.md and per-package READMEs are complete
**Plans**: TBD

Plans:
- [ ] 04-01: Build tier — agent-dialogue-loop, skills-system, multi-agent-coordinator, mcp-integration
- [ ] 04-02: Build tier — vim-mode-fsm, keyboard-shortcuts, ink-renderer, cli-startup-optimization
- [ ] 04-03: Translate tier — ivr-call-flow-validator, agent-skill-routing
- [ ] 04-04: Documentation and linting — per-package READMEs, Biome config, Ruff config, DEVOPS-HANDOFF.md

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Scaffold | 2/2 | Complete   | 2026-04-02 |
| 2. P0 Package Stubs | 1/3 | In Progress | - |
| 3. Extract Tier Completion | 0/2 | Not started | - |
| 4. Build + Translate Completion | 0/4 | Not started | - |
