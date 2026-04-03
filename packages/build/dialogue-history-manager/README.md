# @claude-patterns/dialogue-history-manager

Dialogue history management with JSONL persistence and crash-safe write-before-response semantics.

## Tier

**Build** — Design reference. Architectural pattern for new builds.

## Priority

**P2** — Supporting subsystem for conversation state management.

## Source Pattern

- **KB sections**: Section 19 — Message lifecycle, JSONL persistence, crash-safe writes

## Architecture

The dialogue history manager tracks all messages exchanged during a session. Key design patterns:

- **Write-before-response** — Messages are persisted to JSONL on disk before the assistant response is returned, ensuring crash safety
- **Compact boundaries** — When context compaction occurs, a `CompactBoundaryMessage` is inserted that summarizes the discarded messages. Only messages after the last boundary are sent to the model.
- **Message types** — Seven types cover all dialogue participants: user, assistant, attachment, system, compact_boundary, tool_use_summary, progress

## Exports

- `MessageType` — Union of 7 message type identifiers
- `DialogueMessage` — Single message with type, content, timestamp, metadata
- `CompactBoundaryMessage` — Boundary marker with summary and original count
- `HistoryConfig` — Storage configuration (maxRecords, storePath, threshold)
- `DialogueHistoryManager` — Manager class with add/persist/load/compact operations

## Dependencies

None

## Status

Working implementation. `DialogueHistoryManager` provides functional `addMessage()`, `persist()` (JSONL serialization), `loadFromDisk()` (JSONL parsing), `getEffectiveMessages()` (compact boundary filtering), and `insertCompactBoundary()`. Tests verify the full message lifecycle (see `__tests__/`).
