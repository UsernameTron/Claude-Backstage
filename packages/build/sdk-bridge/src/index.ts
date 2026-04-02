/**
 * @claude-patterns/sdk-bridge
 *
 * WebSocket-based session management for SDK/Direct Connect mode.
 * Handles NDJSON message framing, SDKMessage dispatch, and control_request permission prompts.
 *
 * @source Server and SDK mode (Section 26)
 * @kb Section 26 (Server and SDK Mode)
 */

// Types & Interfaces

export interface SDKMessage {
  type: string;
  payload: Record<string, unknown>;
  messageId: string;
}

export interface SessionConfig {
  mode: "sdk" | "direct_connect" | "repl_bridge";
  connectionUrl: string;
  outboundOnly: boolean;
}

export interface ControlRequest {
  requestId: string;
  action: string;
  description: string;
  requiresApproval: boolean;
}

// Class

export class SDKBridge {
  constructor() {
    throw new Error("TODO: build from server and SDK mode (Section 26)");
  }

  connect(_config: SessionConfig): Promise<void> {
    throw new Error("TODO: build from server and SDK mode (Section 26)");
  }

  send(_message: SDKMessage): void {
    throw new Error("TODO: build from NDJSON message framing (Section 26)");
  }

  onMessage(_handler: (msg: SDKMessage) => void): void {
    throw new Error("TODO: build from SDKMessage dispatch (Section 26)");
  }

  handleControlRequest(_request: ControlRequest): Promise<boolean> {
    throw new Error("TODO: build from control_request permission prompts (Section 26)");
  }

  disconnect(): void {
    throw new Error("TODO: build from server and SDK mode (Section 26)");
  }
}
