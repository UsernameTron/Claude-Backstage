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
  private messages: DialogueMessage[] = [];
  private config: HistoryConfig;
  private serialized: string = "";

  /**
   * Initialize the history manager with storage configuration.
   */
  constructor(config: HistoryConfig) {
    this.config = config;
    this.messages = [];
    this.serialized = "";
  }

  /**
   * Append a message to the history.
   * Enforces maxRecords by shifting oldest messages.
   */
  addMessage(msg: DialogueMessage): void {
    this.messages.push(msg);
    if (this.messages.length > this.config.maxRecords) {
      this.messages.shift();
    }
  }

  /**
   * Returns messages after the most recent compact boundary.
   * These are the "effective" messages visible to the model.
   */
  getMessagesAfterCompactBoundary(): DialogueMessage[] {
    return this.getEffectiveMessages();
  }

  /**
   * Persist all pending messages to JSONL format.
   * Simulated: stores serialized JSONL string in memory.
   */
  persist(): void {
    this.serialized = this.messages
      .map((m) => JSON.stringify(m))
      .join("\n");
  }

  /**
   * Load dialogue history from JSONL.
   * Simulated: parses internal serialized state.
   */
  loadFromDisk(path: string): DialogueMessage[] {
    void path;
    const parsed = this.serialized
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as DialogueMessage);
    this.messages = parsed;
    return parsed;
  }

  /**
   * Returns the effective message list for the current context window.
   * Messages after the last compact boundary, or all if no boundary exists.
   */
  getEffectiveMessages(): DialogueMessage[] {
    let lastBoundaryIndex = -1;
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].type === "compact_boundary") {
        lastBoundaryIndex = i;
        break;
      }
    }
    if (lastBoundaryIndex >= 0) {
      return [...this.messages.slice(lastBoundaryIndex + 1)];
    }
    return [...this.messages];
  }

  /**
   * Insert a compact boundary message, marking that prior messages
   * have been summarized and can be discarded from the context window.
   */
  insertCompactBoundary(summary: string): void {
    const boundary: CompactBoundaryMessage = {
      type: "compact_boundary",
      content: summary,
      timestamp: Date.now(),
      metadata: {},
      summary,
      originalMessageCount: this.messages.length,
    };
    this.messages.push(boundary);
  }
}
