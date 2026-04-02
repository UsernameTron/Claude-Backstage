# Roadmap: claude-code-patterns

## Overview

Build a type-stub monorepo organizing 31 Claude Code subsystems across 3 tiers. Start with root tooling (Bun workspaces, TypeScript strict mode, Makefile), scaffold P0 foundation packages, then complete remaining tiers. All packages are type stubs only — zero implementations.

## Phases

- [x] **Phase 1: Monorepo Scaffold** - Root tooling, configs, and validation infrastructure (completed 2026-04-02)
- [x] **Phase 2: P0 Package Stubs** - 8 foundation packages across all 3 tiers (completed 2026-04-02)
- [x] **Phase 3: Extract Tier Completion** - Remaining 13 extract/ packages (P1-P3) (completed 2026-04-02)
- [x] **Phase 4: Build + Translate Completion** - Remaining 8 build/ + 3 translate/ packages, docs finalization (completed 2026-04-02)
- [ ] **Phase 5: Scaffold Expansion** - Add 12 new packages (#32-43) from gap analysis

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
**Plans:** 3/3 plans complete

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
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Standalone extract packages (Wave 1): state-store, streaming-tool-executor, token-estimation, subprocess-env-scrubbing, config-migration, path-validation, read-only-validation, analytics-killswitch, claudemd-memory
- [x] 03-02-PLAN.md — Dependent extract packages (Wave 2): yolo-classifier, auto-compact, sandbox-config, dangerous-command-detection

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
**Plans:** 4/4 plans complete

Plans:
- [x] 04-01-PLAN.md — Dependent build packages (Wave 2): mcp-integration, agent-dialogue-loop, skills-system, multi-agent-coordinator
- [x] 04-02-PLAN.md — Standalone build packages (Wave 1): vim-mode-fsm, keyboard-shortcuts, ink-renderer, cli-startup-optimization
- [x] 04-03-PLAN.md — Translate packages (Wave 1): ivr-call-flow-validator, agent-skill-routing
- [x] 04-04-PLAN.md — Documentation and linting (Wave 3): Ruff config, DEVOPS-HANDOFF.md, README verification

### Phase 5: Scaffold Expansion
**Goal**: Expand monorepo from 31 to 43 packages by scaffolding 12 new packages from KB v2.1 gap analysis, updating all root configs and governance docs
**Depends on**: Phase 4
**Requirements**: EXP-32, EXP-33, EXP-34, EXP-35, EXP-36, EXP-37, EXP-38, EXP-39, EXP-40, EXP-41, EXP-42, EXP-43, EXP-ROOT, EXP-DOCS, EXP-VALIDATE
**Success Criteria** (what must be TRUE):
  1. `make scaffold-check` reports 43/43 packages present
  2. `make type-check` passes for all 35 TS packages
  3. `pip install -e` succeeds for all 4 Python packages
  4. #34 multi-step-ivr-input-validator imports types from #28 ivr-call-flow-validator
  5. All root docs (CLAUDE.md, README.md, dependency-graph.md, KB inventory) reflect 43 packages
**Plans:** 4 plans

Plans:
- [ ] 05-01-PLAN.md — Translate tier: #32 workforce-scheduling-coordinator, #33 genesys-flow-security-validator, #34 multi-step-ivr-input-validator
- [x] 05-02-PLAN.md — Build tier P2: #35 tool-schema-cache, #36 tool-registry, #37 dialogue-history-manager, #38 system-reminder-injection, #39 plugin-lifecycle-manager
- [ ] 05-03-PLAN.md — Build tier P3: #40 sdk-bridge, #41 voice-input-gating, #42 output-style-system, #43 onboarding-flow-engine
- [ ] 05-04-PLAN.md — Root config updates, governance docs, full validation

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Scaffold | 2/2 | Complete   | 2026-04-02 |
| 2. P0 Package Stubs | 3/3 | Complete | 2026-04-02 |
| 3. Extract Tier Completion | 2/2 | Complete | 2026-04-02 |
| 4. Build + Translate Completion | 4/4 | Complete   | 2026-04-02 |
| 5. Scaffold Expansion | 0/4 | Planning | - |
