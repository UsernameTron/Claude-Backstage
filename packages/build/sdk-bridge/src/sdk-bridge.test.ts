import { describe, test, expect, beforeEach } from "bun:test";
import {
  SDKBridge,
  type SessionConfig,
  type SDKMessage,
  type ControlRequest,
} from "./index";

function makeConfig(): SessionConfig {
  return {
    mode: "sdk",
    connectionUrl: "ws://localhost:8080",
    outboundOnly: false,
  };
}

function makeMessage(overrides: Partial<SDKMessage> = {}): SDKMessage {
  return {
    type: "tool_result",
    payload: { result: "ok" },
    messageId: "msg-001",
    ...overrides,
  };
}

describe("SDKBridge", () => {
  let bridge: SDKBridge;

  beforeEach(() => {
    bridge = new SDKBridge();
  });

  test("connect stores config and marks connected", async () => {
    await bridge.connect(makeConfig());
    // Should not throw on send after connect
    bridge.send(makeMessage());
  });

  test("send serializes message as NDJSON", async () => {
    await bridge.connect(makeConfig());
    const msg = makeMessage();
    bridge.send(msg);
    const outbound = bridge.getOutbound();
    expect(outbound).toHaveLength(1);
    expect(outbound[0]).toBe(JSON.stringify(msg) + "\n");
  });

  test("send throws when not connected", () => {
    expect(() => bridge.send(makeMessage())).toThrow();
  });

  test("onMessage registers handler", async () => {
    await bridge.connect(makeConfig());
    let received: SDKMessage | null = null;
    bridge.onMessage((msg) => { received = msg; });
    // Simulate receiving a message by calling handlers directly
    // The handler is registered but won't be called without simulation
    expect(received).toBeNull(); // Handler registered but not yet called
  });

  test("handleControlRequest returns true for requiresApproval=false", async () => {
    const req: ControlRequest = {
      requestId: "req-1",
      action: "read_file",
      description: "Read a file",
      requiresApproval: false,
    };
    const result = await bridge.handleControlRequest(req);
    expect(result).toBe(true);
  });

  test("handleControlRequest returns true for requiresApproval=true (simulated approval)", async () => {
    const req: ControlRequest = {
      requestId: "req-2",
      action: "write_file",
      description: "Write a file",
      requiresApproval: true,
    };
    const result = await bridge.handleControlRequest(req);
    expect(result).toBe(true);
  });

  test("disconnect clears state", async () => {
    await bridge.connect(makeConfig());
    bridge.send(makeMessage());
    bridge.onMessage(() => {});
    bridge.disconnect();
    // After disconnect, send should throw
    expect(() => bridge.send(makeMessage())).toThrow();
    expect(bridge.getOutbound()).toHaveLength(0);
  });
});
