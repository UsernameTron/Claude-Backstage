"""Queue overflow handling translated from Claude Code denial tracking (Pattern 7).

Tracks SLA breaches per queue. Thresholds:
- 3 consecutive breaches -> widen bullseye rings (activate overflow routing)
- 20 total breaches in shift -> force staffing action (escalate to supervisor)

Source pattern: utils/permissions/denialTracking.ts (45 LOC)
KB reference: Pattern 7 — Adaptive Denial Tracking, Section 43
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class BreachAction(Enum):
    """Action to take after recording a breach."""
    NONE = "none"
    WIDEN_RINGS = "widen_rings"
    FORCE_STAFFING = "force_staffing"


@dataclass
class BreachState:
    """Current breach tracking state for a queue."""
    consecutive: int = 0
    total: int = 0
    queue_id: str = ""


BREACH_THRESHOLDS = {
    "max_consecutive": 3,
    "max_total": 20,
}


class ConsecutiveBreachTracker:
    """Track SLA breaches per queue with adaptive escalation.

    Translates Claude Code's denial tracking pattern to contact center
    queue overflow handling.
    """

    def __init__(self, queue_id: str) -> None:
        self._state = BreachState(consecutive=0, total=0, queue_id=queue_id)

    def record_breach(self) -> BreachAction:
        """Record an SLA breach and return the recommended action.

        Returns:
            BreachAction.NONE — below thresholds
            BreachAction.WIDEN_RINGS — 3+ consecutive breaches
            BreachAction.FORCE_STAFFING — 20+ total breaches
        """
        self._state.consecutive += 1
        self._state.total += 1
        return self.get_action()

    def record_recovery(self) -> None:
        """Record a successful service level interval (resets consecutive counter)."""
        self._state.consecutive = 0

    def get_action(self) -> BreachAction:
        """Check current state and return recommended action without recording."""
        if self._state.total >= BREACH_THRESHOLDS["max_total"]:
            return BreachAction.FORCE_STAFFING
        if self._state.consecutive >= BREACH_THRESHOLDS["max_consecutive"]:
            return BreachAction.WIDEN_RINGS
        return BreachAction.NONE

    def reset(self) -> None:
        """Reset all counters (e.g., at shift boundary)."""
        self._state.consecutive = 0
        self._state.total = 0

    @property
    def state(self) -> BreachState:
        """Current breach state (read-only)."""
        return BreachState(
            consecutive=self._state.consecutive,
            total=self._state.total,
            queue_id=self._state.queue_id,
        )
