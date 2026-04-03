# Phase 5: Scaffold Expansion — Add 12 New Packages (#32-43) - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the monorepo from 31 to 43 packages by scaffolding 12 new packages identified from a gap analysis of Knowledge Base v2.1. All new packages follow the exact same stub pattern as the existing 31. No existing packages are modified. After scaffolding, update root config files and governance docs to reflect the expanded inventory.

New packages by tier:
- **Translate tier**: 1 Python (#32), 2 TypeScript (#33-34)
- **Build tier**: 9 TypeScript (#35-43)

</domain>

<decisions>
## Implementation Decisions

### Wave Strategy
- **D-01:** Batch by tier into 4 execution plans:
  - Plan 1: Translate tier (3 packages — #32 workforce-scheduling-coordinator [Python], #33 genesys-flow-security-validator [TS], #34 multi-step-ivr-input-validator [TS])
  - Plan 2: Build tier P1-P2 (5 packages — #35 tool-schema-cache, #36 tool-registry, #37 dialogue-history-manager, #38 system-reminder-injection, #39 plugin-lifecycle-manager)
  - Plan 3: Build tier P3 (4 packages — #40 sdk-bridge, #41 voice-input-gating, #42 output-style-system, #43 onboarding-flow-engine)
  - Plan 4: Root config updates + governance docs + full validation

### Root Config Updates
- **D-02:** 7 root files updated in a separate final plan (Plan 4), mirroring Phase 4's 04-04 pattern. Files: Makefile, package.json, CLAUDE.md, dependency-graph.md, KB-v2.1-Build-Inventory.md, README.md, IMPLEMENTATION-PLAYBOOK.md

### Project Docs Scope
- **D-03:** REQUIREMENTS.md and PROJECT.md updated to reflect 43 packages in Plan 4. ROADMAP.md updated by GSD on phase completion.

### Spec Fidelity
- **D-04:** When spec type definitions conflict with existing package exports, match real package signatures (Phase 4 precedent). Follow spec for new standalone types. Critical for #34 (multi-step-ivr-input-validator) which imports from existing @claude-patterns/ivr-call-flow-validator.

### Validation Checkpoints
- **D-05:** Run `make type-check` and lint after Plans 1-3. Full validation suite (`make scaffold-check` 43/43 + type-check + lint) in Plan 4.

### Spec File Disposition
- **D-06:** Move `SCAFFOLD-EXPANSION-PROMPT.md` from project root to `.planning/phases/05-*/` as a reference artifact after phase completion.

### Claude's Discretion
- Internal file structure and ordering within each package stub
- README prose beyond what the spec defines
- Any additional type annotations that improve stub usability without adding implementation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary Spec
- `SCAFFOLD-EXPANSION-PROMPT.md` — Complete definition of all 12 packages: exports, methods, file paths, domain translations, and root config update instructions. This is the authoritative source for Phase 5.

### Prior Phase Context
- `.planning/phases/04-build-translate-completion/04-CONTEXT.md` — Established patterns: 4-file scaffold, tsconfig extends chain, workspace refs, Python setuptools
- `.planning/phases/02-p0-package-stubs/02-CONTEXT.md` — Foundation patterns for package scaffolding

### Project Governance
- `.planning/PROJECT.md` — Project constraints (type stubs only, Bun workspaces, no implementations)
- `.planning/REQUIREMENTS.md` — FR/NFR requirements (to be updated in Plan 4)

### Existing Package Examples
- `packages/translate/ivr-call-flow-validator/` — TS translate tier reference (dependency target for #34)
- `packages/translate/workforce-scheduling-coordinator/` — Will be Python translate reference (new)
- `packages/build/prompt-system/` — Build tier reference with cross-package deps

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 31 existing packages across 3 tiers (all compile, deps wired)
- Established 4-file TS pattern: package.json + tsconfig.json + src/index.ts + README.md
- Established Python pattern: pyproject.toml + src/{name}/__init__.py + README.md
- Cross-package dependency wiring via workspace:* refs (proven in Phases 2-4)

### Established Patterns
- tsconfig extends `../../../tsconfig.base.json` for build-tier (3-level nesting)
- Package scope: `@claude-patterns/{name}` — tier directory invisible to imports
- Type stubs with `throw new Error("TODO: ...")` (TS) or `raise NotImplementedError("TODO: ...")` (Python)
- `setuptools.build_meta` backend for Python packages (Phase 02 decision)
- `import type` for type-only cross-package imports (Phase 03 decision)
- Path-based Makefile type-check — not `bun --filter` (Phase 01 decision)

### Integration Points
- Only new dependency: #34 multi-step-ivr-input-validator -> @claude-patterns/ivr-call-flow-validator (#28, exists)
- All other 11 new packages are independent (no cross-package deps)
- Bun workspaces: new TS translate packages (#33, #34) must be added to package.json workspaces array
- Python packages (#32) NOT added to Bun workspaces (existing convention)

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond what the spec defines — follow SCAFFOLD-EXPANSION-PROMPT.md for all package details.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-scaffold-expansion-add-12-new-packages-32-43-from-gap-analysis*
*Context gathered: 2026-04-02*
