# @claude-patterns/denial-tracking

Denial counter with adaptive fallback for Claude Code's permission system. Tracks consecutive and total permission denials, triggering a switch to interactive prompting when thresholds are exceeded.

## Source Reference

- **Path:** `utils/permissions/denialTracking.ts` (45 LOC)
- **KB Section:** 8.4 — Denial Tracking with Behavioral Adaptation
- **Tier:** Extract (P0)

## Key Exports

### Constants
- `DENIAL_LIMITS` — Thresholds: 3 consecutive or 20 total denials trigger fallback

### Types
- `DenialState` — Current consecutive and total denial counts
- `DenialAction` — `"continue"` or `"fallback_to_interactive"`

### Classes
- `DenialTracker` — Stateful tracker with `recordDenial()`, `recordApproval()`, `shouldFallback()`, `reset()`, `getState()`

## Architecture

The denial tracker is an adaptive security mechanism. Rather than allowing the AI to loop endlessly on blocked actions, the system recognizes when something is stuck and changes strategy by falling back to interactive prompting. Approval resets the consecutive counter but not the total.

## Dependencies

None — standalone tracking utility.

## Downstream Dependents

Used by the permission system's main evaluation loop.
