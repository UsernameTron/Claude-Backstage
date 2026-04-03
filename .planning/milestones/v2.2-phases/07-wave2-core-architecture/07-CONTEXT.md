# Phase 7: Wave 2 — Core Architecture - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Implement 4 core architectural packages including the 9.4K LOC permission-system. These are the foundational packages that downstream P1/P2 packages depend on.

Packages: prompt-cache-optimizer, prompt-system, context-injection, permission-system

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions. Follow the proven TDD workflow from Phase 6: RED (stubs throw) -> GREEN (implement) -> verify (tsc + bun test).

Key constraints from prior phases:
- Preserve all existing type signatures — only TODO throw bodies get replaced
- Use shallow copy for readonly contracts
- Module-level storage patterns (Maps, arrays) for state
- bun binary is at $HOME/.bun/bin/bun
- tsconfig extends path is ../../../tsconfig.base.json (3 levels)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 6 proven TDD implementation workflow
- Existing type stubs in all 4 packages with full signatures
- KB v2.1 as implementation reference

### Established Patterns
- bun:test for TypeScript testing
- tsc --noEmit for type checking
- Biome for TS linting, Ruff for Python

### Integration Points
- permission-system is depended on by yolo-classifier, dangerous-command-detection (Phase 8-9)
- prompt-system feeds into context-injection
- prompt-cache-optimizer is standalone

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — discuss phase skipped.

</deferred>
