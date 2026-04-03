# @claude-patterns/onboarding-flow-engine

**Tier:** Build | **Priority:** P3 | **KB:** Section 36

Dynamic multi-step onboarding with conditional step assembly and dependency ordering.

## Source Pattern

- Section 36: Onboarding flow engine — conditional step assembly based on auth method and environment
- Standard flow: preflight -> theme -> oauth -> api-key -> security -> terminal-setup

## Architecture

The onboarding flow engine assembles and executes a sequence of onboarding steps tailored to the user's authentication method and environment. Steps declare dependencies on other steps and can be conditionally skipped.

### Conditional Assembly

Not all steps apply to every user. The engine filters steps based on:

- **Auth method** — OAuth users skip the api-key step; API key users skip oauth
- **Environment** — Terminal setup is skipped in non-terminal environments
- **Dependencies** — Steps are ordered to respect their `dependsOn` declarations

### Execution Model

Steps execute sequentially in dependency order. Each step returns a `StepResult` indicating success or failure. On failure, the error is recorded but execution continues with remaining steps. The `skipTo` method allows jumping ahead, marking intermediate steps as skipped.

### State Tracking

`OnboardingState` tracks completed steps, skipped steps, and errors throughout the flow. The engine exposes state via `getState()` for progress reporting.

## Exports

### Types

- `StepResult` — step outcome with success flag, next step, and error
- `OnboardingStep` — step definition with id, label, execute, shouldSkip, dependsOn
- `OnboardingConfig` — steps array, auth method, and environment
- `OnboardingState` — current step, completed/skipped lists, and error array

### Classes

- `OnboardingFlowEngine` — constructor, assembleSteps, runStep, run, getState, skipTo

## Dependencies

None.

## Status

Working implementation. `OnboardingFlowEngine` provides functional `assembleSteps()` (conditional filtering with dependency validation), `runStep()` (execution with error recording), `run()` (full sequential flow), `getState()` (snapshot), and `skipTo()` (jump-ahead with intermediate skip marking). Tests verify the complete onboarding lifecycle (see `__tests__/`).
