# @claude-patterns/multi-step-ivr-input-validator

Compound DTMF sequence validation for IVR call flows, translated from Claude Code's compound command decomposition pattern.

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P2** — Translate tier extension.

## Source Pattern

- **Pattern 8**: Compound command decomposition
- **Source**: Section 8.6 (Compound Command Handling)
- **KB sections**: Section 8.6 (Compound Commands), Section 43 (Contact Center)

## Domain Translation

Maps Claude Code's compound command decomposition to multi-step IVR DTMF validation:

| Claude Code Concept | Contact Center Concept |
|---------------------|----------------------|
| Compound command | Multi-step DTMF sequence |
| Command decomposition | Input decomposition ("1,3,2" -> ["1","3","2"]) |
| Step-by-step validation | Sequential flow graph traversal |
| Dead-end detection | Dead-end node identification |
| Exhaustive path enumeration | All-sequence generation |
| Validation result | Sequence validation result with failure point |

## Exports

- `validateSequence(flow, sequence)` — Validate DTMF sequence against call flow
- `decomposeInput(rawInput)` — Split raw input into individual DTMF steps
- `generateAllSequences(flow, maxDepth?)` — Generate all possible sequences
- `findDeadEndSequences(flow)` — Find sequences leading to dead-end nodes
- `DTMFStep` — Interface: input, expectedNodeId, actualNodeId
- `DTMFSequence` — Interface: steps, entryNodeId
- `SequenceValidationResult` — Interface: valid, failedAtStep, steps, reachableEndpoint
- `IVRCallFlow` — Re-exported from ivr-call-flow-validator
- `IVRNode` — Re-exported from ivr-call-flow-validator

## Dependencies

- `@claude-patterns/ivr-call-flow-validator` — IVRCallFlow and IVRNode types

## Status

Working implementation. `decomposeInput()` splits raw DTMF strings into individual steps. `validateSequence()` traverses the flow graph step-by-step, reporting the failure point. `generateAllSequences()` enumerates all paths up to a depth limit. `findDeadEndSequences()` identifies sequences terminating at non-terminal nodes. Tests in `src/multi-step-ivr-input-validator.test.ts`.
