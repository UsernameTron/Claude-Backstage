# @claude-patterns/streaming-tool-executor

Overlaps tool execution with streaming response to reduce latency.

## Source Reference

- **Files:** `services/tools/StreamingToolExecutor.ts`
- **LOC:** 530
- **KB:** Pattern 6 — Streaming Tool Execution
- **Tier:** Extract P1

## Key Concepts

- **Parallel execution** — Tools begin executing as soon as their input is parsed from the stream
- **Latency reduction** — Overlaps network I/O with tool computation
- **Result collection** — Separates completed from pending results for progressive rendering

## Exports

- `StreamingToolExecutor` — Class: addTool, getCompletedResults, getRemainingResults, getUpdatedContext
- `ToolResult` — Interface: toolName, toolUseId, result, isError
- `ToolDefinition` — Interface: name, execute

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** agent-dialogue-loop
