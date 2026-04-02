# @claude-patterns/mcp-integration

MCP server connection management, tool proxying, and resource discovery.

## Source

- `services/mcp/` (23 files, 12,310 LOC)
- KB Section 24

## Tier

Build P2

## Dependencies

None (standalone)

## Exports

- `McpTransport`, `McpServerConfig`, `ScopedMcpServerConfig` — config types
- `StdioMcpServerConfig`, `HttpMcpServerConfig`, `SseMcpServerConfig` — transport-specific configs
- `McpTool`, `McpResource`, `McpConnection` — runtime types
- `connectToServer()` — connect to MCP server
- `getMcpToolsCommandsAndResources()` — aggregate tools/resources
- `disconnectServer()` — disconnect from server
- `proxyToolCall()` — proxy tool invocation through connection
