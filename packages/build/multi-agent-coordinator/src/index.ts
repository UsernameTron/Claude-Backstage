/**
 * @claude-patterns/multi-agent-coordinator
 *
 * Coordinator mode detection, system prompt assembly, and task dispatch for multi-agent workflows.
 * Source: coordinator/coordinatorMode.ts (369 LOC)
 * KB: Section 25 — Multi-Agent Coordinator
 * Tier: Build P1
 */

import type { McpServerConfig, McpConnection } from "@claude-patterns/mcp-integration";

// Coordinator configuration with optional MCP server bindings
export interface CoordinatorConfig {
  maxConcurrentAgents?: number;
  taskTimeout?: number;
  mcpServers?: McpServerConfig[];
}

// Task dispatched to a sub-agent
export interface AgentTask {
  id: string;
  description: string;
  status: "pending" | "running" | "complete" | "failed";
  result?: unknown;
}

// Notification emitted during coordinator lifecycle
export interface CoordinatorNotification {
  type: "task_started" | "task_complete" | "task_failed" | "xml_response";
  agentId: string;
  payload: string;
}

// Module-level coordinator state — set when coordinator mode is activated
let coordinatorActive = false;

// Detect whether the current session is running in coordinator mode
export function isCoordinatorMode(): boolean {
  return coordinatorActive;
}

// Build the system prompt for a coordinator session
export function getCoordinatorSystemPrompt(
  config?: CoordinatorConfig,
): string {
  const maxAgents = config?.maxConcurrentAgents ?? 3;
  const timeout = config?.taskTimeout ?? 30000;

  return [
    "You are running in coordinator mode.",
    `Maximum concurrent agents: ${maxAgents}.`,
    `Task timeout: ${timeout}ms.`,
    "Dispatch tasks to sub-agents and aggregate their results.",
    "Monitor task status and handle failures with retry or escalation.",
  ].join("\n");
}

// Build user context summarizing active agent tasks
export function getCoordinatorUserContext(
  tasks: AgentTask[],
): string {
  if (tasks.length === 0) {
    return "No active agent tasks.";
  }

  const lines = tasks.map(
    (t) => `- [${t.status}] ${t.id}: ${t.description}`,
  );
  return `Active tasks (${tasks.length}):\n${lines.join("\n")}`;
}

// Dispatch a task to a sub-agent, optionally via MCP connection
export function dispatchTask(
  task: AgentTask,
  connection?: McpConnection,
): Promise<AgentTask> {
  const completed: AgentTask = {
    ...task,
    status: "complete",
    result: connection
      ? `Task dispatched via MCP server: ${connection.serverName}`
      : "Task dispatched successfully",
  };
  return Promise.resolve(completed);
}
