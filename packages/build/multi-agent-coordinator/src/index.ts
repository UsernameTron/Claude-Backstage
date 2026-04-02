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

// Detect whether the current session is running in coordinator mode
export function isCoordinatorMode(): boolean {
  // TODO: extract from coordinator/coordinatorMode.ts
  throw new Error("TODO: extract from coordinator/coordinatorMode.ts");
}

// Build the system prompt for a coordinator session
export function getCoordinatorSystemPrompt(
  config?: CoordinatorConfig,
): string {
  // TODO: extract from coordinator/coordinatorMode.ts
  throw new Error("TODO: extract from coordinator/coordinatorMode.ts");
}

// Build user context summarizing active agent tasks
export function getCoordinatorUserContext(
  tasks: AgentTask[],
): string {
  // TODO: extract from coordinator/coordinatorMode.ts
  throw new Error("TODO: extract from coordinator/coordinatorMode.ts");
}

// Dispatch a task to a sub-agent, optionally via MCP connection
export function dispatchTask(
  task: AgentTask,
  connection?: McpConnection,
): Promise<AgentTask> {
  // TODO: extract from coordinator/coordinatorMode.ts
  throw new Error("TODO: extract from coordinator/coordinatorMode.ts");
}
