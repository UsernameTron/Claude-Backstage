/**
 * @claude-patterns/agent-dialogue-loop
 *
 * Core query engine: streaming dialogue with tool execution, state management, and token tracking.
 * Source: query.ts + QueryEngine.ts (3,024 LOC)
 * KB: Section 19 — Agent Dialogue Loop
 * Tier: Build P1
 */

import type { ToolResult, ToolDefinition } from "@claude-patterns/streaming-tool-executor";
import type { Store } from "@claude-patterns/state-store";
import type { Message, TokenUsage } from "@claude-patterns/token-estimation";

// Configuration for the query engine
export interface QueryEngineConfig {
  model: string;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: ToolDefinition[];
  store?: Store<unknown>;
}

// Parameters for a single query invocation
export interface QueryParams {
  messages: Message[];
  signal?: AbortSignal;
  onTokenUsage?: (usage: TokenUsage) => void;
}

// Events emitted during streaming dialogue
export type StreamEvent =
  | { type: "text"; content: string }
  | { type: "tool_use"; toolName: string; input: Record<string, unknown> }
  | { type: "tool_result"; result: ToolResult }
  | { type: "error"; error: Error }
  | { type: "done" };

// Result returned when the dialogue loop completes
export interface QueryResult {
  messages: Message[];
  tokenUsage: TokenUsage;
  toolResults: ToolResult[];
}

// Query engine — manages streaming dialogue with tool execution
export class QueryEngine {
  constructor(_config: QueryEngineConfig) {
    // TODO: extract from query.ts + QueryEngine.ts
  }

  async *ask(
    _params: QueryParams,
  ): AsyncGenerator<StreamEvent, QueryResult> {
    // TODO: extract from query.ts + QueryEngine.ts
    throw new Error("TODO: extract from query.ts + QueryEngine.ts");
  }
}

// Standalone ask function — convenience wrapper around QueryEngine
export async function* ask(
  _config: QueryEngineConfig,
  _params: QueryParams,
): AsyncGenerator<StreamEvent, QueryResult> {
  // TODO: extract from query.ts + QueryEngine.ts
  throw new Error("TODO: extract from query.ts + QueryEngine.ts");
}
