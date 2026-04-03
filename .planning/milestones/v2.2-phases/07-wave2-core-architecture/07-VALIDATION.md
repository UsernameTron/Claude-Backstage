---
phase: 7
slug: wave2-core-architecture
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test (TS), pytest (Python — N/A this phase) |
| **Config file** | tsconfig.base.json (root) |
| **Quick run command** | `$HOME/.bun/bin/bun test {package}/src/` |
| **Full suite command** | `make type-check && make lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `$HOME/.bun/bin/bun test {package}/src/`
- **After every plan wave:** Run `make type-check && make lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | W2-01 | unit+type | `bun test packages/build/prompt-cache-optimizer/src/` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | W2-02 | unit+type | `bun test packages/build/prompt-system/src/` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | W2-03 | unit+type | `bun test packages/build/context-injection/src/` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | W2-04 | unit+type | `bun test packages/extract/permission-system/src/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test files created per package as part of TDD RED phase
- [ ] Existing bun:test infrastructure covers all requirements

*Existing infrastructure covers framework — test files created during TDD RED phase.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
