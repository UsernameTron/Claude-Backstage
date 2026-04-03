import { describe, expect, test } from "bun:test";
import { QueryEngine, ask } from "./index";
import type {
  QueryEngineConfig,
  QueryParams,
  StreamEvent,
  QueryResult,
} from "./index";
import type { Message } from "@claude-patterns/token-estimation";

const baseConfig: QueryEngineConfig = {
  model: "test-model",
  systemPrompt: "You are a test assistant",
};

const baseParams: QueryParams = {
  messages: [{ role: "user", content: "Hello" }],
};

describe("agent-dialogue-loop", () => {
  describe("QueryEngine", () => {
    test("constructor accepts config", () => {
      const engine = new QueryEngine(baseConfig);
      expect(engine).toBeDefined();
    });

    test("ask() yields text StreamEvent", async () => {
      const engine = new QueryEngine(baseConfig);
      const gen = engine.ask(baseParams);
      const first = await gen.next();
      expect(first.done).toBe(false);
      const event = first.value as StreamEvent;
      expect(event.type).toBe("text");
      if (event.type === "text") {
        expect(typeof event.content).toBe("string");
      }
    });

    test("ask() yields done as final event", async () => {
      const engine = new QueryEngine(baseConfig);
      const gen = engine.ask(baseParams);
      const events: StreamEvent[] = [];
      let result: QueryResult | undefined;

      while (true) {
        const next = await gen.next();
        if (next.done) {
          result = next.value;
          break;
        }
        events.push(next.value);
      }

      const lastEvent = events[events.length - 1];
      expect(lastEvent.type).toBe("done");
      expect(result).toBeDefined();
    });

    test("ask() with tools yields tool_use then tool_result", async () => {
      const configWithTools: QueryEngineConfig = {
        ...baseConfig,
        tools: [
          {
            name: "test_tool",
            execute: async (input) => ({ output: "tool result", input }),
          },
        ],
      };
      const engine = new QueryEngine(configWithTools);
      const gen = engine.ask(baseParams);
      const events: StreamEvent[] = [];

      while (true) {
        const next = await gen.next();
        if (next.done) break;
        events.push(next.value);
      }

      const types = events.map((e) => e.type);
      expect(types).toContain("tool_use");
      expect(types).toContain("tool_result");
    });

    test("ask() return value is QueryResult with messages array", async () => {
      const engine = new QueryEngine(baseConfig);
      const gen = engine.ask(baseParams);
      let result: QueryResult | undefined;

      while (true) {
        const next = await gen.next();
        if (next.done) {
          result = next.value;
          break;
        }
      }

      expect(result).toBeDefined();
      expect(result!.messages).toBeInstanceOf(Array);
      expect(result!.messages.length).toBeGreaterThan(0);
      expect(result!.tokenUsage).toBeDefined();
      expect(result!.toolResults).toBeInstanceOf(Array);
    });
  });

  describe("StreamEvent types", () => {
    test("are correctly discriminated", async () => {
      const engine = new QueryEngine(baseConfig);
      const gen = engine.ask(baseParams);
      const events: StreamEvent[] = [];

      while (true) {
        const next = await gen.next();
        if (next.done) break;
        events.push(next.value);
      }

      for (const event of events) {
        switch (event.type) {
          case "text":
            expect(typeof event.content).toBe("string");
            break;
          case "tool_use":
            expect(typeof event.toolName).toBe("string");
            break;
          case "tool_result":
            expect(event.result).toBeDefined();
            break;
          case "error":
            expect(event.error).toBeInstanceOf(Error);
            break;
          case "done":
            // No additional fields
            break;
        }
      }
    });
  });

  describe("standalone ask()", () => {
    test("delegates to QueryEngine", async () => {
      const gen = ask(baseConfig, baseParams);
      const events: StreamEvent[] = [];
      let result: QueryResult | undefined;

      while (true) {
        const next = await gen.next();
        if (next.done) {
          result = next.value;
          break;
        }
        events.push(next.value);
      }

      expect(events.length).toBeGreaterThan(0);
      expect(result).toBeDefined();
      expect(result!.messages).toBeInstanceOf(Array);
    });
  });
});
