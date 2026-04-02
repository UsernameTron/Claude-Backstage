# @claude-patterns/multi-agent-coordinator

Coordinator mode detection, system prompt assembly, and task dispatch for multi-agent workflows.

## Source

- `coordinator/coordinatorMode.ts` (369 LOC)
- KB Section 25

## Tier

Build P1

## Dependencies

- `@claude-patterns/mcp-integration` — MCP server config and connection types

## Exports

- `CoordinatorConfig`, `AgentTask`, `CoordinatorNotification` — config and runtime types
- `isCoordinatorMode()` — detect coordinator mode
- `getCoordinatorSystemPrompt()` — build coordinator system prompt
- `getCoordinatorUserContext()` — summarize active tasks for user context
- `dispatchTask()` — dispatch task to sub-agent
