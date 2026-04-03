import { describe, test, expect, beforeEach } from "bun:test";
import {
  registerTool,
  getAllTools,
  filterToolsByDenyRules,
  sortForCacheStability,
  assembleToolPool,
  resetRegistry,
} from "./index";
import type { Tool } from "./index";

function makeTool(name: string): Tool {
  return {
    name,
    description: `desc-${name}`,
    inputSchema: {},
    call: async () => null,
    permissions: [],
  };
}

describe("tool-registry", () => {
  beforeEach(() => {
    resetRegistry();
  });

  test("getAllTools returns empty array initially", () => {
    expect(getAllTools()).toEqual([]);
  });

  test("registerTool adds to registry, getAllTools retrieves it", () => {
    const tool = makeTool("myTool");
    registerTool(tool);
    const all = getAllTools();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("myTool");
  });

  test("filterToolsByDenyRules removes denied tools", () => {
    const toolA = makeTool("toolA");
    const toolB = makeTool("toolB");
    const result = filterToolsByDenyRules([toolA, toolB], ["toolA"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("toolB");
  });

  test("filterToolsByDenyRules with empty deny list returns all", () => {
    const toolA = makeTool("toolA");
    const result = filterToolsByDenyRules([toolA], []);
    expect(result).toHaveLength(1);
  });

  test("sortForCacheStability sorts alphabetically by name", () => {
    const toolB = makeTool("toolB");
    const toolA = makeTool("toolA");
    const sorted = sortForCacheStability([toolB, toolA]);
    expect(sorted.map((t) => t.name)).toEqual(["toolA", "toolB"]);
  });

  test("assembleToolPool merges, filters, and provides getByName and filter", () => {
    const builtIn = [makeTool("read"), makeTool("write")];
    const external = [makeTool("mcp_github"), makeTool("banned")];
    const pool = assembleToolPool(builtIn, external, ["banned"]);

    expect(pool.tools).toHaveLength(3);
    expect(pool.getByName("read")).toBeDefined();
    expect(pool.getByName("banned")).toBeUndefined();
    expect(pool.filter((t) => t.name.startsWith("mcp")).length).toBe(1);
  });

  test("assembleToolPool returns tools sorted for cache stability", () => {
    const pool = assembleToolPool(
      [makeTool("zebra")],
      [makeTool("alpha")],
      [],
    );
    expect(pool.tools.map((t) => t.name)).toEqual(["alpha", "zebra"]);
  });
});
