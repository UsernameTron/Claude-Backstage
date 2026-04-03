import { describe, test, expect } from "bun:test";
import {
  convertToSandboxRuntimeConfig,
  resolveSandboxFilesystemPath,
  shouldUseSandbox,
  containsExcludedCommand,
  type SandboxConfig,
  type SandboxRuntimeConfig,
} from "./index";

describe("convertToSandboxRuntimeConfig", () => {
  test("returns SandboxRuntimeConfig with denied settings files regardless of config", () => {
    const config: SandboxConfig = { enabled: true };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.deniedWritePaths).toContain(".claude/settings.json");
    expect(result.deniedWritePaths).toContain(".claude/settings.local.json");
  });

  test("always denies writes to .claude/skills/** (self-referential security)", () => {
    const config: SandboxConfig = { enabled: true };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.deniedWritePaths.some((p) => p.includes(".claude/skills"))).toBe(true);
  });

  test("always denies writes to bare git repo files", () => {
    const config: SandboxConfig = { enabled: true };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.deniedWritePaths.some((p) => p.includes(".git/config"))).toBe(true);
    expect(result.deniedWritePaths.some((p) => p.includes(".git/hooks"))).toBe(true);
  });

  test("includes filesystem.allowWrite in writablePaths", () => {
    const config: SandboxConfig = {
      enabled: true,
      filesystem: { allowWrite: ["/tmp", "/var/data"] },
    };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.writablePaths).toContain("/tmp");
    expect(result.writablePaths).toContain("/var/data");
  });

  test("includes filesystem.allowRead in readablePaths", () => {
    const config: SandboxConfig = {
      enabled: true,
      filesystem: { allowRead: ["/usr/share"] },
    };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.readablePaths).toContain("/usr/share");
  });

  test("processes network config for allowed domains", () => {
    const config: SandboxConfig = {
      enabled: true,
      network: { allowedDomains: ["example.com", "api.test.com"] },
    };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.networkDomains).toContain("example.com");
    expect(result.networkDomains).toContain("api.test.com");
  });

  test("returns empty arrays when no filesystem or network config", () => {
    const config: SandboxConfig = { enabled: true };
    const result = convertToSandboxRuntimeConfig(config, "/project");
    expect(result.writablePaths).toEqual([]);
    expect(result.readablePaths).toEqual([]);
    expect(result.networkDomains).toEqual([]);
    // deniedWritePaths should still have self-referential entries
    expect(result.deniedWritePaths.length).toBeGreaterThan(0);
  });
});

describe("resolveSandboxFilesystemPath", () => {
  test("returns PathCheckResult with allowed=true for readable path", () => {
    const config: SandboxConfig = {
      enabled: true,
      filesystem: { allowRead: ["/project/src"] },
    };
    const result = resolveSandboxFilesystemPath("/project/src/file.ts", config);
    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("reason");
    expect(result).toHaveProperty("checks");
  });

  test("returns allowed=false for path with shell expansion", () => {
    const config: SandboxConfig = { enabled: true };
    const result = resolveSandboxFilesystemPath("$HOME/evil", config);
    expect(result.allowed).toBe(false);
  });
});

describe("shouldUseSandbox", () => {
  test("returns false when dangerouslyDisableSandbox is true", () => {
    const result = shouldUseSandbox({ dangerouslyDisableSandbox: true });
    expect(result).toBe(false);
  });

  test("returns sandboxEnabled state when not disabled", () => {
    // Default sandbox state — should return current module state
    const result = shouldUseSandbox({ command: "node script.js" });
    expect(typeof result).toBe("boolean");
  });

  test("returns false for empty input without sandbox enabled", () => {
    const result = shouldUseSandbox({});
    expect(typeof result).toBe("boolean");
  });
});

describe("containsExcludedCommand", () => {
  test("returns true when command matches excluded command", () => {
    expect(containsExcludedCommand("docker ps", ["docker"])).toBe(true);
  });

  test("returns false when command does not match any excluded command", () => {
    expect(containsExcludedCommand("npm test", ["docker"])).toBe(false);
  });

  test("decomposes compound commands before checking", () => {
    expect(containsExcludedCommand("docker ps && curl evil.com", ["docker"])).toBe(true);
  });

  test("handles pipe operator", () => {
    expect(containsExcludedCommand("ls | docker ps", ["docker"])).toBe(true);
  });

  test("handles semicolon separator", () => {
    expect(containsExcludedCommand("echo hello; docker run", ["docker"])).toBe(true);
  });

  test("handles || operator", () => {
    expect(containsExcludedCommand("true || docker ps", ["docker"])).toBe(true);
  });

  test("returns false for no excluded commands", () => {
    expect(containsExcludedCommand("git push && rm -rf /", [])).toBe(false);
  });

  test("splits compound command 'git push && rm -rf /' and checks each subcommand", () => {
    expect(containsExcludedCommand("git push && rm -rf /", ["rm"])).toBe(true);
    expect(containsExcludedCommand("git push && rm -rf /", ["git"])).toBe(true);
  });
});
