import { describe, test, expect, beforeEach } from "bun:test";
import {
  hasPermissionsToUseTool,
  checkRuleBasedPermissions,
  getAllowRules,
  getDenyRules,
  getAskRules,
  isDangerousBashPermission,
  addAllowRule,
  addDenyRule,
  addAskRule,
  clearAllRules,
  DANGEROUS_BASH_PATTERNS,
  CROSS_PLATFORM_CODE_EXEC,
  PERMISSION_RULE_SOURCES,
  type PermissionRule,
  type PermissionResult,
  type PermissionMode,
} from "./index";

describe("isDangerousBashPermission", () => {
  test("empty string returns true (allows ALL)", () => {
    expect(isDangerousBashPermission("")).toBe(true);
  });

  test("wildcard '*' returns true", () => {
    expect(isDangerousBashPermission("*")).toBe(true);
  });

  test("exact match 'python' returns true", () => {
    expect(isDangerousBashPermission("python")).toBe(true);
  });

  test("case-insensitive 'Python' returns true", () => {
    expect(isDangerousBashPermission("Python")).toBe(true);
  });

  test("prefix syntax 'node:*' returns true", () => {
    expect(isDangerousBashPermission("node:*")).toBe(true);
  });

  test("trailing wildcard 'bash*' returns true", () => {
    expect(isDangerousBashPermission("bash*")).toBe(true);
  });

  test("space wildcard 'ssh *' returns true", () => {
    expect(isDangerousBashPermission("ssh *")).toBe(true);
  });

  test("flag wildcard 'sudo -u*' returns true", () => {
    expect(isDangerousBashPermission("sudo -u*")).toBe(true);
  });

  test("safe command 'git' returns false", () => {
    expect(isDangerousBashPermission("git")).toBe(false);
  });

  test("safe command 'ls' returns false", () => {
    expect(isDangerousBashPermission("ls")).toBe(false);
  });

  test("safe command 'cat' returns false", () => {
    expect(isDangerousBashPermission("cat")).toBe(false);
  });
});

describe("rule accessors", () => {
  beforeEach(() => {
    clearAllRules();
  });

  test("getAllowRules returns empty array initially", () => {
    expect(getAllowRules()).toEqual([]);
  });

  test("getDenyRules returns empty array initially", () => {
    expect(getDenyRules()).toEqual([]);
  });

  test("getAskRules returns empty array initially", () => {
    expect(getAskRules()).toEqual([]);
  });

  test("getAllowRules returns a copy (mutation does not affect internal state)", () => {
    const rule: PermissionRule = { tool: "Bash", source: "user" };
    addAllowRule(rule);
    const rules = getAllowRules();
    rules.push({ tool: "Read", source: "session" });
    expect(getAllowRules()).toHaveLength(1);
  });
});

describe("checkRuleBasedPermissions", () => {
  beforeEach(() => {
    clearAllRules();
  });

  test("returns {allowed:false} when no rules match", () => {
    const result = checkRuleBasedPermissions("Bash", { command: "ls" });
    expect(result.allowed).toBe(false);
  });

  test("deny rule matching returns {allowed:false}", () => {
    addDenyRule({ tool: "Bash", pattern: "rm*", source: "user" });
    const result = checkRuleBasedPermissions("Bash", { command: "rm -rf /" });
    expect(result.allowed).toBe(false);
    expect(result.rule).toBeDefined();
  });

  test("allow rule matching returns {allowed:true}", () => {
    addAllowRule({ tool: "Bash", pattern: "ls", source: "user" });
    const result = checkRuleBasedPermissions("Bash", { command: "ls" });
    expect(result.allowed).toBe(true);
    expect(result.rule).toBeDefined();
  });

  test("deny takes priority over allow", () => {
    addAllowRule({ tool: "Bash", source: "user" });
    addDenyRule({ tool: "Bash", source: "user" });
    const result = checkRuleBasedPermissions("Bash", { command: "ls" });
    expect(result.allowed).toBe(false);
  });
});

describe("hasPermissionsToUseTool", () => {
  beforeEach(() => {
    clearAllRules();
  });

  test("bypassPermissions mode returns {allowed:true}", () => {
    const result = hasPermissionsToUseTool("Bash", { command: "ls" }, "bypassPermissions");
    expect(result.allowed).toBe(true);
  });

  test("plan mode returns {allowed:false}", () => {
    const result = hasPermissionsToUseTool("Bash", { command: "ls" }, "plan");
    expect(result.allowed).toBe(false);
  });

  test("acceptEdits mode allows Write tool", () => {
    const result = hasPermissionsToUseTool("Write", { path: "file.ts" }, "acceptEdits");
    expect(result.allowed).toBe(true);
  });

  test("acceptEdits mode denies Bash tool", () => {
    const result = hasPermissionsToUseTool("Bash", { command: "ls" }, "acceptEdits");
    expect(result.allowed).toBe(false);
  });

  test("default mode returns {allowed:false}", () => {
    const result = hasPermissionsToUseTool("Bash", { command: "ls" }, "default");
    expect(result.allowed).toBe(false);
  });

  test("dontAsk mode returns {allowed:false}", () => {
    const result = hasPermissionsToUseTool("Bash", { command: "ls" }, "dontAsk");
    expect(result.allowed).toBe(false);
  });
});
