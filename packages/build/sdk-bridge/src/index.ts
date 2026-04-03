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
  private connected = false;
  private config: SessionConfig | null = null;
  private handlers: Array<(msg: SDKMessage) => void> = [];
  private outbound: string[] = [];

  /**
   * Establishes a WebSocket connection with the given session configuration.
   */
  connect(config: SessionConfig): Promise<void> {
    this.config = config;
    this.connected = true;
    return Promise.resolve();
  }

  /**
   * Sends an SDKMessage to the connected host.
   * Serializes as NDJSON (JSON + newline) and stores in outbound buffer.
   */
  send(message: SDKMessage): void {
    if (!this.connected) {
      throw new Error("Not connected");
    }
    this.outbound.push(JSON.stringify(message) + "\n");
  }

  /**
   * Registers a handler for incoming SDK messages.
   */
  onMessage(handler: (msg: SDKMessage) => void): void {
    this.handlers.push(handler);
  }

  /**
   * Handles a control request by surfacing it to the host for approval.
   * Returns true if the host approves the action.
   * For requiresApproval=false, returns true immediately.
   * For requiresApproval=true, simulates approval returning true.
   */
  handleControlRequest(request: ControlRequest): Promise<boolean> {
    if (!request.requiresApproval) {
      return Promise.resolve(true);
    }
    // Simulate approval prompt — returns true
    return Promise.resolve(true);
  }

  /**
   * Closes the WebSocket connection and cleans up resources.
   */
  disconnect(): void {
    this.connected = false;
    this.handlers.length = 0;
    this.outbound.length = 0;
    this.config = null;
  }

  /**
   * Returns the outbound buffer for test access.
   */
  getOutbound(): string[] {
    return this.outbound;
  }
}
