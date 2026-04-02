# @claude-patterns/onboarding-flow-engine

Dynamic multi-step onboarding with conditional step assembly based on auth method and environment.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P3** — Configurable step pipeline pattern for onboarding flows.

## Source Reference

- **Source pattern**: Onboarding flow (Section 36)
- **KB sections**: Section 36 (Onboarding Flow)

## Architecture

Dynamic multi-step onboarding with conditional assembly. Steps: `preflight` then `theme` then `oauth` then `api-key` then `security` then `terminal-setup`. Steps are dynamically assembled based on authentication method and environment -- not all steps run for all users.

The pattern is a configurable step pipeline where each step can conditionally skip based on runtime state. Steps declare dependencies on other step IDs, enabling the engine to validate ordering and skip dependent steps when a prerequisite is skipped.

## Exports

- `OnboardingStep` — Interface for a step with id, label, execute function, skip predicate, dependencies
- `OnboardingConfig` — Configuration with steps, auth method, and environment
- `OnboardingState` — Runtime state tracking current, completed, skipped steps, and errors
- `StepResult` — Interface for step execution outcome with optional next-step override
- `OnboardingFlowEngine` — Class orchestrating the step pipeline

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
