# Phase 10: Wave 5 — P3 Nice to Have - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Implement 4 P3 packages (analytics, vim FSM, keyboard shortcuts, ink renderer). All packages have existing type stubs from prior milestones — this phase converts stubs to working implementations.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase with well-defined packages and success criteria. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints:
- vim-mode-fsm must have working state machine with transition()
- ink-renderer must have working render pipeline types
- make type-check and make lint must pass
- Follow patterns established in Phases 6-9 (prior implementation waves)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Prior wave implementations (Phases 6-9) establish the implementation pattern
- Existing type stubs in each package directory provide the contract to implement against
- Makefile targets for type-check, lint, scaffold-check

### Established Patterns
- Package scope: @claude-patterns/{name}
- TypeScript strict mode, ES2022, Bun workspaces
- Entry points: src/index.ts
- Type stubs + TODO comments converted to working implementations

### Integration Points
- Package dependencies defined in CLAUDE.md dependency graph
- Bun workspace configuration
- Makefile build system

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
