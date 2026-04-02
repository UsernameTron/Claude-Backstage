# @claude-patterns/sdk-bridge

WebSocket-based session management for SDK/Direct Connect mode with NDJSON framing and control requests.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P3** — SDK and remote connection patterns.

## Source Reference

- **Source pattern**: Server and SDK mode (Section 26)
- **KB sections**: Section 26 (Server and SDK Mode)

## Architecture

WebSocket-based session management for SDK/Direct Connect mode. `DirectConnectSessionManager` handles NDJSON message framing, SDKMessage dispatch, and `control_request` permission prompts. REPL bridge connects local instance to remote Claude.ai with optional `replBridgeOutboundOnly` mode.

The bridge pattern abstracts transport details so consumers interact with a unified message interface regardless of whether the session is local SDK, direct connect, or REPL bridge mode.

## Exports

- `SDKMessage` — Interface for messages with type, payload, and messageId
- `SessionConfig` — Configuration for connection mode, URL, and outbound-only flag
- `ControlRequest` — Interface for permission prompts requiring approval
- `SDKBridge` — Class managing WebSocket session lifecycle

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
