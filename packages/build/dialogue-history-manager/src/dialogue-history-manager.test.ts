import { describe, test, expect } from "bun:test";
import {
  DialogueHistoryManager,
  type DialogueMessage,
  type HistoryConfig,
} from "./index";

function makeConfig(overrides: Partial<HistoryConfig> = {}): HistoryConfig {
  return {
    maxRecords: 100,
    storePath: "/tmp/test-history.jsonl",
    externalStorageThreshold: 1000,
    ...overrides,
  };
}

function makeMessage(
  overrides: Partial<DialogueMessage> = {},
): DialogueMessage {
  return {
    type: "user",
    content: "hello",
    timestamp: Date.now(),
    metadata: {},
    ...overrides,
  };
}

describe("dialogue-history-manager", () => {
  test("constructor initializes with empty messages", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    expect(mgr.getEffectiveMessages()).toHaveLength(0);
  });

  test("addMessage appends to internal array", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "first" }));
    mgr.addMessage(makeMessage({ content: "second" }));
    const msgs = mgr.getEffectiveMessages();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].content).toBe("first");
    expect(msgs[1].content).toBe("second");
  });

  test("addMessage enforces maxRecords by shifting oldest", () => {
    const mgr = new DialogueHistoryManager(makeConfig({ maxRecords: 2 }));
    mgr.addMessage(makeMessage({ content: "a" }));
    mgr.addMessage(makeMessage({ content: "b" }));
    mgr.addMessage(makeMessage({ content: "c" }));
    const msgs = mgr.getEffectiveMessages();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].content).toBe("b");
    expect(msgs[1].content).toBe("c");
  });

  test("getEffectiveMessages returns copy, not reference", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "test" }));
    const msgs1 = mgr.getEffectiveMessages();
    const msgs2 = mgr.getEffectiveMessages();
    expect(msgs1).not.toBe(msgs2);
  });

  test("insertCompactBoundary adds boundary message", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "before" }));
    mgr.insertCompactBoundary("summary of previous messages");
    mgr.addMessage(makeMessage({ content: "after" }));
    const effective = mgr.getEffectiveMessages();
    expect(effective).toHaveLength(1);
    expect(effective[0].content).toBe("after");
  });

  test("getEffectiveMessages returns all when no boundary", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "a" }));
    mgr.addMessage(makeMessage({ content: "b" }));
    expect(mgr.getEffectiveMessages()).toHaveLength(2);
  });

  test("multiple compact boundaries: uses last one", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "old1" }));
    mgr.insertCompactBoundary("first summary");
    mgr.addMessage(makeMessage({ content: "mid" }));
    mgr.insertCompactBoundary("second summary");
    mgr.addMessage(makeMessage({ content: "new" }));
    const effective = mgr.getEffectiveMessages();
    expect(effective).toHaveLength(1);
    expect(effective[0].content).toBe("new");
  });

  test("persist serializes to JSONL and loadFromDisk restores", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "one", type: "user" }));
    mgr.addMessage(
      makeMessage({ content: "two", type: "assistant" }),
    );
    mgr.persist();
    const loaded = mgr.loadFromDisk("/tmp/test-history.jsonl");
    expect(loaded).toHaveLength(2);
    expect(loaded[0].content).toBe("one");
    expect(loaded[1].content).toBe("two");
    expect(loaded[1].type).toBe("assistant");
  });

  test("getMessagesAfterCompactBoundary aliases getEffectiveMessages", () => {
    const mgr = new DialogueHistoryManager(makeConfig());
    mgr.addMessage(makeMessage({ content: "before" }));
    mgr.insertCompactBoundary("summary");
    mgr.addMessage(makeMessage({ content: "after" }));
    const result = mgr.getMessagesAfterCompactBoundary();
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("after");
  });
});
