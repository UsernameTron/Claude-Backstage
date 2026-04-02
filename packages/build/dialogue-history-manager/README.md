# @claude-patterns/dialogue-history-manager

Full message lifecycle management with JSONL persistence, crash-safe writes, and compact boundary windowing.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P2** — Critical for multi-round dialogue and context management.

## Source Reference

- **Source pattern**: Dialogue history management (Section 19)
- **KB sections**: Section 19 (Multi-Round Dialogue History Management), Section 18.3 (200K Token Handling)

## Architecture

Manages the full message lifecycle: message types (User, Assistant, Attachment, System, CompactBoundary, ToolUseSummary, Progress), persistence to JSONL, transcript write-before-response for crash safety, large paste external storage via hash, image caching, and `getMessagesAfterCompactBoundary()` for effective message windowing.

The write-before-response pattern ensures no data loss on crash: every message is persisted to the JSONL transcript before the model response is generated. Compact boundaries act as virtual start points, allowing the system to trim history while preserving continuity.

## Exports

- `MessageType` — Union of all message type strings
- `DialogueMessage` — Interface for a single message with type, content, timestamp, metadata
- `CompactBoundaryMessage` — Extended message marking a compaction point
- `HistoryConfig` — Configuration for max records, store path, external storage threshold
- `DialogueHistoryManager` — Class managing the full message lifecycle

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
