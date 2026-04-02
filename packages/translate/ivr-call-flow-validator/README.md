# ivr-call-flow-validator

Exhaustive transition validation for IVR call flow state machines, translated from Claude Code's Vim FSM pattern.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P1** — Translate tier completion.

## Source Pattern

- **Recipe 5**: Vim FSM Exhaustive Transitions
- **Source file**: `vim/` FSM (mode transition validation)
- **KB sections**: Recipe 5 (Vim FSM Applied to IVR)

## Domain Translation

Maps Claude Code's Vim FSM exhaustive mode transition validation to IVR call flow design verification:

| Vim FSM Concept | IVR Call Flow Concept |
|-----------------|---------------------|
| Vim mode (normal, insert, visual) | IVR node type (menu, transfer, queue) |
| Keystroke input | DTMF input (0-9, *, #, timeout) |
| Mode transition | Call flow transition |
| Unreachable mode | Orphan/unreachable node |
| Missing transition | Unhandled DTMF input |

## Key Insight

Every IVR menu node should handle all expected DTMF inputs, and every node should be reachable from the entry point. Dead-end nodes (no outgoing transitions from a non-terminal node) and orphan nodes indicate call flow design errors. This mirrors how Vim's FSM ensures every mode has explicit transitions for all relevant keystrokes.

## Exports

- `validate(flow)` — Validate call flow for completeness and correctness
- `getUnreachableNodes(flow)` — Find nodes not reachable from entry
- `getTransitionCoverage(node)` — DTMF input coverage ratio for a node
- `IVRNodeType` — Type: menu, announcement, transfer, voicemail, callback, queue, disconnect, data_dip, subflow
- `DTMFInput` — Type: 0-9, *, #, timeout, no_input
- `IVRTransition` — Interface: input, targetNode, condition
- `IVRNode` — Interface: id, type, label, transitions, defaultTransition, timeout, maxRetries
- `IVRCallFlow` — Interface: id, name, entryNode, nodes, version
- `ValidationSeverity` — Type: error, warning, info
- `ValidationIssue` — Interface: severity, nodeId, message, missingInputs
- `ValidationResult` — Interface: valid, issues, coverage

## Status

Type stubs only. All functions throw `Error("TODO")`.
