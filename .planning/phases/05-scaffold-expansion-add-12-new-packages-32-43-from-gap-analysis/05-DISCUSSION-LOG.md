# Phase 5: Scaffold Expansion — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 05-scaffold-expansion-add-12-new-packages-32-43-from-gap-analysis
**Areas discussed:** Wave strategy, Root config updates, Project docs scope, Spec fidelity, Validation checkpoints, Spec file disposition

---

## Wave Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| By tier | Plan 1: Translate (3 pkgs). Plan 2: Build P1-P2 (5 pkgs). Plan 3: Build P3 (4 pkgs). Follows same tier-based logic as Phases 2-4. | ✓ |
| Two big waves | All 12 packages in one wave, then root configs. Fastest but biggest blast radius. | |
| By priority | P1 packages first, then P2, then P3. Groups by importance rather than tier. | |

**User's choice:** By tier (Recommended)
**Notes:** Matches the established pattern from Phases 2-4.

---

## Root Config Updates

| Option | Description | Selected |
|--------|-------------|----------|
| Separate final plan | Plan 4: All 7 root file updates + validation. Mirrors Phase 4's 04-04 pattern. | ✓ |
| Bundle with last wave | Add root config updates to Build P3 wave. Fewer plans but mixes concerns. | |
| You decide | Claude picks based on Phase 2-4 precedent. | |

**User's choice:** Separate final plan (Recommended)
**Notes:** Clean separation of scaffolding from config updates.

---

## Project Docs Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Update in Plan 4 | Add REQUIREMENTS.md and PROJECT.md updates to root config plan. ROADMAP.md auto-updated by GSD. | ✓ |
| Skip — milestone close | Leave governance docs at 31 until /gsd:complete-milestone. | |
| You decide | Claude picks based on documentation standards. | |

**User's choice:** Update in Plan 4 (Recommended)
**Notes:** Keeps governance current without a separate plan.

---

## Spec Fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Existing code wins | Match real package signatures when importing from existing packages (Phase 4 precedent). Follow spec for new standalone types. | ✓ |
| Spec wins exactly | Follow SCAFFOLD-EXPANSION-PROMPT.md to the letter. Adapt dep packages if needed. | |
| You decide per-case | Claude uses judgment per cross-package import. | |

**User's choice:** Existing code wins (Recommended)
**Notes:** Phase 4 lesson: "Matched actual dep package signatures over plan interface comments where they diverged."

---

## Validation Checkpoints

| Option | Description | Selected |
|--------|-------------|----------|
| After each plan | Run make type-check and lint after Plans 1-3. Full suite in Plan 4. Catches issues early. | ✓ |
| Only in Plan 4 | Scaffold all first, validate at end. Faster but late detection. | |
| You decide | Claude determines based on risk. | |

**User's choice:** After each plan (Recommended)
**Notes:** Matches Phase 2-4 practice where each plan verified its own output.

---

## Spec File Disposition

| Option | Description | Selected |
|--------|-------------|----------|
| Move to phase dir | Move to .planning/phases/05-*/ as reference artifact. Keeps spec with execution artifacts. | ✓ |
| Delete it | Remove from root after scaffolding. Packages are the deliverable. | |
| Leave at root | Keep as permanent root documentation. | |

**User's choice:** Move to phase dir (Recommended)
**Notes:** Keeps the spec co-located with plans and summaries.

---

## Claude's Discretion

- Internal file structure and ordering within each package stub
- README prose beyond spec definitions
- Additional type annotations that improve stub usability

## Deferred Ideas

None — discussion stayed within phase scope.
