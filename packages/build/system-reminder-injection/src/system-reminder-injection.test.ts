import { describe, test, expect } from "bun:test";
import {
  wrapInReminderTags,
  injectReminder,
  extractReminders,
  shouldInjectReminder,
  type SystemReminder,
} from "./index";

describe("system-reminder-injection", () => {
  describe("wrapInReminderTags", () => {
    test("wraps content in default system-reminder tags", () => {
      expect(wrapInReminderTags("hello")).toBe(
        "<system-reminder>hello</system-reminder>",
      );
    });

    test("wraps content in custom tag name", () => {
      expect(wrapInReminderTags("hello", "custom-tag")).toBe(
        "<custom-tag>hello</custom-tag>",
      );
    });

    test("handles empty content", () => {
      expect(wrapInReminderTags("")).toBe(
        "<system-reminder></system-reminder>",
      );
    });
  });

  describe("injectReminder", () => {
    test("appends wrapped reminder to message", () => {
      const reminder: SystemReminder = {
        source: "user_context",
        content: "Remember this",
        targetMessageIndex: 0,
      };
      const result = injectReminder("msg", reminder);
      expect(result).toBe(
        "msg\n<system-reminder>Remember this</system-reminder>",
      );
    });
  });

  describe("extractReminders", () => {
    test("extracts single reminder from tagged content", () => {
      const result = extractReminders(
        "<system-reminder>content</system-reminder>",
      );
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("content");
      expect(result[0].source).toBe("user_context");
    });

    test("returns empty array when no tags found", () => {
      const result = extractReminders("no tags here");
      expect(result).toHaveLength(0);
    });

    test("extracts multiple reminders", () => {
      const result = extractReminders(
        "<system-reminder>first</system-reminder> text <system-reminder>second</system-reminder>",
      );
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("first");
      expect(result[1].content).toBe("second");
    });
  });

  describe("shouldInjectReminder", () => {
    test("always injects user_context", () => {
      expect(shouldInjectReminder("user_context", 1)).toBe(true);
      expect(shouldInjectReminder("user_context", 99)).toBe(true);
    });

    test("always injects tool_result", () => {
      expect(shouldInjectReminder("tool_result", 1)).toBe(true);
    });

    test("always injects attachment", () => {
      expect(shouldInjectReminder("attachment", 3)).toBe(true);
    });

    test("always injects todo_write", () => {
      expect(shouldInjectReminder("todo_write", 7)).toBe(true);
    });

    test("injects mcp_status only on periodic turns", () => {
      expect(shouldInjectReminder("mcp_status", 5)).toBe(true);
      expect(shouldInjectReminder("mcp_status", 10)).toBe(true);
      expect(shouldInjectReminder("mcp_status", 3)).toBe(false);
    });

    test("injects deferred_tools only on periodic turns", () => {
      expect(shouldInjectReminder("deferred_tools", 5)).toBe(true);
      expect(shouldInjectReminder("deferred_tools", 7)).toBe(false);
    });
  });
});
