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

/**
 * Validate that an MCP server config has required fields.
 * stdio needs a non-empty command; http/sse need a non-empty url.
 */
function validateConfig(config: McpServerConfig): boolean {
  switch (config.type) {
    case "stdio":
      return config.command.length > 0;
    case "http":
      return config.url.length > 0;
    case "sse":
      return config.url.length > 0;
  }
}

// Connect to an MCP server and discover its tools/resources
export async function connectToServer(
  config: ScopedMcpServerConfig,
): Promise<McpConnection> {
  if (!validateConfig(config.config)) {
    return {
      serverName: config.serverName,
      tools: [],
      resources: [],
      status: "error",
    };
  }

  // Pattern library: simulate connection (no real I/O).
  // Tools and resources would be populated by MCP discovery protocol in production.
  return {
    serverName: config.serverName,
    tools: [],
    resources: [],
    status: "connected",
  };
}

// Aggregate tools and resources from multiple connections
export function getMcpToolsCommandsAndResources(
  connections: McpConnection[],
): { tools: McpTool[]; resources: McpResource[] } {
  const active = connections.filter((c) => c.status === "connected");
  return {
    tools: active.flatMap((c) => c.tools),
    resources: active.flatMap((c) => c.resources),
  };
}

// Disconnect from an MCP server
export async function disconnectServer(
  connection: McpConnection,
): Promise<void> {
  connection.status = "disconnected";
  connection.tools = [];
  connection.resources = [];
}

// Proxy a tool call through an MCP connection
export async function proxyToolCall(
  connection: McpConnection,
  toolName: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  if (connection.status !== "connected") {
    throw new Error(
      `Cannot proxy tool call: server "${connection.serverName}" is ${connection.status}`,
    );
  }

  const tool = connection.tools.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(
      `Tool "${toolName}" not found on server "${connection.serverName}"`,
    );
  }

  // Pattern library: simulate tool execution result
  return {
    toolName,
    input,
    output: `Simulated result from ${connection.serverName}/${toolName}`,
  };
}
