# Risk Assessment: claude-code-patterns

**Domain:** Type-stub monorepo derived from Claude Code source analysis
**Researched:** 2026-04-01
**Overall risk level:** HIGH (IP risks dominate all other concerns)

---

## Critical Risks

### Risk 1: DMCA Takedown / Intellectual Property Enforcement

**Severity:** CRITICAL
**Likelihood:** HIGH if published to GitHub
**Confidence:** HIGH (verified against current events)

**What goes wrong:** Anthropic has already filed DMCA takedowns against 8,100+ repositories containing Claude Code source material. The initial sweep was overly broad — it hit forks of Anthropic's own public Claude Code repo, not just leak mirrors. Anthropic retracted the broad sweep but kept targeted takedowns against repos containing the accidentally released source. A type-stub repo that references exact source file paths (e.g., `utils/permissions/denialTracking.ts`) and exports function signatures from Claude Code's proprietary codebase falls into a gray zone that Anthropic's legal team could target.

**Why it matters for this project specifically:**

1. **Source path references are a fingerprint.** Every package README references exact paths like `services/tools/StreamingToolExecutor.ts` and `utils/permissions/` — these are unambiguously derived from the leaked source tree. Even without copying implementation code, these paths prove the work derives from proprietary material.

2. **Type signatures may constitute copyrightable expression.** The Google v. Oracle Supreme Court ruling (2021) found that copying Java API declarations was fair use in Google's specific context — but the Court deliberately avoided ruling on whether API declarations are copyrightable. Type signatures like `hasPermissionsToUseTool`, `checkRuleBasedPermissions`, and `applyPermissionRulesToPermissionContext` are specific enough to be treated as creative expression, not generic functional interfaces.

3. **The "90% AI-generated" argument is unresolved.** Anthropic has publicly stated Claude Code is ~90% AI-generated. Under current U.S. copyright law requiring human authorship, this weakens Anthropic's IP claims — but this legal theory is untested and relying on it is a gamble.

4. **Anthropic's enforcement posture is aggressive.** The initial 8,100-repo DMCA sweep, even if partially retracted, signals willingness to enforce broadly. A repo that systematically catalogs 31 subsystems with exact file paths and type signatures is a high-visibility target.

**Prevention:**
- Do NOT publish this repo to GitHub or any public hosting. Keep it local/private.
- Strip exact source file paths from READMEs. Replace with generic descriptions ("permission evaluation module," not `utils/permissions/denialTracking.ts`).
- Rename exported types and functions to original names that describe the same pattern without copying Anthropic's naming. `evaluatePermission()` instead of `hasPermissionsToUseTool()`.
- Frame all packages as "pattern implementations inspired by common agent architecture patterns" rather than "extracted from Claude Code source."
- Consider writing original type signatures that capture the same architectural pattern without mirroring the proprietary API surface.

**Detection:** GitHub DMCA notice, cease and desist letter, repo takedown without warning.

---

### Risk 2: Scope Creep and Partial Completion

**Severity:** HIGH
**Likelihood:** HIGH
**Confidence:** HIGH (inherent to project structure)

**What goes wrong:** 31 packages is a large surface area for type stubs. The project risks becoming a graveyard of partially scaffolded packages where P0 items are usable but P2-P3 items are empty shells that never get populated. This degrades the value of the entire monorepo because consumers cannot distinguish "intentionally minimal stub" from "abandoned package."

**Specific failure modes:**
- P0 packages (7 items) get attention; the remaining 24 rot
- Cross-package dependencies reference packages that never get meaningful stubs (e.g., `dangerous-command-detection` depends on `permission-system` and `path-validation`)
- The 19,848-LOC Custom Ink Renderer (P3) will never be meaningfully stubbed — it is too large and too tightly coupled to Ink's internals
- Python translate packages (3 of 31) require separate tooling, separate mental model, separate validation — they will be neglected

