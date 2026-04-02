// sdk-bridge — WebSocket session management for SDK/Direct Connect mode
// Source Pattern: Section 26 — NDJSON message framing, SDKMessage dispatch, control_request permission prompts
// KB: Section 26

// --- Types & Interfaces ---

/**
 * An SDK message transported over the WebSocket bridge.
 * Uses NDJSON framing for streaming compatibility.
 */
export interface SDKMessage {
  type: string;
  payload: Record<string, unknown>;
  messageId: string;
}

/**
 * Configuration for establishing an SDK session.
 * Supports three connection modes: full SDK, direct connect, and REPL bridge.
 */
export interface SessionConfig {
  mode: "sdk" | "direct_connect" | "repl_bridge";
  connectionUrl: string;
  outboundOnly: boolean;
}

/**
 * A control request requiring permission approval.
 * SDK mode surfaces these as permission prompts to the host application.
 */
export interface ControlRequest {
  requestId: string;
  action: string;
  description: string;
  requiresApproval: boolean;
}

// --- Classes ---

/**
 * Bridge between Claude Code and SDK/Direct Connect hosts.
 * Manages WebSocket lifecycle, NDJSON message framing, and control request dispatch.
 */
export class SDKBridge {
  /**
   * Establishes a WebSocket connection with the given session configuration.
   * TODO: implement WebSocket connection with NDJSON framing
   */
  connect(_config: SessionConfig): Promise<void> {
    throw new Error("TODO: implement WebSocket connection with NDJSON framing");
  }

  /**
   * Sends an SDKMessage to the connected host.
   * TODO: implement NDJSON serialization and WebSocket send
   */
  send(_message: SDKMessage): void {
    throw new Error(
      "TODO: implement NDJSON serialization and WebSocket send",
    );
  }

  /**
   * Registers a handler for incoming SDK messages.
   * TODO: implement message dispatch from WebSocket onmessage
   */
  onMessage(_handler: (msg: SDKMessage) => void): void {
    throw new Error(
      "TODO: implement message dispatch from WebSocket onmessage",
    );
  }

  /**
   * Handles a control request by surfacing it to the host for approval.
   * Returns true if the host approves the action.
   * TODO: implement control_request permission prompt flow
   */
  handleControlRequest(_request: ControlRequest): Promise<boolean> {
    throw new Error(
      "TODO: implement control_request permission prompt flow",
    );
  }

  /**
   * Closes the WebSocket connection and cleans up resources.
   * TODO: implement graceful WebSocket disconnect
   */
  disconnect(): void {
    throw new Error("TODO: implement graceful WebSocket disconnect");
  }
}
