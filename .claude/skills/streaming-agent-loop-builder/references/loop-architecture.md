# Agent Loop Architecture Specification

Complete flow diagram and implementation details for the streaming agent dialogue loop.

## Loop Flow (Detailed)

```
1. User Input received
    │
2. query(params: QueryParams) called
    │
3. Build system prompt
    ├── Static sections (cached)
    ├── SYSTEM_PROMPT_DYNAMIC_BOUNDARY marker
    ├── Dynamic sections (per-turn)
    └── System context appended at END (recency bias)
    │
4. Normalize messages
    ├── User context prepended as FIRST user message
    ├── Previous messages (with compact boundaries)
    └── Current user input
    │
5. Token budget check
    ├── If over threshold → auto-compact first
    └── If within budget → proceed
    │
6. API Call (streaming)
    ├── Stream opens
    ├── For each streamed chunk:
    │   ├── Text chunk → buffer for display
    │   └── tool_use block complete → StreamingToolExecutor.addTool()
    │       └── Execution begins IMMEDIATELY (not queued)
    │
7. Stream completes
    ├── Collect completed tool results (StreamingToolExecutor.getCompletedResults())
    ├── Await remaining results (StreamingToolExecutor.getRemainingResults())
    └── Merge all results
    │
8. Response analysis
    ├── No tool calls → Return text response to user
    └── Has tool calls → For each tool result:
        ├── Add tool_result message to history
        ├── Check budget (cost + tokens)
        ├── Check max turns
        └── Continue loop (go to step 3)
    │
9. Session cleanup
    ├── Persist costs
    ├── Record transcript
    └── Return final QueryResult
```

## StreamingToolExecutor Implementation

```typescript
class StreamingToolExecutor {
    private tools: Map<string, ToolDefinition>;
    private pending: Map<string, Promise<ToolResult>>;
    private completed: ToolResult[];

    constructor(toolRegistry: ToolDefinition[]) {
        this.tools = new Map(toolRegistry.map(t => [t.name, t]));
        this.pending = new Map();
        this.completed = [];
    }

    /**
     * Called as soon as a tool_use block finishes streaming.
     * Begins execution immediately — does NOT wait for the full response.
     */
    addTool(toolUseId: string, toolName: string, input: Record<string, unknown>): void {
        const tool = this.tools.get(toolName);
        if (!tool) {
            this.completed.push({
                toolName, toolUseId,
                result: `Unknown tool: ${toolName}`,
                isError: true,
            });
            return;
        }

        const promise = tool.execute(input)
            .then(result => {
                const toolResult: ToolResult = { toolName, toolUseId, result, isError: false };
                this.completed.push(toolResult);
                this.pending.delete(toolUseId);
                return toolResult;
            })
            .catch(error => {
                const toolResult: ToolResult = {
                    toolName, toolUseId,
                    result: error.message,
                    isError: true,
                };
                this.completed.push(toolResult);
                this.pending.delete(toolUseId);
                return toolResult;
            });

        this.pending.set(toolUseId, promise);
    }

    /**
     * Returns results for tools that already completed during streaming.
     * Non-blocking — returns immediately.
     */
    getCompletedResults(): ToolResult[] {
        return [...this.completed];
    }

    /**
     * Awaits all pending tool executions and returns their results.
     * Called after the stream finishes.
     */
    async getRemainingResults(): Promise<ToolResult[]> {
        await Promise.all(this.pending.values());
        return [...this.completed];
    }
}
```

## QueryParams Contract

```typescript
interface QueryParams {
    messages: Message[];
    systemPrompt: SystemPrompt;
    userContext: Record<string, string>;
    systemContext: Record<string, string>;
    canUseTool: CanUseToolFn;
    toolUseContext: ToolUseContext;
    fallbackModel?: string;
    querySource: QuerySource;
    maxTurns?: number;
    taskBudget?: { total: number };
}
```

## QueryResult Contract

```typescript
interface QueryResult {
    messages: Message[];
    tokenUsage: {
        inputTokens: number;
        outputTokens: number;
        cacheReadInputTokens: number;
        cacheCreationInputTokens: number;
    };
    toolResults: ToolResult[];
    costUSD: number;
    turnsUsed: number;
}
```

## Context Injection Positions

Two positions, used intentionally for different attention effects:

### System Prompt End (Recency Bias)
Content placed at the END of the system prompt receives higher attention weight during
generation. Use for context that should influence individual decisions:
- Git status / current environment
- Active feature flags
- Current user preferences
- Session-specific constraints

### First User Message (Conversational Framing)
Content placed as the FIRST user message sets the conversational frame. Use for context
that should influence the entire conversation:
- Project rules (CLAUDE.md)
- Coding standards
- Persona instructions
- Date/time context

Wrap first-user-message context in `<system-reminder>` tags.

## Abort and Cancellation

The QueryEngine propagates an AbortController through all layers:

```typescript
class QueryEngine {
    private abortController: AbortController;

    async *ask(params: QueryParams): AsyncGenerator<StreamEvent, QueryResult> {
        const signal = this.abortController.signal;

        // Pass signal to API call
        const stream = await apiCall(params, { signal });

        // Pass signal to tool execution
        for (const toolCall of toolCalls) {
            if (signal.aborted) break;
            executor.addTool(toolCall.id, toolCall.name, toolCall.input);
        }
    }

    abort(): void {
        this.abortController.abort();
    }
}
```

Every layer checks the signal before proceeding. This prevents zombie tool executions
after the user cancels.

## Tool Ordering for Cache Stability

When sending tools to the API:

```typescript
function assembleToolPool(builtInTools, mcpTools): ToolDefinition[] {
    // Built-in tools sorted as contiguous prefix
    const sorted = [...builtInTools].sort(byName);
    // MCP/dynamic tools appended AFTER
    const dynamic = mcpTools.sort(byName);
    // Deduplicate (built-in wins on name collision)
    return uniqBy([...sorted, ...dynamic], 'name');
}
```

This ensures the static portion of the tool list is always identical across requests,
maximizing prompt cache hits even when MCP tools change.
