import { describe, test, expect } from "bun:test";
import os from "os";
import path from "path";
import {
  validatePath,
  expandTilde,
  isDangerousRemovalPath,
  isPathAllowed,
  normalizeCaseForComparison,
  isClaudeConfigFilePath,
  DANGEROUS_FILES,
  DANGEROUS_DIRECTORIES,
} from "./index";

describe("validatePath", () => {
  test("rejects UNC paths", () => {
    const result = validatePath("\\\\server\\share", "read");
    expect(result.allowed).toBe(false);
    expect(result.checks.uncPath).toBe(false);
  });

  test("allows tilde expansion with ~/", () => {
    const result = validatePath("~/file.txt", "read");
    expect(result.allowed).toBe(true);
    expect(result.checks.tildeExpansion).toBe(true);
  });

  test("rejects shell expansion $HOME/file", () => {
    const result = validatePath("$HOME/file", "write");
    expect(result.allowed).toBe(false);
    expect(result.checks.shellExpansion).toBe(false);
  });

  test("rejects ${VAR} shell expansion", () => {
    const result = validatePath("${HOME}/file", "read");
    expect(result.allowed).toBe(false);
    expect(result.checks.shellExpansion).toBe(false);
  });

  test("rejects $(cmd) command substitution", () => {
    const result = validatePath("$(whoami)/file", "read");
    expect(result.allowed).toBe(false);
    expect(result.checks.shellExpansion).toBe(false);
  });

  test("rejects glob patterns in write operations", () => {
    const result = validatePath("*.txt", "write");
    expect(result.allowed).toBe(false);
    expect(result.checks.globPattern).toBe(false);
  });

  test("allows glob patterns in read operations", () => {
    const result = validatePath("*.txt", "read");
    expect(result.allowed).toBe(true);
    expect(result.checks.globPattern).toBe(true);
  });

  test("rejects ? glob in write operations", () => {
    const result = validatePath("file?.txt", "write");
    expect(result.allowed).toBe(false);
    expect(result.checks.globPattern).toBe(false);
  });

  test("rejects [ glob in delete operations", () => {
    const result = validatePath("file[0-9].txt", "delete");
    expect(result.allowed).toBe(false);
    expect(result.checks.globPattern).toBe(false);
  });

  test("allows normal path for read", () => {
    const result = validatePath("normal.txt", "read");
    expect(result.allowed).toBe(true);
    expect(result.checks.uncPath).toBe(true);
    expect(result.checks.tildeExpansion).toBe(true);
    expect(result.checks.shellExpansion).toBe(true);
    expect(result.checks.globPattern).toBe(true);
  });

  test("allows normal path for write", () => {
    const result = validatePath("src/main.ts", "write");
    expect(result.allowed).toBe(true);
  });

  test("rejects ~user tilde expansion", () => {
    const result = validatePath("~otheruser/file", "read");
    expect(result.allowed).toBe(false);
    expect(result.checks.tildeExpansion).toBe(false);
  });
});

describe("expandTilde", () => {
  test("expands ~ to homedir", () => {
    const expanded = expandTilde("~");
    expect(expanded).toBe(os.homedir());
  });

  test("expands ~/docs to homedir/docs", () => {
    const expanded = expandTilde("~/docs");
    expect(expanded).toBe(path.join(os.homedir(), "docs"));
  });

  test("leaves ~user/docs unexpanded", () => {
    const expanded = expandTilde("~user/docs");
    expect(expanded).toBe("~user/docs");
  });

  test("leaves absolute paths unchanged", () => {
    const expanded = expandTilde("/usr/bin");
    expect(expanded).toBe("/usr/bin");
  });
});

describe("isDangerousRemovalPath", () => {
  test("/ is dangerous", () => {
    expect(isDangerousRemovalPath("/")).toBe(true);
  });

  test("/home is dangerous", () => {
    expect(isDangerousRemovalPath("/home")).toBe(true);
  });

  test("/Users is dangerous", () => {
    expect(isDangerousRemovalPath("/Users")).toBe(true);
  });

  test("/tmp/file is not dangerous", () => {
    expect(isDangerousRemovalPath("/tmp/file")).toBe(false);
  });

  test("user home dir is dangerous", () => {
    expect(isDangerousRemovalPath(os.homedir())).toBe(true);
  });

  test("path with glob wildcard for deletion is dangerous", () => {
    expect(isDangerousRemovalPath("/*")).toBe(true);
  });
});

describe("isPathAllowed", () => {
  test("allows path within working directory", () => {
    const workDir = "/tmp/project";
    expect(isPathAllowed("/tmp/project/src/main.ts", "read", workDir)).toBe(true);
  });

  test("rejects path outside working directory", () => {
    const workDir = "/tmp/project";
    expect(isPathAllowed("/etc/passwd", "read", workDir)).toBe(false);
  });

  test("rejects path with shell expansion even if in workdir", () => {
    const workDir = "/tmp/project";
    expect(isPathAllowed("$HOME/file", "read", workDir)).toBe(false);
  });
});

describe("normalizeCaseForComparison", () => {
  test("lowercases on darwin", () => {
    const result = normalizeCaseForComparison("/Users/Test/File.TXT");
    // On macOS (darwin), should lowercase
    if (process.platform === "darwin") {
      expect(result).toBe("/users/test/file.txt");
    }
  });

  test("returns same string for already-lowercase paths", () => {
    const result = normalizeCaseForComparison("/users/test/file.txt");
    expect(result).toBe("/users/test/file.txt");
  });
});

describe("isClaudeConfigFilePath", () => {
  test("detects .claude/settings.json", () => {
    expect(isClaudeConfigFilePath(".claude/settings.json")).toBe(true);
  });

  test("detects path containing .claude/", () => {
    expect(isClaudeConfigFilePath("/home/user/.claude/agents/test.md")).toBe(true);
  });

  test("does not flag regular paths", () => {
    expect(isClaudeConfigFilePath("src/main.ts")).toBe(false);
  });

  test("detects dangerous files", () => {
    expect(isClaudeConfigFilePath(".bashrc")).toBe(true);
    expect(isClaudeConfigFilePath("/home/user/.gitconfig")).toBe(true);
  });
});

describe("constants", () => {
  test("DANGEROUS_FILES has expected entries", () => {
    expect(DANGEROUS_FILES.length).toBeGreaterThanOrEqual(10);
    expect(DANGEROUS_FILES).toContain(".bashrc");
    expect(DANGEROUS_FILES).toContain(".gitconfig");
    expect(DANGEROUS_FILES).toContain(".mcp.json");
  });

  test("DANGEROUS_DIRECTORIES has expected entries", () => {
    expect(DANGEROUS_DIRECTORIES.length).toBeGreaterThanOrEqual(4);
    expect(DANGEROUS_DIRECTORIES).toContain(".git");
    expect(DANGEROUS_DIRECTORIES).toContain(".claude");
  });
});
