"""Tests for ConsecutiveBreachTracker."""

from consecutive_breach_tracker import (
    BREACH_THRESHOLDS,
    BreachAction,
    ConsecutiveBreachTracker,
)


class TestInit:
    def test_initial_state(self) -> None:
        tracker = ConsecutiveBreachTracker("queue-1")
        assert tracker.state.consecutive == 0
        assert tracker.state.total == 0
        assert tracker.state.queue_id == "queue-1"

    def test_initial_action_is_none(self) -> None:
        tracker = ConsecutiveBreachTracker("queue-1")
        assert tracker.get_action() == BreachAction.NONE


class TestRecordBreach:
    def test_single_breach_returns_none(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        assert tracker.record_breach() == BreachAction.NONE
        assert tracker.state.consecutive == 1
        assert tracker.state.total == 1

    def test_three_consecutive_returns_widen_rings(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        tracker.record_breach()
        tracker.record_breach()
        result = tracker.record_breach()
        assert result == BreachAction.WIDEN_RINGS
        assert tracker.state.consecutive == 3

    def test_twenty_total_returns_force_staffing(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        for _ in range(20):
            result = tracker.record_breach()
        assert result == BreachAction.FORCE_STAFFING
        assert tracker.state.total == 20

    def test_force_staffing_overrides_widen_rings(self) -> None:
        """When total >= 20, FORCE_STAFFING takes priority even if consecutive >= 3."""
        tracker = ConsecutiveBreachTracker("q1")
        for _ in range(20):
            tracker.record_breach()
        # consecutive is 20 (>= 3) AND total is 20 (>= 20)
        assert tracker.get_action() == BreachAction.FORCE_STAFFING


class TestRecordRecovery:
    def test_resets_consecutive_preserves_total(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        tracker.record_breach()
        tracker.record_breach()
        tracker.record_recovery()
        assert tracker.state.consecutive == 0
        assert tracker.state.total == 2

    def test_breach_recovery_breach_cycle(self) -> None:
        """3 breaches, recovery, 3 more breaches -> WIDEN_RINGS."""
        tracker = ConsecutiveBreachTracker("q1")
        for _ in range(3):
            tracker.record_breach()
        tracker.record_recovery()
        assert tracker.state.consecutive == 0
        assert tracker.state.total == 3

        tracker.record_breach()
        tracker.record_breach()
        result = tracker.record_breach()
        assert result == BreachAction.WIDEN_RINGS
        assert tracker.state.total == 6


class TestGetAction:
    def test_does_not_modify_state(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        tracker.record_breach()
        tracker.record_breach()
        state_before = tracker.state
        tracker.get_action()
        assert tracker.state.consecutive == state_before.consecutive
        assert tracker.state.total == state_before.total


class TestReset:
    def test_zeros_all_counters(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        for _ in range(5):
            tracker.record_breach()
        tracker.reset()
        assert tracker.state.consecutive == 0
        assert tracker.state.total == 0
        assert tracker.state.queue_id == "q1"


class TestStateProperty:
    def test_returns_copy(self) -> None:
        tracker = ConsecutiveBreachTracker("q1")
        tracker.record_breach()
        s = tracker.state
        s.consecutive = 999
        assert tracker.state.consecutive == 1

    def test_preserves_queue_id(self) -> None:
        tracker = ConsecutiveBreachTracker("my-queue")
        assert tracker.state.queue_id == "my-queue"


class TestThresholds:
    def test_threshold_constants(self) -> None:
        assert BREACH_THRESHOLDS["max_consecutive"] == 3
        assert BREACH_THRESHOLDS["max_total"] == 20
