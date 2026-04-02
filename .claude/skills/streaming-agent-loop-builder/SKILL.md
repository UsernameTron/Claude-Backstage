---
name: streaming-agent-loop-builder
description: >
  Scaffold a complete agent dialogue loop with streaming tool execution, token recovery,
  and budget controls using patterns from Claude Code's production architecture. This skill
  should be used when the user asks to "build an agent loop", "scaffold an agent",
  "create a dialogue loop", "streaming agent loop", "agent loop builder", "build an LLM
  agent", "scaffold tool execution", or needs to implement a query engine, streaming tool
  executor, or token management system for any AI agent application.
version: 0.1.0
---

# Streaming Agent Loop Builder

Scaffold a production-grade agent dialogue loop that outperforms standard agent
frameworks through streaming tool execution, hybrid token management, and four-strategy
token recovery. Derived from Claude Code's query.ts + QueryEngine.ts (3,024 LOC).

## Why This Matters

Most agent frameworks (LangChain, CrewAI, AutoGen) use a wait-for-complete pattern:
the full API response must finish streaming before any tool execution begins. Claude
Code's streaming pattern begins executing tools as each tool_use block streams in,
overlapping execution with continued model output. This single architectural decision
is the primary reason Claude Code feels faster than competing tools.

## Scaffolding Process

### Step 1: Gather Requirements

Determine the agent's operating parameters:
- What LLM provider/API? (Anthropic, OpenAI, local model)
- What tools does the agent need?
- Interactive (REPL) or headless (pipeline) mode?
- Budget constraints? (dollar ceiling, token budget, max turns)
- Target language? (TypeScript or Python)

### Step 2: Generate QueryEngine Configuration

Produce the configuration contract — this is the agent's initialization interface:

```typescript
interface QueryEngineConfig {
    // Required
    model: string;
    tools: ToolDefinition[];
    canUseTool: (toolName: string, input: unknown) => PermissionResult;

    // State management
    getAppState: () => AppState;
    setAppState: (updater: (prev: AppState) => AppState) => void;

    // Budget (first-class, not bolted on)
    maxBudgetUsd?: number;
    taskBudget?: { total: number };
    maxTurns?: number;

    // Context
    systemPrompt?: string;
    appendSystemPrompt?: string;
    initialMessages?: Message[];

    // Extensions
    mcpClients?: McpConnection[];
    agents?: AgentDefinition[];
}
```

Key design decision: budget is a constructor parameter, not a runtime check.

### Step 3: Generate the Streaming Tool Executor

The core performance differentiator. Generate a StreamingToolExecutor that:

1. Accepts tool_use blocks as they stream in (not after response completes)
2. Begins execution immediately on each block
3. Collects results asynchronously
4. Returns completed results for blocks that finished during streaming
5. Awaits remaining results after stream completes

See `references/loop-architecture.md` for the complete flow diagram and implementation
specification.

### Step 4: Generate Token Recovery Strategies

Implement four recovery strategies (not all may apply to every agent):

| Strategy | Trigger | Mechanism |
|----------|---------|-----------|
| **Auto-Compact** | Token count exceeds threshold (with 13K buffer) | Model-generated summary with CompactBoundary marker |
| **Max Output Recovery** | Model output truncated mid-generation | Retry up to 3 times, hide intermediate errors from user |
| **Reactive Compact** | Prompt too long for API call | Dynamic compression before sending |
| **Snip Compact** | Specific conversation segments are stale | Targeted history trimming |

Auto-compact is the minimum viable strategy. Include it in every scaffold.

### Step 5: Generate the Loop Core

The main query loop follows this flow:

```
User Input → query()
    → Build prompt (system + user context)
    → Normalize messages
    → API Call (streaming)
    → StreamingToolExecutor processes tool_use blocks
    → Response Analysis:
        → Plain text → Return to user
        → tool_use → Permission check → Sandbox → Execute → Collect result → Continue loop
    → Budget check before next iteration
    → Token check → Auto-compact if needed
```

### Step 6: Generate State Management

Use lightweight state — NOT Redux or equivalent:

```typescript
function createStore<T>(initialState: T, onChange?: OnChange<T>): Store<T> {
    let state = initialState;
    const listeners = new Set<Listener>();
    return {
        getState: () => state,
        setState: (updater) => {
            const next = updater(state);
            if (Object.is(next, state)) return;  // Prevent spurious updates
            state = next;
            onChange?.({ newState: next, oldState: state });
            for (const listener of listeners) listener();
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
```

Key: Object.is equality check prevents cascading updates from structurally identical state.

### Step 7: Generate Cost Tracker

Track costs per model with all token types:

```typescript
interface SessionCostEntry {
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
    costUSD: number;
}
```

Aggregate by model. Check against maxBudgetUsd before each API call.

## Output

Generate a complete, runnable scaffold with:
1. QueryEngine class with configuration contract
2. StreamingToolExecutor class
3. Lightweight state store
4. Auto-compact implementation
5. Cost tracker
6. Budget enforcement
7. Example tool definitions
8. Unit test stubs

## Reference Materials

- `references/loop-architecture.md` — Complete flow diagram and implementation spec
- `references/token-recovery.md` — Detailed token recovery strategy implementations
