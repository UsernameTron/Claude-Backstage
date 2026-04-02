# @claude-patterns/voice-input-gating

**Tier:** Build | **Priority:** P3 | **KB:** Section 34

Three-layer feature gating for voice input: remote flag, authentication, and runtime checks.

## Source Pattern

- Section 34: Voice input gating — three sequential gate layers with fail-fast evaluation
- Gate order: remote_flag -> authentication -> runtime

## Architecture

Voice input is gated behind three layers evaluated in sequence. Each layer can independently deny access, and evaluation stops at the first denial (fail-fast). This pattern ensures voice features are only available when:

1. **Remote flag** — The feature is enabled server-side via a feature flag
2. **Authentication** — The user has the required authentication type (e.g., Max plan)
3. **Runtime** — The current platform supports voice input at the OS/browser level

### Fail-Fast Evaluation

The composite gate check evaluates layers in order. If the remote flag is disabled, authentication and runtime checks are never performed. This minimizes unnecessary API calls and provides clear denial reasons.

## Exports

### Types

- `GateLayer` — union of three gate layer identifiers
- `GateResult` — result with allowed flag, deniedBy layer, and reason string
- `VoiceGatingConfig` — feature flag key, required auth type, supported platforms

### Functions

- `checkVoiceGating(config)` — run all three layers against config
- `checkRemoteFlag(flagKey)` — check remote feature flag
- `checkAuthentication(requiredType)` — verify authentication type
- `checkRuntimeSupport(platform)` — check platform support
- `compositeGateCheck(gates)` — evaluate multiple layers in order, fail fast

## Dependencies

None.

## Status

Type stubs only. All functions throw `TODO` errors referencing implementation notes.
