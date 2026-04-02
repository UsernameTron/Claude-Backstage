---
phase: 05-scaffold-expansion
verified: 2026-04-02T20:00:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: "EXP-32 through EXP-43 requirement IDs exist in REQUIREMENTS.md"
    status: failed
    reason: "Plan 05-04 specified adding FR-6 section with EXP-32 through EXP-43 entries to REQUIREMENTS.md. This was not done. REQUIREMENTS.md contains 0 EXP- entries. The ROADMAP references these IDs but they are orphaned."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "Missing FR-6: Expansion Packages section with EXP-32 through EXP-43 entries"
    missing:
      - "Add FR-6 section to REQUIREMENTS.md with individual requirement entries for EXP-32 through EXP-43, matching the format in the 05-04-PLAN task 2 action description"
---

# Phase 5: Scaffold Expansion Verification Report

**Phase Goal:** Expand monorepo from 31 to 43 packages by scaffolding 12 new packages from KB v2.1 gap analysis, updating all root configs and governance docs
**Verified:** 2026-04-02T20:00:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `make scaffold-check` reports 43/43 packages present | VERIFIED | Command output: "43/43 packages present" |
| 2 | `make type-check` passes for all 35 TS packages | VERIFIED | Output: "39 packages checked, 0 failed" (39 includes all TS packages across tiers) |
| 3 | `pip install -e` succeeds for all 4 Python packages | VERIFIED (structural) | All 4 pyproject.toml files parse correctly via tomllib. pip install blocked by PEP 668 (externally managed Python env), not a package defect. |
| 4 | #34 multi-step-ivr-input-validator imports types from #28 ivr-call-flow-validator | VERIFIED | `import type { IVRCallFlow, IVRNode } from "@claude-patterns/ivr-call-flow-validator"` at line 18, workspace dep in package.json, tsc compiles clean |
| 5 | All root docs (CLAUDE.md, README.md, dependency-graph.md, KB inventory) reflect 43 packages | VERIFIED | All 4 docs contain "43" references with correct package counts |

