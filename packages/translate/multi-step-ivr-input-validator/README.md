# @claude-patterns/multi-step-ivr-input-validator

Validates multi-step DTMF input sequences against IVR call flow state machines, translating Claude Code's compound command decomposition pattern into per-step IVR input validation.

## Tier

**Translate** — New builds from pattern adaptation.

## Priority

**P2** — Extends the IVR call flow validator with sequence-level validation.

## Source Pattern

- **Source pattern**: Compound command decomposition (Section 8.6, Pattern 8)
- **KB sections**: Section 8.6 (Compound Command Decomposition), Section 43 (Multi-step IVR input)

## Domain Translation

| Claude Code Concept | IVR Concept |
|---------------------|-------------|
| Compound command (`cmd1 && cmd2`) | Multi-step DTMF sequence (press 1, then 3, then 2) |
| Subcommand decomposition | Step-by-step input decomposition |
| Per-subcommand validation | Per-step DTMF validation against current menu state |
| Injection detection (`safe && evil`) | Invalid sequence detection (valid step 1, invalid step 2) |
| Pattern: validate each independently | Pattern: validate each DTMF against the node it reaches |

## Key Insight

Claude Code decomposes compound commands like `cmd1 && cmd2 && cmd3` into individual subcommands and validates each one independently, catching injection attacks where a safe first command masks a dangerous second command. IVR call flows have the exact same problem: a caller pressing "1, 3, 2" is executing a compound navigation sequence where each step changes the active menu context. Validating only the first input is insufficient -- each subsequent DTMF must be validated against the node that the previous step actually reached. This decompose-then-validate-each pattern catches dead-end sequences, unreachable endpoints, and invalid mid-sequence inputs.

## Exports

- `DTMFSequence` — A complete multi-step DTMF input sequence with entry point
- `DTMFStep` — A single step in a DTMF sequence with expected and actual node IDs
- `SequenceValidationResult` — Result of validating a DTMF sequence against a flow
- `validateSequence` — Validate a sequence of DTMF inputs against a call flow
- `decomposeInput` — Split raw input string into individual DTMF steps
- `generateAllSequences` — Enumerate all possible DTMF paths through a flow
- `findDeadEndSequences` — Find sequences that lead to dead-end nodes

## Dependencies

- `@claude-patterns/ivr-call-flow-validator` — IVRCallFlow and IVRNode types

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
