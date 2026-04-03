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
 * Wraps content in <system-reminder> (or custom) XML tags.
 */
export function wrapInReminderTags(
  content: string,
  tagName?: string,
): string {
  const tag = tagName ?? "system-reminder";
  return `<${tag}>${content}</${tag}>`;
}

/**
 * Injects a system reminder into a message string.
 * Appends the reminder content wrapped in system-reminder tags.
 */
export function injectReminder(
  message: string,
  reminder: SystemReminder,
): string {
  const wrapped = wrapInReminderTags(reminder.content);
  return `${message}\n${wrapped}`;
}

/**
 * Extracts system reminders from a message string by parsing reminder tags.
 * Returns an array of SystemReminder objects for each tag found.
 */
export function extractReminders(message: string): SystemReminder[] {
  const regex = /<system-reminder>([\s\S]*?)<\/system-reminder>/g;
  const reminders: SystemReminder[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(message)) !== null) {
    reminders.push({
      source: "user_context",
      content: match[1],
      targetMessageIndex: 0,
    });
  }
  return reminders;
}

/**
 * Determines whether a reminder should be injected based on source type
 * and current turn count (some reminders are periodic).
 */
export function shouldInjectReminder(
  source: SystemReminderSource,
  turnCount: number,
): boolean {
  switch (source) {
    case "user_context":
    case "tool_result":
    case "attachment":
    case "todo_write":
      return true;
    case "mcp_status":
    case "deferred_tools":
      return turnCount % 5 === 0;
  }
}
