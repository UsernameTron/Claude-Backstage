import { describe, test, expect } from "bun:test";
import { subprocessEnv, GHA_SUBPROCESS_SCRUB } from "./index";

describe("subprocess-env-scrubbing", () => {
  test("GHA_SUBPROCESS_SCRUB has exactly 16 entries", () => {
    expect(GHA_SUBPROCESS_SCRUB.length).toBe(16);
  });

  test("subprocessEnv returns an object (not undefined)", () => {
    const env = subprocessEnv();
    expect(typeof env).toBe("object");
    expect(env).not.toBeNull();
  });

  test("subprocessEnv removes scrubbed keys from result", () => {
    // Temporarily set a scrubbed key
    const originalVal = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "test-secret";

    const env = subprocessEnv();
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();

    // Restore
    if (originalVal !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalVal;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  test("subprocessEnv preserves non-scrubbed keys like PATH and HOME", () => {
    const env = subprocessEnv();
    // PATH and HOME should always exist on any system
    expect(env.PATH).toBeDefined();
    expect(env.HOME).toBeDefined();
  });

  test("subprocessEnv preserves GITHUB_TOKEN (intentionally not scrubbed)", () => {
    const originalVal = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "gh-token-test";

    const env = subprocessEnv();
    expect(env.GITHUB_TOKEN).toBe("gh-token-test");

    // Restore
    if (originalVal !== undefined) {
      process.env.GITHUB_TOKEN = originalVal;
    } else {
      delete process.env.GITHUB_TOKEN;
    }
  });

  test("subprocessEnv does not mutate process.env", () => {
    const originalVal = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "should-survive";

    subprocessEnv();
    expect(process.env.ANTHROPIC_API_KEY).toBe("should-survive");

    // Restore
    if (originalVal !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalVal;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });
});
