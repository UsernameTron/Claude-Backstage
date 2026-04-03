import { describe, test, expect, beforeEach } from "bun:test";
import { DenialTracker, DENIAL_LIMITS } from "./index";

describe("DenialTracker", () => {
  let tracker: DenialTracker;

  beforeEach(() => {
    tracker = new DenialTracker();
  });

  test("initial state is zero", () => {
    const state = tracker.getState();
    expect(state.consecutive).toBe(0);
    expect(state.total).toBe(0);
  });

  test("recordDenial increments consecutive and total", () => {
    tracker.recordDenial();
    const state = tracker.getState();
    expect(state.consecutive).toBe(1);
    expect(state.total).toBe(1);
  });

  test("recordDenial returns 'continue' below thresholds", () => {
    const action = tracker.recordDenial();
    expect(action).toBe("continue");
  });

  test("recordDenial returns 'fallback_to_interactive' at consecutive threshold", () => {
    tracker.recordDenial(); // 1
    tracker.recordDenial(); // 2
    const action = tracker.recordDenial(); // 3 — hits maxConsecutive
    expect(action).toBe("fallback_to_interactive");
  });

  test("recordApproval resets consecutive but preserves total", () => {
    tracker.recordDenial();
    tracker.recordDenial();
    tracker.recordApproval();
    const state = tracker.getState();
    expect(state.consecutive).toBe(0);
    expect(state.total).toBe(2);
  });

  test("shouldFallback returns true when consecutive >= maxConsecutive", () => {
    for (let i = 0; i < DENIAL_LIMITS.maxConsecutive; i++) {
      tracker.recordDenial();
    }
    expect(tracker.shouldFallback()).toBe(true);
  });

  test("shouldFallback returns false below thresholds", () => {
    tracker.recordDenial();
    expect(tracker.shouldFallback()).toBe(false);
  });

  test("exactly 20 total denials triggers fallback regardless of consecutive", () => {
    // Accumulate 19 total with approvals resetting consecutive
    for (let i = 0; i < 19; i++) {
      tracker.recordDenial();
      if ((i + 1) % 2 === 0) {
        tracker.recordApproval();
      }
    }
    // 20th denial should trigger fallback via total threshold
    const action = tracker.recordDenial();
    expect(action).toBe("fallback_to_interactive");
    expect(tracker.getState().total).toBe(20);
  });

  test("3 denials, approval, 3 more denials triggers fallback (consecutive resets)", () => {
    tracker.recordDenial();
    tracker.recordDenial();
    tracker.recordDenial(); // consecutive=3
    tracker.recordApproval(); // consecutive=0, total=3
    tracker.recordDenial(); // consecutive=1
    tracker.recordDenial(); // consecutive=2
    const action = tracker.recordDenial(); // consecutive=3 — triggers
    expect(action).toBe("fallback_to_interactive");
    expect(tracker.getState().total).toBe(6);
  });

  test("reset zeros both counters", () => {
    tracker.recordDenial();
    tracker.recordDenial();
    tracker.reset();
    const state = tracker.getState();
    expect(state.consecutive).toBe(0);
    expect(state.total).toBe(0);
  });

  test("getState returns a copy (not a reference)", () => {
    const state = tracker.getState();
    // Mutating the returned object should not affect internal state
    (state as { consecutive: number }).consecutive = 999;
    expect(tracker.getState().consecutive).toBe(0);
  });

  test("DENIAL_LIMITS has correct values", () => {
    expect(DENIAL_LIMITS.maxConsecutive).toBe(3);
    expect(DENIAL_LIMITS.maxTotal).toBe(20);
  });
});
