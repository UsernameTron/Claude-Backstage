import { describe, test, expect, beforeEach } from "bun:test";
import {
  logEvent,
  initializeAnalytics,
  isKillswitchEnabled,
  isProtectedField,
  resetState,
  setKillswitch,
  type AnalyticsEvent,
  type TelemetrySink,
} from "./index";

function createMockSink(enabled = true): TelemetrySink & { events: AnalyticsEvent[] } {
  const events: AnalyticsEvent[] = [];
  return {
    events,
    send(event: AnalyticsEvent) {
      events.push(event);
    },
    flush: async () => {},
    isEnabled: () => enabled,
  };
}

function createEvent(name = "test_event"): AnalyticsEvent {
  return { name, properties: { key: "value" }, timestamp: Date.now() };
}

describe("analytics-killswitch", () => {
  beforeEach(() => {
    resetState();
  });

  test("logEvent queues event when not initialized", () => {
    const event = createEvent("queued");
    logEvent(event);
    // Verify by initializing with a sink and checking it receives the queued event
    const sink = createMockSink();
    initializeAnalytics([sink]);
    expect(sink.events.length).toBe(1);
    expect(sink.events[0].name).toBe("queued");
  });

  test("logEvent skips when killswitch is active", () => {
    const sink = createMockSink();
    initializeAnalytics([sink]);
    setKillswitch(true);
    logEvent(createEvent("should_skip"));
    expect(sink.events.length).toBe(0);
  });

  test("logEvent routes to enabled sinks after initialization", () => {
    const sink = createMockSink();
    initializeAnalytics([sink]);
    const event = createEvent("routed");
    logEvent(event);
    expect(sink.events.length).toBe(1);
    expect(sink.events[0].name).toBe("routed");
  });

  test("logEvent skips disabled sinks", () => {
    const enabledSink = createMockSink(true);
    const disabledSink = createMockSink(false);
    initializeAnalytics([enabledSink, disabledSink]);
    logEvent(createEvent("partial"));
    expect(enabledSink.events.length).toBe(1);
    expect(disabledSink.events.length).toBe(0);
  });

  test("initializeAnalytics drains queued events to new sinks", () => {
    logEvent(createEvent("first"));
    logEvent(createEvent("second"));
    logEvent(createEvent("third"));
    const sink = createMockSink();
    initializeAnalytics([sink]);
    expect(sink.events.length).toBe(3);
    expect(sink.events[0].name).toBe("first");
    expect(sink.events[1].name).toBe("second");
    expect(sink.events[2].name).toBe("third");
  });

  test("isKillswitchEnabled returns false by default", () => {
    expect(isKillswitchEnabled()).toBe(false);
  });

  test("isKillswitchEnabled returns true after setKillswitch(true)", () => {
    setKillswitch(true);
    expect(isKillswitchEnabled()).toBe(true);
  });

  test("isProtectedField returns true for _PROTO_ prefixed fields", () => {
    expect(isProtectedField("_PROTO_secret")).toBe(true);
    expect(isProtectedField("_PROTO_")).toBe(true);
  });

  test("isProtectedField returns false for normal fields", () => {
    expect(isProtectedField("name")).toBe(false);
    expect(isProtectedField("proto")).toBe(false);
    expect(isProtectedField("PROTO_value")).toBe(false);
  });

  test("resetState clears all module state", () => {
    logEvent(createEvent("before_reset"));
    setKillswitch(true);
    resetState();
    expect(isKillswitchEnabled()).toBe(false);
    // After reset, events should queue again (not initialized)
    logEvent(createEvent("after_reset"));
    const sink = createMockSink();
    initializeAnalytics([sink]);
    // Should only have the post-reset event, not the pre-reset one
    expect(sink.events.length).toBe(1);
    expect(sink.events[0].name).toBe("after_reset");
  });

  test("multiple sinks all receive events", () => {
    const sink1 = createMockSink();
    const sink2 = createMockSink();
    initializeAnalytics([sink1, sink2]);
    logEvent(createEvent("broadcast"));
    expect(sink1.events.length).toBe(1);
    expect(sink2.events.length).toBe(1);
  });
});