**Prevention:**
- Ship P0 as Milestone 1. Do not scaffold P2-P3 until P0 compiles and is actually useful.
- Set an explicit "archived" state for packages that will not be built. An intentional "not planned" is better than an implicit "forgotten."
- Cut the Custom Ink Renderer (#22, 19,848 LOC) entirely — it is an anti-pattern for a stub library. It requires too much Ink-specific context to stub meaningfully.
- Consider cutting the 4 P3 items entirely (Vim FSM, Keyboard Shortcuts, Ink Renderer, Analytics Killswitch = 28,560 LOC reference material for near-zero return).

**Detection:** More than 50% of packages have only scaffold files after 2 weeks. Any package with zero TODO comments beyond the initial template.

---

## Moderate Risks

### Risk 3: Bun Workspace Limitations at Scale

**Severity:** MODERATE
**Likelihood:** MODERATE
**Confidence:** MEDIUM (verified via Bun docs and issue tracker)

**What goes wrong:** Bun workspaces share a single `node_modules/` at the monorepo root. With 28 TypeScript packages (plus 3 Python), several issues emerge:

1. **Dependency isolation is broken.** Any package can import any other package's dependencies without declaring them. This is a known Bun limitation with no current fix. For type stubs with minimal dependencies this is low-risk, but it means `tsc --noEmit` could pass even when a package.json is missing a dependency declaration.

2. **No selective publishing.** `bun publish` lacks `--filter` support. Since this project explicitly does NOT publish to npm (consumed by copy), this is a non-issue, but it locks the project into copy-based consumption permanently.

3. **Glob patterns for 31 packages.** The workspace glob `packages/*/` in package.json needs to be `packages/*/*/` for tiered structure. Bun handles nested globs, but debugging resolution issues across 3 tiers and 31 packages can be frustrating.

**Prevention:**
- Accept the shared node_modules limitation — for type stubs it is harmless.
- Use `packages/extract/*`, `packages/build/*`, `packages/translate/*` as explicit workspace entries rather than a single deep glob.
- Run `tsc --noEmit` per-package as well as monorepo-wide to catch missing dependency declarations early.
- If Bun workspace resolution becomes painful, pnpm is a drop-in replacement with better isolation. The switch cost is low for a type-stub repo.

**Detection:** `tsc --noEmit` passes in monorepo but fails when a package is extracted standalone. Phantom imports that resolve only because of hoisted dependencies.

---

### Risk 4: Mixed TypeScript/Python Monorepo Friction

**Severity:** MODERATE
**Likelihood:** HIGH
**Confidence:** HIGH (well-documented challenge)

**What goes wrong:** The 3 Python translate packages (ConsecutiveBreachTracker, CostPerInteraction, and one more) exist in a Bun workspace that has no native Python support. This creates two parallel toolchains with no shared infrastructure:

- Bun handles TypeScript: `bun install`, `tsc --noEmit`, Biome for linting
- Python requires: `pip install -e`, `pyright` or `mypy` for type checking, `ruff` for linting
- Makefile targets must orchestrate both, but failures in one toolchain do not block the other
- CI (if ever added) needs both runtimes
- A developer cloning the repo who only has Bun installed cannot validate the Python packages

**Prevention:**
- Treat Python packages as first-class citizens in the Makefile with explicit targets: `make type-check-py`, `make lint-py`.
- Document Python prerequisites clearly in the root README: Python 3.11+, pip, ruff, pyright.
- Consider whether the 3 Python packages belong in this repo at all. They are "translate" tier — new builds inspired by patterns, not stubs of existing code. They could live in a separate repo without losing value.
- If they stay, use a `pyproject.toml` at the monorepo root with workspace-style path dependencies rather than independent `pip install -e` per package.

**Detection:** `make type-check` silently skips Python packages. Python packages pass locally but fail in any shared environment.

---

### Risk 5: Maintenance Burden and Staleness

**Severity:** MODERATE
**Likelihood:** HIGH (over 6+ months)
**Confidence:** MEDIUM

**What goes wrong:** Claude Code ships weekly updates. The type stubs reference a snapshot of version 2.1.88's architecture. Within 3-6 months:

- Function signatures may change (renamed, new parameters, removed exports)
- Entire subsystems may be restructured (the Ink renderer has been rewritten before)
- New subsystems emerge that the stub library does not cover
- Source file paths shift as Anthropic reorganizes

Since this is a private reference library (not a public dependency), staleness is less dangerous than for a published package — but it still erodes the core value proposition of "accurate type signatures you can build from."

**Prevention:**
- Accept that stubs are a point-in-time snapshot, not a living mirror. Document the source version explicitly: "Based on Claude Code v2.1.88, March 31 2026."
- Do not attempt to track Claude Code updates. The stubs capture architectural patterns, not runtime compatibility.
- Focus on patterns that are architecturally stable (permission system, denial tracking, cost tracking) rather than patterns that change frequently (UI rendering, CLI startup).

**Detection:** Type stubs compile but no longer match the actual Claude Code API. This is only detectable if you have access to a newer source version.

---

## Minor Risks

### Risk 6: Security — Proprietary Code Leaking Into Stubs

**Severity:** MODERATE (reputational) / LOW (technical)
**Likelihood:** LOW
**Confidence:** HIGH

**What goes wrong:** A developer working on stubs copies implementation logic from the source tree into what should be a type-only file. The project claims "type stubs and TODO comments only" but an implementation snippet slips in. This converts the repo from "pattern reference" to "source code copy" — massively increasing DMCA exposure.

**Prevention:**
- Enforce a lint rule or git hook that flags any function body longer than 3 lines (stubs should have no bodies beyond `throw new Error("TODO")` or `pass`).
- The `make scaffold-check` target should validate that `.ts` files contain no function implementations (only type declarations, interfaces, and stub bodies).
- Code review discipline: any PR that adds more than type signatures gets rejected.
- The source tree (`claude-code/src/`) should NOT be in the same repository. Keep it in a separate, gitignored location.

**Detection:** `grep -r "return " packages/ --include="*.ts" | grep -v "throw"` should return zero results in a pure stub repo.

---

### Risk 7: Misleading Package Names

**Severity:** LOW
**Likelihood:** LOW
**Confidence:** MEDIUM

**What goes wrong:** The `@claude-patterns/` npm scope and package names like `permission-system` and `yolo-classifier` could be confused with official Anthropic packages. If published (even accidentally), this could trigger trademark issues beyond copyright.

**Prevention:**
- Never publish to npm. The `"private": true` flag in every package.json prevents accidental publishing.
- Consider a scope name that is clearly unofficial: `@cc-patterns/` or `@agent-patterns/` instead of `@claude-patterns/`.
- Add an explicit disclaimer in the root README: "This project is not affiliated with, endorsed by, or sponsored by Anthropic."

**Detection:** `npm whoami` or `bun publish` should fail for all packages.

---

## Phase-Specific Risk Warnings

| Phase | Primary Risk | Mitigation |
|-------|-------------|------------|
| Scaffolding (Phase 1) | Over-scaffolding P2-P3 creates dead packages | Scaffold P0 only; backlog the rest |
| Type Stubs (Phase 2) | Copying implementation code into stubs | Lint rule for function body length |
| Cross-Package Deps (Phase 3) | Circular or phantom dependencies | Per-package standalone `tsc --noEmit` |
| Python Packages (Phase 4) | Neglected second-class toolchain | Separate Makefile targets, or separate repo |
| Documentation (ongoing) | Source file paths create DMCA fingerprints | Genericize all path references |

---

## Risk Matrix Summary

| Risk | Severity | Likelihood | Mitigation Effort |
|------|----------|------------|-------------------|
| DMCA / IP enforcement | CRITICAL | HIGH (if public) | HIGH — requires rearchitecting references |
| Scope creep / partial completion | HIGH | HIGH | MEDIUM — cut P3, phase P0 first |
| Bun workspace limitations | MODERATE | MODERATE | LOW — acceptable for type stubs |
| Mixed TS/Python friction | MODERATE | HIGH | MEDIUM — consider separating Python |
| Maintenance staleness | MODERATE | HIGH | LOW — accept snapshot, document version |
| Proprietary code leakage | MODERATE | LOW | MEDIUM — lint rules and hooks |
| Misleading package names | LOW | LOW | LOW — `private: true` and disclaimers |

---

## Top Recommendation

**The IP risk dominates all other concerns.** Before investing in scaffolding 31 packages with exact source paths and type signatures, make a deliberate decision:

1. **Private-only (recommended):** Keep the repo local. Never push to GitHub. Use freely as a personal build reference. The exact source paths and signatures are valuable precisely because they are exact — genericizing them loses value.

2. **Public-safe variant:** Strip all source file paths. Rename all types and functions to original names. Frame as "common agent architecture patterns" rather than "Claude Code patterns." This is a significant rework that changes the project's character.

3. **Hybrid:** Maintain a private repo with exact references AND a public repo with genericized patterns. Double the maintenance burden but preserves both use cases.

The project as currently designed (exact paths, exact function names, `@claude-patterns/` scope) is a DMCA target if published. As a private local reference, it is extremely valuable and legally lower-risk.

---

## Sources

- [Anthropic DMCA Notice (2026-03-31)](https://github.com/github/dmca/blob/master/2026/03/2026-03-31-anthropic.md)
- [TechCrunch: Anthropic took down thousands of GitHub repos](https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/)
- [Slashdot: Anthropic Issues Copyright Takedowns for 8,000+ Repos](https://developers.slashdot.org/story/26/04/01/158240/anthropic-issues-copyright-takedown-requests-to-remove-8000-copies-of-claude-code-source-code)
- [VentureBeat: Claude Code Source Code Leak](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know/)
- [Google LLC v. Oracle America, Inc. (Supreme Court, 2021)](https://www.supremecourt.gov/opinions/20pdf/18-956_d18f.pdf)
- [EFF: Victory for Fair Use in Oracle v. Google](https://www.eff.org/deeplinks/2021/04/victory-fair-use-supreme-court-reverses-federal-circuit-oracle-v-google)
- [Bun Workspaces Documentation](https://bun.com/docs/pm/workspaces)
- [Bun Issue #16656: Workspace Package Isolation](https://github.com/oven-sh/bun/issues/16656)
- [PiunikaWeb: GitHub enforces Anthropic DMCA notices](https://piunikaweb.com/2026/04/01/anthropic-dmca-claude-code-leak-github/)
- [The Hacker News: Claude Code Source Leaked via npm](https://thehackernews.com/2026/04/claude-code-tleaked-via-npm-packaging.html)
