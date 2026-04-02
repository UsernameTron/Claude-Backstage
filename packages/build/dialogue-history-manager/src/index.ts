// dialogue-history-manager — Dialogue history management with JSONL persistence
// Source: Section 19 — message lifecycle, JSONL persistence, crash-safe
// write-before-response pattern
// KB: Section 19

// --- Types & Interfaces ---

/**
 * All supported message types in the dialogue history.
 * compact_boundary marks where context compaction occurred.
 */
export type MessageType =
  | "user"
  | "assistant"
  | "attachment"
  | "system"
  | "compact_boundary"
  | "tool_use_summary"
  | "progress";

/**
 * A single message in the dialogue history.
 */
export interface DialogueMessage {
  type: MessageType;
  content: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

/**
 * A special message marking where context compaction occurred.
 * Contains a summary of the discarded messages and how many were compacted.
 */
export interface CompactBoundaryMessage extends DialogueMessage {
  summary: string;
  originalMessageCount: number;
}

/**
 * Configuration for the dialogue history manager.
 */
export interface HistoryConfig {
  maxRecords: number;
  storePath: string;
  externalStorageThreshold: number;
}

// --- Class ---

/**
 * Manages dialogue message history with JSONL persistence and
 * crash-safe write-before-response semantics. Messages are persisted
 * to disk before the assistant response is returned, ensuring no
 * data loss on process termination.
 */
export class DialogueHistoryManager {
  /**
   * Initialize the history manager with storage configuration.
   * TODO: implement constructor with JSONL store setup
   */
  constructor(_config: HistoryConfig) {
    throw new Error("TODO: implement constructor with JSONL store setup");
  }

  /**
   * Append a message to the history.
   * TODO: implement message addition with write-before-response
   */
  addMessage(_msg: DialogueMessage): void {
    throw new Error(
      "TODO: implement message addition with write-before-response",
    );
  }

  /**
   * Returns messages after the most recent compact boundary.
   * These are the "effective" messages visible to the model.
   * TODO: implement post-boundary message retrieval
   */
  getMessagesAfterCompactBoundary(): DialogueMessage[] {
    throw new Error("TODO: implement post-boundary message retrieval");
  }

  /**
   * Persist all pending messages to JSONL on disk.
   * Uses write-before-response pattern for crash safety.
   * TODO: implement JSONL persistence with crash-safe writes
   */
  persist(): void {
    throw new Error(
      "TODO: implement JSONL persistence with crash-safe writes",
    );
  }

  /**
   * Load dialogue history from a JSONL file on disk.
   * TODO: implement JSONL file loading
   */
  loadFromDisk(_path: string): DialogueMessage[] {
    throw new Error("TODO: implement JSONL file loading");
  }

  /**
   * Returns the effective message list for the current context window.
   * Equivalent to messages after the last compact boundary.
   * TODO: implement effective message computation
   */
  getEffectiveMessages(): DialogueMessage[] {
    throw new Error("TODO: implement effective message computation");
  }

  /**
   * Insert a compact boundary message, marking that prior messages
   * have been summarized and can be discarded from the context window.
   * TODO: implement compact boundary insertion
   */
  insertCompactBoundary(_summary: string): void {
    throw new Error("TODO: implement compact boundary insertion");
  }
}
