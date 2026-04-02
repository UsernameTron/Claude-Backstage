# consecutive-breach-tracker

Queue overflow handling translated from Claude Code's denial tracking pattern (Pattern 7).

## Tier

**Translate** — New build from pattern adaptation.

## Priority

**P0** — Core translate package.

## Source Pattern

- **Pattern 7**: Adaptive Denial Tracking
- **Source file**: `utils/permissions/denialTracking.ts` (45 LOC)
- **KB sections**: 8.4 (Denial Tracking), Section 43 (Translate Tier Patterns)

## Domain Translation

Maps Claude Code's consecutive denial counter with adaptive fallback to contact center queue SLA breach tracking:

| Claude Code Concept | Contact Center Concept |
|---------------------|----------------------|
| Denial counter | SLA breach counter |
| 3 consecutive denials -> YOLO mode | 3 consecutive breaches -> widen bullseye rings |
| Total denial limit | 20 total breaches -> force staffing action |
| Reset on success | Reset consecutive on recovery |
| Shift boundary | Shift boundary reset |

## Key Insight

Threshold triggers a strategy change, not just an alert. When consecutive breaches hit 3, the system widens routing rings (overflow routing) rather than simply notifying. When total breaches hit 20, it forces a staffing action (escalate to supervisor). This mirrors how Claude Code's denial tracking switches to YOLO mode after repeated permission denials.

## Exports

- `ConsecutiveBreachTracker` — Main tracker class
- `BreachAction` — Enum: NONE, WIDEN_RINGS, FORCE_STAFFING
- `BreachState` — Dataclass: consecutive, total, queue_id
- `BREACH_THRESHOLDS` — Dict with max_consecutive (3) and max_total (20)

## Status

Type stubs only. All methods raise `NotImplementedError`.
