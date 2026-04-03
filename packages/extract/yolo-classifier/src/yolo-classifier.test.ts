import { describe, test, expect } from "bun:test";
import {
  classifierDecision,
  classifierShared,
  classifierToPermission,
  type YoloClassifierResult,
  type ClassifierSharedContext,
} from "./index";

describe("classifierDecision", () => {
  test("returns a valid YoloClassifierResult for default mode context", async () => {
    const context: ClassifierSharedContext = {
      mode: "default",
      toolName: "Bash",
      toolInput: { command: "ls" },
    };
    const result = await classifierDecision(context);
    expect(result).toHaveProperty("action");
    expect(result).toHaveProperty("reason");
    expect(result).toHaveProperty("confidence");
    expect(["allow", "deny", "ask"]).toContain(result.action);
  });

  test("returns ask for default mode with dangerous tool input", async () => {
    const context: ClassifierSharedContext = {
      mode: "default",
      toolName: "Bash",
      toolInput: { command: "rm -rf /" },
    };
    const result = await classifierDecision(context);
    expect(result.action).toBe("ask");
  });

  test("returns allow for bypassPermissions mode", async () => {
    const context: ClassifierSharedContext = {
      mode: "bypassPermissions",
      toolName: "Read",
      toolInput: { file_path: "/tmp/test.txt" },
    };
    const result = await classifierDecision(context);
    expect(result.action).toBe("allow");
  });

  test("returns deny for plan mode", async () => {
    const context: ClassifierSharedContext = {
      mode: "plan",
      toolName: "Write",
      toolInput: { file_path: "/tmp/out.txt" },
    };
    const result = await classifierDecision(context);
    expect(result.action).toBe("deny");
  });
});

describe("classifierShared", () => {
  test("returns template string for permissions_external", () => {
    const result = classifierShared("permissions_external");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("external");
  });

  test("returns template string for permissions_anthropic", () => {
    const result = classifierShared("permissions_anthropic");
    expect(typeof result).toBe("string");
    expect(result).toContain("anthropic");
  });
});

describe("classifierToPermission", () => {
  test("maps allow action to allowed: true", () => {
    const result: YoloClassifierResult = {
      action: "allow",
      reason: "Safe operation",
      confidence: "high",
    };
    const permission = classifierToPermission(result);
    expect(permission.allowed).toBe(true);
    expect(permission.reason).toBe("Safe operation");
  });

  test("maps deny action to allowed: false", () => {
    const result: YoloClassifierResult = {
      action: "deny",
      reason: "Dangerous command",
      confidence: "high",
    };
    const permission = classifierToPermission(result);
    expect(permission.allowed).toBe(false);
  });

  test("maps ask action to allowed: false", () => {
    const result: YoloClassifierResult = {
      action: "ask",
      reason: "Needs confirmation",
      confidence: "medium",
    };
    const permission = classifierToPermission(result);
    expect(permission.allowed).toBe(false);
  });
});