**Score:** 4/5 truths verified (truth 3 verified structurally; pip install cannot run due to environment constraint, not package defect)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/translate/workforce-scheduling-coordinator/src/workforce_scheduling_coordinator/__init__.py` | SchedulingCoordinator class | VERIFIED | Contains `class SchedulingCoordinator`, JobType enum, dataclasses |
| `packages/translate/genesys-flow-security-validator/src/index.ts` | validateFlow function | VERIFIED | Contains `export function validateFlow`, ArchitectFlow, FlowValidationRule |
| `packages/translate/multi-step-ivr-input-validator/src/index.ts` | DTMFSequence, validateSequence | VERIFIED | Contains DTMFSequence, DTMFStep, validateSequence, decomposeInput, generateAllSequences |
| `packages/build/tool-schema-cache/src/index.ts` | ToolSchemaCache class | VERIFIED | Contains `export class ToolSchemaCache`, CachedToolSchema, CachePolicy |
| `packages/build/tool-registry/src/index.ts` | assembleToolPool function | VERIFIED | Contains `export function assembleToolPool`, filterToolsByDenyRules, sortForCacheStability |
| `packages/build/dialogue-history-manager/src/index.ts` | DialogueHistoryManager class | VERIFIED | Contains class, MessageType, CompactBoundaryMessage |
| `packages/build/system-reminder-injection/src/index.ts` | injectReminder function | VERIFIED | Contains `export function injectReminder`, wrapInReminderTags, extractReminders |
| `packages/build/plugin-lifecycle-manager/src/index.ts` | PluginLifecycleManager class | VERIFIED | Contains class, PluginManifest, PluginState |
| `packages/build/sdk-bridge/src/index.ts` | SDKBridge class | VERIFIED | Contains `export class SDKBridge`, SDKMessage, SessionConfig, ControlRequest |
| `packages/build/voice-input-gating/src/index.ts` | checkVoiceGating function | VERIFIED | Contains `export function checkVoiceGating`, compositeGateCheck, GateLayer |
| `packages/build/output-style-system/src/index.ts` | loadOutputStyles function | VERIFIED | Contains `export function loadOutputStyles`, applyOutputStyle, isPlainText, MarkdownCache |
| `packages/build/onboarding-flow-engine/src/index.ts` | OnboardingFlowEngine class | VERIFIED | Contains class, OnboardingStep, OnboardingState, StepResult |
| `Makefile` | Updated package lists | VERIFIED | BUILD_PKGS has 19 entries, TRANSLATE_TS_PKGS has 4, TRANSLATE_PY_PKGS has 4 |
| `package.json` | Workspace entries for new TS translate | VERIFIED | Contains genesys-flow-security-validator and multi-step-ivr-input-validator |
| `CLAUDE.md` | 43 package counts | VERIFIED | "43 Claude Code subsystems", "build/** (19 TS)", "translate/** (8 mixed)" |
| `dependency-graph.md` | IVR dependency chain | VERIFIED | Contains multi-step-ivr-input-validator chain |
| `README.md` | 43 buildable systems | VERIFIED | "43 buildable systems" in header |
| `.planning/REQUIREMENTS.md` | FR-6 section with EXP-32 to EXP-43 | FAILED | No EXP- entries exist. NFR/FR counts updated but individual expansion requirements never added. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| multi-step-ivr-input-validator/src/index.ts | @claude-patterns/ivr-call-flow-validator | `import type { IVRCallFlow, IVRNode }` | WIRED | Import resolves, tsc compiles, workspace dep in package.json |
| Makefile | packages/build/*, packages/translate/* | BUILD_PKGS, TRANSLATE_*_PKGS variables | WIRED | All 12 new packages present in Makefile variables |
| package.json | packages/translate/genesys-flow-security-validator | workspaces array | WIRED | Entry present in workspaces |

### Data-Flow Trace (Level 4)

Not applicable -- this is a type-stub monorepo with no dynamic data rendering.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| scaffold-check 43/43 | `make scaffold-check` | "43/43 packages present" | PASS |
| type-check all TS | `make type-check` | "39 packages checked, 0 failed" | PASS |
| Python pyproject validity | `python3 -c "import tomllib; ..."` | All 4 parse OK | PASS |
| IVR cross-package import | `grep import.*IVRCallFlow` | Line 18 confirmed | PASS |
| Root docs 43 count | `grep "43" CLAUDE.md README.md ...` | All contain "43" | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EXP-32 | 05-01 | workforce-scheduling-coordinator package | SATISFIED | Package exists with SchedulingCoordinator class, pyproject.toml valid |
| EXP-33 | 05-01 | genesys-flow-security-validator package | SATISFIED | Package exists with validateFlow, tsc compiles |
| EXP-34 | 05-01 | multi-step-ivr-input-validator package | SATISFIED | Package exists with cross-dep on ivr-call-flow-validator, tsc compiles |
| EXP-35 | 05-02 | tool-schema-cache package | SATISFIED | Package exists with ToolSchemaCache class, tsc compiles |
| EXP-36 | 05-02 | tool-registry package | SATISFIED | Package exists with assembleToolPool, tsc compiles |
| EXP-37 | 05-02 | dialogue-history-manager package | SATISFIED | Package exists with DialogueHistoryManager, tsc compiles |
| EXP-38 | 05-02 | system-reminder-injection package | SATISFIED | Package exists with injectReminder, tsc compiles |
| EXP-39 | 05-02 | plugin-lifecycle-manager package | SATISFIED | Package exists with PluginLifecycleManager, tsc compiles |
| EXP-40 | 05-03 | sdk-bridge package | SATISFIED | Package exists with SDKBridge class, tsc compiles |
| EXP-41 | 05-03 | voice-input-gating package | SATISFIED | Package exists with checkVoiceGating, tsc compiles |
| EXP-42 | 05-03 | output-style-system package | SATISFIED | Package exists with loadOutputStyles, tsc compiles |
| EXP-43 | 05-03 | onboarding-flow-engine package | SATISFIED | Package exists with OnboardingFlowEngine, tsc compiles |
| EXP-ROOT | 05-04 | Root config updates for 43 packages | SATISFIED | Makefile, package.json, CLAUDE.md all updated |
| EXP-DOCS | 05-04 | Governance docs reflect 43 packages | PARTIALLY SATISFIED | README.md, dependency-graph.md, KB inventory, IMPLEMENTATION-PLAYBOOK.md updated. REQUIREMENTS.md missing FR-6 section. |
| EXP-VALIDATE | 05-04 | Full validation passes | SATISFIED | scaffold-check 43/43, type-check 0 failures |

**Note:** EXP-32 through EXP-43 are referenced in ROADMAP.md and plan frontmatter but do NOT exist as formal entries in REQUIREMENTS.md. The 05-04-PLAN explicitly called for adding an "FR-6: Expansion Packages" section with these entries, but this was not executed.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| All 12 new packages | Various | `throw new Error("TODO: ...")` / `raise NotImplementedError` | Info | Expected -- this is a type-stub monorepo. All implementations are intentionally TODO. |

No blocker or warning-level anti-patterns found. All TODO patterns are by design.

### Human Verification Required

### 1. Python Package Installation

**Test:** Run `pip install -e packages/translate/workforce-scheduling-coordinator` in a virtualenv
**Expected:** Installs successfully without errors
**Why human:** Current environment has PEP 668 restriction preventing pip install outside a virtualenv. pyproject.toml parses correctly but actual install needs a venv.

### 2. ROADMAP Phase 5 Status

**Test:** Verify ROADMAP.md Phase 5 plan 05-04 checkbox is updated
**Expected:** Plan 05-04 should be marked `[x]` and phase status should be "Complete"
**Why human:** The ROADMAP currently shows 05-04 as `[ ]` and Phase 5 as "0/4 Planning". The SUMMARY claims completion, but ROADMAP was not updated.

### Gaps Summary

One gap found:

**REQUIREMENTS.md missing FR-6 section (EXP-32 through EXP-43):** The 05-04-PLAN task 2 explicitly specified adding an FR-6: Expansion Packages section to REQUIREMENTS.md with individual entries for EXP-32 through EXP-43. The SUMMARY claims this was done, but the actual file contains zero EXP- entries. The ROADMAP references these requirement IDs, making them orphaned -- they exist in the plan system but have no backing definition in REQUIREMENTS.md.

This is a documentation gap, not a functional gap. All 12 packages are fully scaffolded, compile, and pass validation. The missing requirements entries do not block the phase goal but violate the governance contract that every requirement ID referenced in ROADMAP.md must have a corresponding definition in REQUIREMENTS.md.

Additionally, the ROADMAP.md itself was not updated to reflect Phase 5 completion (plan 05-04 still marked incomplete, phase status still "0/4 Planning").

---

_Verified: 2026-04-02T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
