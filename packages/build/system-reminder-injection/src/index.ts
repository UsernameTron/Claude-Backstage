// system-reminder-injection — System reminder mechanism via <system-reminder> tags
// Source: Section 20 — <system-reminder> tag injection into user messages,
// tool results, and attachments
// KB: Section 20

// --- Types & Interfaces ---

/**
 * Sources that can trigger a system reminder injection.
 * Each source injects reminders at different points in the conversation.
 */
export type SystemReminderSource =
  | "user_context"
  | "tool_result"
  | "attachment"
  | "todo_write"
  | "deferred_tools"
  | "mcp_status";

/**
 * A system reminder to be injected into a message.
 */
export interface SystemReminder {
  source: SystemReminderSource;
  content: string;
  targetMessageIndex: number;
}

/**
 * Configuration for how reminders are injected.
 */
export interface ReminderInjectionConfig {
  wrapInTags: boolean;
  tagName: string;
}

// --- Functions ---

/**
 * Injects a system reminder into a message string.
 * TODO: implement reminder injection into message content
 */
export function injectReminder(
  _message: string,
  _reminder: SystemReminder,
): string {
  throw new Error("TODO: implement reminder injection into message content");
}

/**
 * Wraps content in <system-reminder> (or custom) XML tags.
 * TODO: implement XML tag wrapping for reminder content
 */
export function wrapInReminderTags(
  _content: string,
  _tagName?: string,
): string {
  throw new Error("TODO: implement XML tag wrapping for reminder content");
}

/**
 * Extracts system reminders from a message string by parsing reminder tags.
 * TODO: implement reminder extraction from tagged message content
 */
export function extractReminders(_message: string): SystemReminder[] {
  throw new Error(
    "TODO: implement reminder extraction from tagged message content",
  );
}

/**
 * Determines whether a reminder should be injected based on source type
 * and current turn count (some reminders are periodic).
 * TODO: implement injection decision logic per source and turn
 */
export function shouldInjectReminder(
  _source: SystemReminderSource,
  _turnCount: number,
): boolean {
  throw new Error(
    "TODO: implement injection decision logic per source and turn",
  );
}
