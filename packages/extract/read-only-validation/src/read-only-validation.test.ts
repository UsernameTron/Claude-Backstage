import { describe, test, expect } from "bun:test";
import {
  checkReadOnlyConstraints,
  parseCommand,
  GIT_READ_ONLY_COMMANDS,
  GH_READ_ONLY_COMMANDS,
} from "./index";

describe("parseCommand", () => {
  test("splits simple command into executable and args", () => {
    const result = parseCommand("git log --oneline -n 5");
    expect(result.executable).toBe("git");
    expect(result.args).toEqual(["log", "--oneline", "-n", "5"]);
  });

  test("handles single-word command", () => {
    const result = parseCommand("ls");
    expect(result.executable).toBe("ls");
    expect(result.args).toEqual([]);
  });

  test("handles extra whitespace", () => {
    const result = parseCommand("  git   status  --short  ");
    expect(result.executable).toBe("git");
    expect(result.args).toEqual(["status", "--short"]);
  });
});

describe("checkReadOnlyConstraints", () => {
  // Git read-only commands
  test("allows git status --short", () => {
    expect(checkReadOnlyConstraints("git status --short")).toBe(true);
  });

  test("allows git log --oneline", () => {
    expect(checkReadOnlyConstraints("git log --oneline")).toBe(true);
  });

  test("allows git diff --stat", () => {
    expect(checkReadOnlyConstraints("git diff --stat")).toBe(true);
  });

  test("allows git branch --all", () => {
    expect(checkReadOnlyConstraints("git branch --all")).toBe(true);
  });

  // Git write commands rejected
  test("rejects git push origin main", () => {
    expect(checkReadOnlyConstraints("git push origin main")).toBe(false);
  });

  test("rejects git commit -m message", () => {
    expect(checkReadOnlyConstraints("git commit -m test")).toBe(false);
  });

  test("rejects git checkout -b branch", () => {
    expect(checkReadOnlyConstraints("git checkout -b branch")).toBe(false);
  });

  // gh read-only commands
  test("allows gh pr list", () => {
    expect(checkReadOnlyConstraints("gh pr list")).toBe(true);
  });

  test("allows gh issue view", () => {
    expect(checkReadOnlyConstraints("gh issue view")).toBe(true);
  });

  test("allows gh pr status", () => {
    expect(checkReadOnlyConstraints("gh pr status")).toBe(true);
  });

  // gh write commands rejected
  test("rejects gh pr merge 123", () => {
    expect(checkReadOnlyConstraints("gh pr merge 123")).toBe(false);
  });

  test("rejects gh issue create", () => {
    expect(checkReadOnlyConstraints("gh issue create")).toBe(false);
  });

  // System read-only commands
  test("allows cat file.txt", () => {
    expect(checkReadOnlyConstraints("cat file.txt")).toBe(true);
  });

  test("allows ls -la", () => {
    expect(checkReadOnlyConstraints("ls -la")).toBe(true);
  });

  // Unknown commands rejected
  test("rejects unknown commands like rm -rf", () => {
    expect(checkReadOnlyConstraints("rm -rf /")).toBe(false);
  });

  test("rejects curl commands", () => {
    expect(checkReadOnlyConstraints("curl http://example.com")).toBe(false);
  });
});

describe("constants", () => {
  test("GIT_READ_ONLY_COMMANDS has 8 entries", () => {
    expect(Object.keys(GIT_READ_ONLY_COMMANDS).length).toBe(8);
  });

  test("GH_READ_ONLY_COMMANDS has 10 entries", () => {
    expect(GH_READ_ONLY_COMMANDS.length).toBe(10);
  });
});
