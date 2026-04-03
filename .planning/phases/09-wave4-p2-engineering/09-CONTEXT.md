# Phase 9: Wave 4 — P2 Engineering Depth - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

Implement 8 P2 packages: security, config, path validation, MCP integration, CLI startup. These are engineering-depth packages that depend on Phase 7's permission-system and Phase 8's partial outputs.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow proven TDD workflow.

Key constraints:
- dangerous-command-detection imports from permission-system and path-validation
- sandbox-config imports from path-validation
- Preserve existing type signatures

</decisions>

<code_context>
## Existing Code Insights

Phase 7-8 packages fully implemented. All cross-package imports resolve.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
