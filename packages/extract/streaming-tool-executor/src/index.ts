/**
 * @claude-patterns/streaming-tool-executor
 *
 * Overlaps tool execution with streaming response to reduce latency.
 * Source: services/tools/StreamingToolExecutor.ts (530 LOC)
 * KB: Pattern 6 — Streaming Tool Execution
 * Tier: Extract P1
 */

export interface ToolResult {
  toolName: string;
  toolUseId: string;
  result: unknown;
  isError: boolean;
}

export interface ToolDefinition {
  name: string;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Streaming tool executor that overlaps tool execution with response streaming.
 *
 * Tools are added as they appear in the stream. Each tool execution runs
 * concurrently. Completed results are available immediately while remaining
 * tools continue executing.
 */
export class StreamingToolExecutor {
  private pendingTools: Map<
    string,
    { promise: Promise<ToolResult>; toolName: string }
  > = new Map();
  private completedResults: ToolResult[] = [];
  private toolDefinitions: Map<string, ToolDefinition> = new Map();

  /**
   * Add and start executing a tool. The tool runs concurrently with
   * stream processing and other tool executions.
   */
  addTool(
    toolUseId: string,
    toolName: string,
    input: Record<string, unknown>,
  ): void {
    const definition = this.toolDefinitions.get(toolName);

    // Create promise that resolves to ToolResult
    const promise = (async (): Promise<ToolResult> => {
      try {
        const result = definition
          ? await definition.execute(input)
          : { output: `Executed ${toolName}`, input };
        return {
          toolName,
          toolUseId,
          result,
          isError: false,
        };
      } catch (error) {
        return {
          toolName,
          toolUseId,
          result:
            error instanceof Error ? error.message : String(error),
          isError: true,
        };
      }
    })();

    // Attach completion handler to move result when done
    promise.then((result) => {
      this.completedResults.push(result);
      this.pendingTools.delete(toolUseId);
    });

    this.pendingTools.set(toolUseId, { promise, toolName });
  }

  /**
   * Returns results from already-resolved tool executions.
   * Returns a shallow copy.
   */
  getCompletedResults(): ToolResult[] {
    return [...this.completedResults];
  }

  /**
   * Awaits all pending tool executions and returns all results
   * (both previously completed and newly resolved).
   */
  async getRemainingResults(): Promise<ToolResult[]> {
    const pending = Array.from(this.pendingTools.values()).map(
      (entry) => entry.promise,
    );
    await Promise.all(pending);
    return [...this.completedResults];
  }

  /**
   * Returns accumulated context from completed tool results.
   * Concatenates result outputs into a context record keyed by toolUseId.
   */
  getUpdatedContext(): Record<string, unknown> {
    const context: Record<string, unknown> = {};
    for (const result of this.completedResults) {
      context[result.toolUseId] = result.result;
    }
    return context;
  }
}
