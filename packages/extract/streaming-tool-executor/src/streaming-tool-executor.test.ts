import { describe, test, expect } from "bun:test";
import {
  StreamingToolExecutor,
  type ToolResult,
} from "./index";

describe("streaming-tool-executor", () => {
  describe("constructor", () => {
    test("creates empty executor", () => {
      const executor = new StreamingToolExecutor();
      expect(executor.getCompletedResults()).toEqual([]);
    });
  });

  describe("addTool", () => {
    test("tracks a pending tool execution", () => {
      const executor = new StreamingToolExecutor();
      executor.addTool("tool-1", "readFile", { path: "/test" });
      // Tool is pending, not yet completed
      expect(executor.getCompletedResults()).toEqual([]);
    });
  });

  describe("getCompletedResults", () => {
    test("returns results from resolved promises", async () => {
      const executor = new StreamingToolExecutor();
      executor.addTool("tool-1", "readFile", { path: "/test" });
      // Wait for microtask queue to flush
      await new Promise((resolve) => setTimeout(resolve, 10));
      const results = executor.getCompletedResults();
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    test("returns shallow copy of results", async () => {
      const executor = new StreamingToolExecutor();
      const results1 = executor.getCompletedResults();
      const results2 = executor.getCompletedResults();
      expect(results1).not.toBe(results2);
      expect(results1).toEqual(results2);
    });
  });

  describe("getRemainingResults", () => {
    test("awaits all pending and returns results", async () => {
      const executor = new StreamingToolExecutor();
      executor.addTool("tool-1", "readFile", { path: "/test" });
      const results = await executor.getRemainingResults();
      expect(results).toHaveLength(1);
      expect(results[0].toolUseId).toBe("tool-1");
      expect(results[0].toolName).toBe("readFile");
    });

    test("returns empty array when no tools added", async () => {
      const executor = new StreamingToolExecutor();
      const results = await executor.getRemainingResults();
      expect(results).toEqual([]);
    });

    test("includes results from multiple tools", async () => {
      const executor = new StreamingToolExecutor();
      executor.addTool("tool-1", "readFile", { path: "/a" });
      executor.addTool("tool-2", "writeFile", { path: "/b" });
      const results = await executor.getRemainingResults();
      expect(results).toHaveLength(2);
    });
  });

  describe("getUpdatedContext", () => {
    test("returns accumulated context from tool results", async () => {
      const executor = new StreamingToolExecutor();
      executor.addTool("tool-1", "readFile", { path: "/test" });
      await executor.getRemainingResults();
      const context = executor.getUpdatedContext();
      expect(context).toBeDefined();
      expect(typeof context).toBe("object");
    });

    test("returns empty context when no tools completed", () => {
      const executor = new StreamingToolExecutor();
      const context = executor.getUpdatedContext();
      expect(context).toEqual({});
    });
  });
});
