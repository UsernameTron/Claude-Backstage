import { describe, test, expect, beforeEach } from "bun:test";
import {
  getSystemContext,
  getUserContext,
  appendSystemContext,
  prependUserContext,
  getSystemPromptInjection,
  setCachedClaudeMdContent,
  type SystemContext,
  type UserContext,
} from "./index";

describe("setCachedClaudeMdContent + getUserContext", () => {
  beforeEach(() => {
    setCachedClaudeMdContent(null);
  });

  test("getUserContext returns set claudeMdContent", () => {
    setCachedClaudeMdContent("hello");
    expect(getUserContext().claudeMdContent).toBe("hello");
  });

  test("getUserContext returns null claudeMdContent when set to null", () => {
    setCachedClaudeMdContent(null);
    expect(getUserContext().claudeMdContent).toBeNull();
  });

  test("getUserContext currentDate matches YYYY-MM-DD format", () => {
    const ctx = getUserContext();
    expect(ctx.currentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getSystemContext", () => {
  test("returns object with required fields", () => {
    const ctx = getSystemContext();
    expect(ctx).toHaveProperty("gitBranch");
    expect(ctx).toHaveProperty("mainBranch");
    expect(ctx).toHaveProperty("gitUser");
    expect(ctx).toHaveProperty("gitStatus");
    expect(ctx).toHaveProperty("recentCommits");
    expect(typeof ctx.gitBranch).toBe("string");
    expect(Array.isArray(ctx.recentCommits)).toBe(true);
  });

  test("is memoized - returns same object reference", () => {
    const ctx1 = getSystemContext();
    const ctx2 = getSystemContext();
    expect(ctx1).toBe(ctx2);
  });
});

describe("appendSystemContext", () => {
  const mockContext: SystemContext = {
    gitBranch: "feat/test",
    mainBranch: "main",
    gitUser: "tester",
    gitStatus: "M file.ts",
    recentCommits: ["abc1234 initial commit"],
  };

  test("returns string starting with original prompt", () => {
    const result = appendSystemContext("prompt", mockContext);
    expect(result.startsWith("prompt")).toBe(true);
  });

  test("contains context gitBranch", () => {
    const result = appendSystemContext("prompt", mockContext);
    expect(result).toContain("feat/test");
  });

  test("includes all labeled fields", () => {
    const result = appendSystemContext("prompt", mockContext);
    expect(result).toContain("Current branch:");
    expect(result).toContain("Main branch:");
    expect(result).toContain("Git user:");
    expect(result).toContain("Status:");
    expect(result).toContain("Recent commits:");
  });

  test("includes cacheBreaker when present", () => {
    const ctxWithBreaker = { ...mockContext, cacheBreaker: "break-123" };
    const result = appendSystemContext("prompt", ctxWithBreaker);
    expect(result).toContain("break-123");
  });
});

describe("prependUserContext", () => {
  const mockUserContext: UserContext = {
    claudeMdContent: "# Project Rules",
    currentDate: "2026-04-02",
  };

  test("returns array with 1 element for empty messages", () => {
    const result = prependUserContext([], mockUserContext);
    expect(result).toHaveLength(1);
  });

  test("prepends reminder before existing messages", () => {
    const msg1 = { role: "user", content: "hello" };
    const msg2 = { role: "assistant", content: "hi" };
    const result = prependUserContext([msg1, msg2], mockUserContext);
    expect(result).toHaveLength(3);
    // First element is the reminder, then msg1, msg2
    expect(result[1]).toBe(msg1);
    expect(result[2]).toBe(msg2);
  });

  test("wraps content in system-reminder tags", () => {
    const result = prependUserContext([], mockUserContext);
    const first = result[0] as { role: string; content: string };
    expect(first.content).toContain("<system-reminder>");
    expect(first.content).toContain("</system-reminder>");
  });

  test("includes claudeMdContent in reminder", () => {
    const result = prependUserContext([], mockUserContext);
    const first = result[0] as { role: string; content: string };
    expect(first.content).toContain("# Project Rules");
  });

  test("includes currentDate in reminder", () => {
    const result = prependUserContext([], mockUserContext);
    const first = result[0] as { role: string; content: string };
    expect(first.content).toContain("2026-04-02");
  });
});

describe("getSystemPromptInjection", () => {
  test("returns null by default", () => {
    expect(getSystemPromptInjection()).toBeNull();
  });
});
