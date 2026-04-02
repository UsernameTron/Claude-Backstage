/**
 * @claude-patterns/system-reminder-injection
 *
 * Injects <system-reminder> tags into user messages, tool results, and attachments.
 * Sources include user context, tool results, TodoWrite, deferred tools, and MCP status.
 *
 * @source System reminder mechanism (Section 20)
 * @kb Section 20 (System Reminder Mechanism)
 */

// Types & Interfaces

export type SystemReminderSource =
  | "user_context"
  | "tool_result"
  | "attachment"
  | "todo_write"
  | "deferred_tools"
  | "mcp_status";

export interface SystemReminder {
  source: SystemReminderSource;
  content: string;
  targetMessageIndex: number;
}

export interface ReminderInjectionConfig {
  wrapInTags: boolean;
  tagName: string;
}

// Constants

export const DEFAULT_TAG_NAME = "system-reminder";

// Function stubs

export function injectReminder(_message: string, _reminder: SystemReminder): string {
  throw new Error("TODO: build from system reminder mechanism (Section 20)");
}

export function wrapInReminderTags(_content: string, _tagName?: string): string {
  throw new Error("TODO: build from system reminder mechanism (Section 20)");
}

export function extractReminders(_message: string): SystemReminder[] {
  throw new Error("TODO: build from system reminder mechanism (Section 20)");
}

export function shouldInjectReminder(_source: SystemReminderSource, _turnCount: number): boolean {
  throw new Error("TODO: build from system reminder mechanism (Section 20)");
}
