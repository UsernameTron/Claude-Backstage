# @claude-patterns/agent-dialogue-loop

Core query engine: streaming dialogue with tool execution, state management, and token tracking.

## Source

- `query.ts` + `QueryEngine.ts` (3,024 LOC)
- KB Section 19

## Tier

Build P1

## Dependencies

- `@claude-patterns/streaming-tool-executor` — tool execution and result types
- `@claude-patterns/state-store` — reactive state management
- `@claude-patterns/token-estimation` — message and token usage types

## Exports

- `QueryEngine` — streaming dialogue engine class
- `QueryEngineConfig` — engine configuration
- `QueryParams` — per-query parameters
- `StreamEvent` — streaming event union type
- `QueryResult` — completed query result
- `ask()` — standalone async generator convenience wrapper
