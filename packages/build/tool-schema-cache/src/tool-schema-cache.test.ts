import { describe, test, expect, beforeEach } from "bun:test";
import { ToolSchemaCache } from "./index";
import type { Tool, CachedToolSchema } from "./index";

describe("ToolSchemaCache", () => {
  let cache: ToolSchemaCache;

  beforeEach(() => {
    cache = new ToolSchemaCache();
  });

  test("get returns undefined for unknown tool", () => {
    expect(cache.get("unknown")).toBeUndefined();
  });

  test("set then get returns the cached schema", () => {
    const schema: CachedToolSchema = {
      name: "toolA",
      description: "desc",
      inputSchema: { type: "object" },
      cachedAt: Date.now(),
    };
    cache.set("toolA", schema);
    expect(cache.get("toolA")).toEqual(schema);
  });

  test("refresh populates cache with cachedAt timestamps", () => {
    const tools: Tool[] = [
      { name: "tool1", description: "d1", inputSchema: {} },
      { name: "tool2", description: "d2", inputSchema: { x: 1 } },
    ];
    const before = Date.now();
    cache.refresh(tools);
    const after = Date.now();

    const t1 = cache.get("tool1");
    const t2 = cache.get("tool2");
    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
    expect(t1!.cachedAt).toBeGreaterThanOrEqual(before);
    expect(t1!.cachedAt).toBeLessThanOrEqual(after);
    expect(t2!.name).toBe("tool2");
  });

  test("invalidate clears all cached schemas", () => {
    cache.set("toolA", {
      name: "toolA",
      description: "d",
      inputSchema: {},
      cachedAt: 1,
    });
    cache.invalidate();
    expect(cache.get("toolA")).toBeUndefined();
  });

  test("getStableSchemaList returns schemas sorted by name", () => {
    cache.set("zebra", {
      name: "zebra",
      description: "z",
      inputSchema: {},
      cachedAt: 1,
    });
    cache.set("alpha", {
      name: "alpha",
      description: "a",
      inputSchema: {},
      cachedAt: 2,
    });
    cache.set("mid", {
      name: "mid",
      description: "m",
      inputSchema: {},
      cachedAt: 3,
    });

    const list = cache.getStableSchemaList();
    expect(list.map((s) => s.name)).toEqual(["alpha", "mid", "zebra"]);
  });

  test("refresh replaces previously cached schemas", () => {
    cache.set("old", {
      name: "old",
      description: "d",
      inputSchema: {},
      cachedAt: 1,
    });
    cache.refresh([{ name: "new", description: "d", inputSchema: {} }]);
    expect(cache.get("old")).toBeUndefined();
    expect(cache.get("new")).toBeDefined();
  });
});
