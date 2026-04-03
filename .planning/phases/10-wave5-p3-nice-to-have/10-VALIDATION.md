---
phase: 10
slug: wave5-p3-nice-to-have
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test (vitest-compatible) |
| **Config file** | Per-package tsconfig.json |
| **Quick run command** | `bun test --filter {package}` |
| **Full suite command** | `make type-check && make lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun test --filter {package}`
- **After every plan wave:** Run `make type-check && make lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | W5-01 | unit+type | `bun test extract/analytics-killswitch` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | W5-02 | unit+type | `bun test build/vim-mode-fsm` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 1 | W5-03 | unit+type | `bun test build/keyboard-shortcuts` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 1 | W5-04 | unit+type | `bun test build/ink-renderer` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test files created alongside implementations (colocated tests)
- [ ] Existing bun:test infrastructure covers all phase requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| vim-mode-fsm transition() state machine | W5-02 | State transitions require review | Verify mode transitions cover all 11 modes |
| ink-renderer render pipeline types | W5-04 | Type design quality | Review type hierarchy for completeness |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
