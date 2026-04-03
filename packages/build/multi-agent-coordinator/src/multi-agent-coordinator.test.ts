import { describe, expect, test } from "bun:test";
import {
  isCoordinatorMode,
  getCoordinatorSystemPrompt,
  getCoordinatorUserContext,
  dispatchTask,
  type CoordinatorConfig,
  type AgentTask,
  type CoordinatorNotification,
} from "./index";

describe("isCoordinatorMode", () => {
  test("returns false by default", () => {
    expect(isCoordinatorMode()).toBe(false);
  });

  test("returns boolean type", () => {
    expect(typeof isCoordinatorMode()).toBe("boolean");
  });
});

describe("getCoordinatorSystemPrompt", () => {
  test("returns non-empty string", () => {
    const prompt = getCoordinatorSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  test("contains coordinator keyword", () => {
    const prompt = getCoordinatorSystemPrompt();
    expect(prompt.toLowerCase()).toContain("coordinator");
  });

  test("uses config when provided", () => {
    const config: CoordinatorConfig = {
      maxConcurrentAgents: 5,
      taskTimeout: 30000,
    };
    const prompt = getCoordinatorSystemPrompt(config);
    expect(prompt.length).toBeGreaterThan(0);
  });
});

describe("getCoordinatorUserContext", () => {
  test("returns context string for empty tasks", () => {
    const context = getCoordinatorUserContext([]);
    expect(typeof context).toBe("string");
  });

  test("includes task descriptions", () => {
    const tasks: AgentTask[] = [
      { id: "t1", description: "Run tests", status: "running" },
      { id: "t2", description: "Lint code", status: "pending" },
    ];
    const context = getCoordinatorUserContext(tasks);
    expect(context).toContain("Run tests");
    expect(context).toContain("Lint code");
  });

  test("includes task status", () => {
    const tasks: AgentTask[] = [
      { id: "t1", description: "Task A", status: "complete" },
    ];
    const context = getCoordinatorUserContext(tasks);
    expect(context).toContain("complete");
  });
});

describe("dispatchTask", () => {
  test("resolves with updated task", async () => {
    const task: AgentTask = {
      id: "task-1",
      description: "Run analysis",
      status: "pending",
    };
    const result = await dispatchTask(task);
    expect(result).toBeDefined();
    expect(result.id).toBe("task-1");
  });

  test("returns completed status", async () => {
    const task: AgentTask = {
      id: "task-2",
      description: "Build module",
      status: "pending",
    };
    const result = await dispatchTask(task);
    expect(result.status).toBe("complete");
  });

  test("includes result on completion", async () => {
    const task: AgentTask = {
      id: "task-3",
      description: "Deploy service",
      status: "pending",
    };
    const result = await dispatchTask(task);
    expect(result.result).toBeDefined();
  });

  test("handles task with connection parameter", async () => {
    const task: AgentTask = {
      id: "task-4",
      description: "Proxy call",
      status: "pending",
    };
    const mockConnection = {
      serverName: "test-server",
      tools: [],
      resources: [],
      status: "connected" as const,
    };
    const result = await dispatchTask(task, mockConnection);
    expect(result.status).toBe("complete");
  });

  test("dispatches different task types", async () => {
    const tasks: AgentTask[] = [
      { id: "a", description: "Analysis", status: "pending" },
      { id: "b", description: "Generation", status: "pending" },
    ];
    const results = await Promise.all(tasks.map((t) => dispatchTask(t)));
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.status === "complete")).toBe(true);
  });
});
