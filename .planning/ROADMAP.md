# Roadmap: claude-code-patterns

## Milestones

- **v2.1 Type-Stub Monorepo** — Phases 1-5 (shipped 2026-04-02) | [Archive](milestones/v2.1-ROADMAP.md)
- **v2.2 Implementations** — Phases 6-11 (in progress)

## Phases

<details>
<summary>v2.1 Type-Stub Monorepo (Phases 1-5) — SHIPPED 2026-04-02</summary>

- [x] Phase 1: Monorepo Scaffold (2/2 plans) — completed 2026-04-02
- [x] Phase 2: P0 Package Stubs (3/3 plans) — completed 2026-04-02
- [x] Phase 3: Extract Tier Completion (2/2 plans) — completed 2026-04-02
- [x] Phase 4: Build + Translate Completion (4/4 plans) — completed 2026-04-02
- [x] Phase 5: Scaffold Expansion (4/4 plans) — completed 2026-04-02

</details>

### v2.2 Implementations (In Progress)

- [x] **Phase 6: Wave 1 — Quick Wins** - Implement 4 standalone packages (denial-tracking, cost-tracker, consecutive-breach-tracker, cost-per-interaction) — completed 2026-04-03
- [ ] **Phase 7: Wave 2 — Core Architecture** - Implement 4 core packages (prompt-cache-optimizer, prompt-system, context-injection, permission-system)
- [ ] **Phase 8: Wave 3 — P1 Portfolio** - Implement 11 P1 packages with dependency chains
- [ ] **Phase 9: Wave 4 — P2 Engineering Depth** - Implement 8 P2 packages (security, config, CLI)
- [ ] **Phase 10: Wave 5 — P3 Nice to Have** - Implement 4 P3 packages (analytics, vim, keys, renderer)
- [ ] **Phase 11: Wave 6 — Expansion Implementations** - Implement 12 expansion packages (#32-43)

## Phase Details

### Phase 6: Wave 1 — Quick Wins
**Goal**: Implement 4 standalone, small-LOC packages to prove the implementation workflow before scaling
**Depends on**: Phase 5 (stubs exist)
**Requirements**: W1-01, W1-02, W1-03, W1-04, NFR-01, NFR-02, NFR-03, NFR-06
**Success Criteria** (what must be TRUE):
  1. denial-tracking has working implementation (no TODO throws), compiles with tsc --noEmit
  2. cost-tracker has working implementation with getStoredSessionCosts() and formatTotalCost()
  3. consecutive-breach-tracker Python implementation passes ruff lint and pip install -e
  4. cost-per-interaction Python implementation with working ChannelCostAggregator
  5. make type-check and make lint pass for entire monorepo
**Plans:** 2 plans
Plans:
- [x] 06-01-PLAN.md — Implement TS packages (denial-tracking + cost-tracker)
- [x] 06-02-PLAN.md — Implement Python packages (consecutive-breach-tracker + cost-per-interaction)

### Phase 7: Wave 2 — Core Architecture
**Goal**: Implement 4 core architectural packages including the 9.4K LOC permission-system
**Depends on**: Phase 6 (workflow proven)
**Requirements**: W2-01, W2-02, W2-03, W2-04, NFR-01, NFR-03, NFR-06
**Success Criteria** (what must be TRUE):
  1. prompt-cache-optimizer implements optimizeCacheOrder() with working 3-tier cache scoping
  2. prompt-system implements getSystemPrompt() with section assembly and dynamic boundary
  3. context-injection implements dual-position injection (system + user context)
  4. permission-system implements full permission rule evaluation (deny > ask > allow)
  5. All 4 packages compile, lint clean, no TODO throws
**Plans:** 1/3 plans executed
Plans:
- [x] 07-01-PLAN.md — Implement prompt-cache-optimizer (TDD, translate tier)
- [x] 07-02-PLAN.md — Implement prompt-system + context-injection (TDD, build tier)
- [x] 07-03-PLAN.md — Implement permission-system (TDD, extract tier)

### Phase 8: Wave 3 — P1 Portfolio
**Goal**: Implement 11 P1 packages including dependency chains (yolo <- permission-system, auto-compact <- token-estimation, etc.)
**Depends on**: Phase 7 (permission-system, token-estimation deps)
**Requirements**: W3-01 through W3-11, NFR-01, NFR-02, NFR-03, NFR-04, NFR-06
**Success Criteria** (what must be TRUE):
  1. All 11 packages have working implementations (no TODO throws)
  2. Cross-package imports resolve at runtime (yolo-classifier imports from permission-system)
  3. agent-dialogue-loop integrates streaming-tool-executor + state-store + token-estimation
  4. make type-check and make lint pass for entire monorepo

### Phase 9: Wave 4 — P2 Engineering Depth
**Goal**: Implement 8 P2 packages (security, config, path validation, MCP, CLI startup)
**Depends on**: Phase 7 (permission-system for dangerous-command-detection), Phase 8 partial
**Requirements**: W4-01 through W4-08, NFR-01, NFR-03, NFR-04, NFR-06
**Success Criteria** (what must be TRUE):
  1. All 8 packages have working implementations
  2. dangerous-command-detection correctly imports from permission-system and path-validation
  3. sandbox-config correctly imports from path-validation
  4. make type-check and make lint pass

### Phase 10: Wave 5 — P3 Nice to Have
**Goal**: Implement 4 P3 packages (analytics, vim FSM, keyboard shortcuts, ink renderer)
**Depends on**: Phase 6-9 complete
**Requirements**: W5-01 through W5-04, NFR-01, NFR-03, NFR-06
**Success Criteria** (what must be TRUE):
  1. All 4 packages have working implementations
  2. vim-mode-fsm has working state machine with transition()
  3. ink-renderer has working render pipeline types
  4. make type-check and make lint pass

### Phase 11: Wave 6 — Expansion Implementations
**Goal**: Implement 12 expansion packages (#32-43)
**Depends on**: Phase 6-10 complete
**Requirements**: W6-01 through W6-12, NFR-01, NFR-02, NFR-03, NFR-06
**Success Criteria** (what must be TRUE):
  1. All 12 packages have working implementations
  2. multi-step-ivr-input-validator correctly imports from ivr-call-flow-validator
  3. All Python packages pass ruff + pip install -e
  4. make scaffold-check 43/43, make type-check 39/0, make lint clean

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Monorepo Scaffold | v2.1 | 2/2 | Complete | 2026-04-02 |
| 2. P0 Package Stubs | v2.1 | 3/3 | Complete | 2026-04-02 |
| 3. Extract Tier Completion | v2.1 | 2/2 | Complete | 2026-04-02 |
| 4. Build + Translate Completion | v2.1 | 4/4 | Complete | 2026-04-02 |
| 5. Scaffold Expansion | v2.1 | 4/4 | Complete | 2026-04-02 |
| 6. Wave 1 Quick Wins | v2.2 | 2/2 | Complete | 2026-04-03 |
| 7. Wave 2 Core Architecture | v2.2 | 1/3 | In Progress|  |
| 8. Wave 3 P1 Portfolio | v2.2 | 0/0 | Not started | - |
| 9. Wave 4 P2 Engineering | v2.2 | 0/0 | Not started | - |
| 10. Wave 5 P3 Nice to Have | v2.2 | 0/0 | Not started | - |
| 11. Wave 6 Expansion | v2.2 | 0/0 | Not started | - |
