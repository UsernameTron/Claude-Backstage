/**
 * @claude-patterns/mcp-integration
 *
 * MCP server connection management, tool proxying, and resource discovery.
 * Source: services/mcp/ (23 files, 12,310 LOC)
 * KB: Section 24 — MCP Integration
 * Tier: Build P2
 */

// Transport types for MCP server connections
export type McpTransport = "stdio" | "sse" | "http";

// stdio-based MCP server configuration
export interface StdioMcpServerConfig {
  type: "stdio";
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// HTTP-based MCP server configuration
export interface HttpMcpServerConfig {
  type: "http";
  url: string;
  headers?: Record<string, string>;
}

// SSE-based MCP server configuration (deprecated)
export interface SseMcpServerConfig {
  type: "sse";
  url: string;
}

// Union of all MCP server config types
export type McpServerConfig =
  | StdioMcpServerConfig
  | HttpMcpServerConfig
  | SseMcpServerConfig;

// Scoped server config — includes installation scope and server name
export interface ScopedMcpServerConfig {
  scope: "local" | "project" | "user" | "managed";
  serverName: string;
  config: McpServerConfig;
}

// Tool exposed by an MCP server
export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

// Resource exposed by an MCP server
export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// Active connection to an MCP server
export interface McpConnection {
  serverName: string;
  tools: McpTool[];
  resources: McpResource[];
  status: "connected" | "disconnected" | "error";
}

// Connect to an MCP server and discover its tools/resources
export function connectToServer(
  config: ScopedMcpServerConfig,
): Promise<McpConnection> {
  // TODO: extract from services/mcp/
  throw new Error("TODO: extract from services/mcp/");
}

// Aggregate tools and resources from multiple connections
export function getMcpToolsCommandsAndResources(
  connections: McpConnection[],
): { tools: McpTool[]; resources: McpResource[] } {
  // TODO: extract from services/mcp/
  throw new Error("TODO: extract from services/mcp/");
}

// Disconnect from an MCP server
export function disconnectServer(
  connection: McpConnection,
): Promise<void> {
  // TODO: extract from services/mcp/
  throw new Error("TODO: extract from services/mcp/");
}

// Proxy a tool call through an MCP connection
export function proxyToolCall(
  connection: McpConnection,
  toolName: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  // TODO: extract from services/mcp/
  throw new Error("TODO: extract from services/mcp/");
}
