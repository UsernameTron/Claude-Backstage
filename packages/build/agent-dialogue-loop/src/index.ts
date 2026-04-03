/**
 * @claude-patterns/agent-dialogue-loop
 *
 * Core query engine: streaming dialogue with tool execution, state management, and token tracking.
 * Source: query.ts + QueryEngine.ts (3,024 LOC)
 * KB: Section 19 — Agent Dialogue Loop
 * Tier: Build P1
 */

import type { ToolResult, ToolDefinition } from "@claude-patterns/streaming-tool-executor";
import { StreamingToolExecutor } from "@claude-patterns/streaming-tool-executor";
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
  private config: QueryEngineConfig;
  private executor: StreamingToolExecutor | null = null;

  constructor(config: QueryEngineConfig) {
    this.config = config;
    if (config.tools && config.tools.length > 0) {
      this.executor = new StreamingToolExecutor();
    }
  }

  async *ask(params: QueryParams): AsyncGenerator<StreamEvent, QueryResult> {
    const accumulatedMessages: Message[] = [...params.messages];
    const allToolResults: ToolResult[] = [];
    const tokenUsage: TokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadInputTokens: 0,
      cacheCreationInputTokens: 0,
    };

    // Simulate text response
    const responseContent = `Response to: ${
      typeof params.messages[params.messages.length - 1]?.content === "string"
        ? params.messages[params.messages.length - 1].content
        : "query"
    }`;

    yield { type: "text", content: responseContent };

    // Estimate token usage
    tokenUsage.inputTokens = Math.ceil(
      JSON.stringify(params.messages).length / 4,
    );
    tokenUsage.outputTokens = Math.ceil(responseContent.length / 4);

    if (params.onTokenUsage) {
      params.onTokenUsage(tokenUsage);
    }

    // If tools configured, simulate tool use
    if (this.config.tools && this.config.tools.length > 0 && this.executor) {
      const tool = this.config.tools[0];
      const toolInput: Record<string, unknown> = { query: "auto" };
      const toolUseId = `tool_${Date.now()}`;

      yield { type: "tool_use", toolName: tool.name, input: toolInput };

      // Execute via streaming tool executor
      this.executor.addTool(toolUseId, tool.name, toolInput);
      const results = await this.executor.getRemainingResults();

      for (const result of results) {
        allToolResults.push(result);
        yield { type: "tool_result", result };
      }
    }

    // Add assistant message
    accumulatedMessages.push({
      role: "assistant",
      content: responseContent,
    });

    yield { type: "done" };

    return {
      messages: accumulatedMessages,
      tokenUsage,
      toolResults: allToolResults,
    };
  }
}

// Standalone ask function — convenience wrapper around QueryEngine
export async function* ask(
  config: QueryEngineConfig,
  params: QueryParams,
): AsyncGenerator<StreamEvent, QueryResult> {
  const engine = new QueryEngine(config);
  return yield* engine.ask(params);
}
