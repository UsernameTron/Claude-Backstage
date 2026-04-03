import { describe, expect, test } from "bun:test";
import {
  connectToServer,
  getMcpToolsCommandsAndResources,
  disconnectServer,
  proxyToolCall,
  type ScopedMcpServerConfig,
  type McpConnection,
  type McpTool,
  type McpResource,
  type McpTransport,
  type StdioMcpServerConfig,
  type HttpMcpServerConfig,
  type SseMcpServerConfig,
  type McpServerConfig,
} from "./index";

describe("connectToServer", () => {
  test("stdio config returns connected McpConnection", async () => {
    const config: ScopedMcpServerConfig = {
      scope: "local",
      serverName: "test-stdio",
      config: { type: "stdio", command: "node", args: ["server.js"] },
    };
    const conn = await connectToServer(config);
    expect(conn.serverName).toBe("test-stdio");
    expect(conn.status).toBe("connected");
    expect(conn.tools).toBeInstanceOf(Array);
    expect(conn.resources).toBeInstanceOf(Array);
  });

  test("http config returns connected McpConnection", async () => {
    const config: ScopedMcpServerConfig = {
      scope: "project",
      serverName: "test-http",
      config: { type: "http", url: "https://example.com/mcp" },
    };
    const conn = await connectToServer(config);
    expect(conn.serverName).toBe("test-http");
    expect(conn.status).toBe("connected");
  });

  test("sse config returns connected McpConnection", async () => {
    const config: ScopedMcpServerConfig = {
      scope: "user",
      serverName: "test-sse",
      config: { type: "sse", url: "https://example.com/sse" },
    };
    const conn = await connectToServer(config);
    expect(conn.status).toBe("connected");
  });

  test("stdio config missing command returns error status", async () => {
    const config: ScopedMcpServerConfig = {
      scope: "local",
      serverName: "bad-stdio",
      config: { type: "stdio", command: "", args: [] },
    };
    const conn = await connectToServer(config);
    expect(conn.status).toBe("error");
  });

  test("http config missing url returns error status", async () => {
    const config: ScopedMcpServerConfig = {
      scope: "local",
      serverName: "bad-http",
      config: { type: "http", url: "" },
    };
    const conn = await connectToServer(config);
    expect(conn.status).toBe("error");
  });
});

describe("getMcpToolsCommandsAndResources", () => {
  test("aggregates tools and resources from multiple connections", () => {
    const conn1: McpConnection = {
      serverName: "s1",
      tools: [{ name: "tool1", description: "T1", inputSchema: {} }],
      resources: [{ uri: "r://1", name: "R1" }],
      status: "connected",
    };
    const conn2: McpConnection = {
      serverName: "s2",
      tools: [{ name: "tool2", description: "T2", inputSchema: {} }],
      resources: [{ uri: "r://2", name: "R2" }],
      status: "connected",
    };
    const result = getMcpToolsCommandsAndResources([conn1, conn2]);
    expect(result.tools).toHaveLength(2);
    expect(result.resources).toHaveLength(2);
    expect(result.tools.map((t) => t.name)).toEqual(["tool1", "tool2"]);
  });

  test("returns empty arrays for empty connections", () => {
    const result = getMcpToolsCommandsAndResources([]);
    expect(result.tools).toEqual([]);
    expect(result.resources).toEqual([]);
  });

  test("filters out disconnected connections", () => {
    const connected: McpConnection = {
      serverName: "s1",
      tools: [{ name: "tool1", description: "T1", inputSchema: {} }],
      resources: [],
      status: "connected",
    };
    const disconnected: McpConnection = {
      serverName: "s2",
      tools: [{ name: "tool2", description: "T2", inputSchema: {} }],
      resources: [],
      status: "disconnected",
    };
    const result = getMcpToolsCommandsAndResources([connected, disconnected]);
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("tool1");
  });
});

describe("disconnectServer", () => {
  test("sets status to disconnected", async () => {
    const conn: McpConnection = {
      serverName: "s1",
      tools: [{ name: "t", description: "d", inputSchema: {} }],
      resources: [{ uri: "r://1", name: "R1" }],
      status: "connected",
    };
    await disconnectServer(conn);
    expect(conn.status).toBe("disconnected");
    expect(conn.tools).toEqual([]);
    expect(conn.resources).toEqual([]);
  });
});

describe("proxyToolCall", () => {
  test("returns result for connected connection with matching tool", async () => {
    const conn: McpConnection = {
      serverName: "s1",
      tools: [{ name: "myTool", description: "d", inputSchema: {} }],
      resources: [],
      status: "connected",
    };
    const result = await proxyToolCall(conn, "myTool", { arg: 1 });
    expect(result).toBeDefined();
  });

  test("throws on disconnected connection", async () => {
    const conn: McpConnection = {
      serverName: "s1",
      tools: [{ name: "myTool", description: "d", inputSchema: {} }],
      resources: [],
      status: "disconnected",
    };
    await expect(proxyToolCall(conn, "myTool", {})).rejects.toThrow();
  });

  test("throws when tool not found", async () => {
    const conn: McpConnection = {
      serverName: "s1",
      tools: [{ name: "otherTool", description: "d", inputSchema: {} }],
      resources: [],
      status: "connected",
    };
    await expect(proxyToolCall(conn, "missingTool", {})).rejects.toThrow();
  });
});

describe("type interfaces", () => {
  test("McpTransport includes all transport types", () => {
    const transports: McpTransport[] = ["stdio", "sse", "http"];
    expect(transports).toHaveLength(3);
  });

  test("McpServerConfig union covers all config types", () => {
    const stdio: McpServerConfig = { type: "stdio", command: "node", args: [] };
    const http: McpServerConfig = { type: "http", url: "http://localhost" };
    const sse: McpServerConfig = { type: "sse", url: "http://localhost/sse" };
    expect(stdio.type).toBe("stdio");
    expect(http.type).toBe("http");
    expect(sse.type).toBe("sse");
  });
});
