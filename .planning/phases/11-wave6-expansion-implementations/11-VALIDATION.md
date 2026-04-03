---
phase: 11
slug: wave6-expansion-implementations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test (TS), pytest (Python) |
| **Config file** | Per-package tsconfig.json / pyproject.toml |
| **Quick run command** | `bun test --filter {package}` / `cd packages/translate/{pkg} && python -m pytest` |
| **Full suite command** | `make type-check && make lint` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun test --filter {package}`
- **After every plan wave:** Run `make type-check && make lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | W6-01 | unit+type | `bun test packages/build/session-permissions-cache` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | W6-02 | unit+type | `bun test packages/build/tool-result-summarizer` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 1 | W6-03 | unit+type | `bun test packages/build/command-history-manager` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 1 | W6-04 | unit+type | `bun test packages/build/config-schema-validator` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 1 | W6-05 | unit+type | `bun test packages/build/tool-use-metrics-collector` | ❌ W0 | ⬜ pending |
| 11-02-03 | 02 | 1 | W6-06 | unit+type | `bun test packages/build/context-window-budget-allocator` | ❌ W0 | ⬜ pending |
| 11-03-01 | 03 | 1 | W6-07 | unit+type | `bun test packages/build/error-recovery-strategy-selector` | ❌ W0 | ⬜ pending |
| 11-03-02 | 03 | 1 | W6-08 | unit+type | `bun test packages/build/dependency-graph-resolver` | ❌ W0 | ⬜ pending |
| 11-03-03 | 03 | 1 | W6-09 | unit+type | `bun test packages/build/multi-step-ivr-input-validator` | ❌ W0 | ⬜ pending |
| 11-04-01 | 04 | 1 | W6-10 | unit+type | `bun test packages/build/notification-routing-engine` | ❌ W0 | ⬜ pending |
| 11-04-02 | 04 | 1 | W6-11 | unit+type | `bun test packages/build/agent-capability-registry` | ❌ W0 | ⬜ pending |
| 11-04-03 | 04 | 1 | W6-12 | unit+pytest | `cd packages/translate/workforce-scheduling-coordinator && python -m pytest` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test files created alongside implementations (colocated tests)
- [ ] Existing bun:test + pytest infrastructure covers all phase requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| multi-step-ivr-input-validator cross-package import | W6-09 | Import resolution from workspace dep | Verify import from @claude-patterns/ivr-call-flow-validator resolves |
| workforce-scheduling-coordinator Python install | W6-12 | pip install -e verification | Run pip install -e and verify import works |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
