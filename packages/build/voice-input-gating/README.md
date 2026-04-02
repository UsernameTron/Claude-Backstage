# @claude-patterns/voice-input-gating

Three-layer feature gating: remote flag, authentication, and runtime composite check.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P3** — Demonstrates layered feature gate pattern.

## Source Reference

- **Source pattern**: Voice input system (Section 34)
- **KB sections**: Section 34 (Voice Input System)

## Architecture

Three-layer feature gating: remote flag check (GrowthBook kill switch) then authentication check (OAuth token for Claude.ai voice_stream endpoint) then runtime composite check (combines flag + auth + platform support). Demonstrates the pattern of layered feature gates where each layer is independently controllable.

The composite gate check evaluates all layers in order and fails fast on the first denial, returning which layer blocked access and why. This pattern is reusable for any multi-condition feature rollout.

## Exports

- `GateLayer` — Union type for the three gate layers
- `GateResult` — Interface with allowed status, blocking layer, and reason
- `VoiceGatingConfig` — Configuration for flag key, auth type, and supported platforms
- `checkVoiceGating` — Run all gate layers for voice input
- `checkRemoteFlag` — Check a remote feature flag
- `checkAuthentication` — Verify authentication meets requirements
- `checkRuntimeSupport` — Check platform runtime support
- `compositeGateCheck` — Generic composite gate evaluator with fail-fast

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
