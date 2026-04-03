# @claude-patterns/sdk-bridge

**Tier:** Build | **Priority:** P3 | **KB:** Section 26

WebSocket session management for SDK and Direct Connect mode with NDJSON message framing.

## Source Pattern

- Section 26: SDK bridge architecture — NDJSON message framing, SDKMessage dispatch, control_request permission prompts
- Three connection modes: SDK (full integration), Direct Connect (simplified), REPL Bridge (development)

## Architecture

The SDK bridge manages WebSocket lifecycle between Claude Code and a host application. Messages are framed using NDJSON (newline-delimited JSON) for streaming compatibility. Control requests (tool use, file edits) are surfaced to the host as permission prompts, allowing the host to approve or deny actions.

### Connection Modes

1. **SDK** — Full bidirectional integration with message dispatch and control requests
2. **Direct Connect** — Simplified connection for headless operation
3. **REPL Bridge** — Development mode for interactive testing

## Exports

### Types

- `SDKMessage` — message with type, payload, and messageId
- `SessionConfig` — connection mode, URL, and outbound-only flag
- `ControlRequest` — permission request with action description and approval requirement

### Classes

- `SDKBridge` — WebSocket bridge with connect, send, onMessage, handleControlRequest, disconnect

## Dependencies

None.

## Status

Working implementation. `SDKBridge` provides functional `connect()` (session establishment), `send()` (NDJSON message framing to outbound buffer), `onMessage()` (handler registration), `handleControlRequest()` (simulated approval flow), and `disconnect()` (cleanup). Tests verify the WebSocket lifecycle and message framing (see `__tests__/`).
