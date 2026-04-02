# @claude-patterns/system-reminder-injection

System reminder mechanism using `<system-reminder>` tag injection into user messages, tool results, and attachments.

## Tier

**Build** — Design reference. Architectural pattern for new builds.

## Priority

**P2** — Supporting subsystem for context reinforcement.

## Source Pattern

- **KB sections**: Section 20 — System reminder injection mechanism

## Architecture

System reminders are injected into the conversation at strategic points to reinforce context that might be lost during long sessions. Reminders are wrapped in `<system-reminder>` XML tags and can be injected from six sources:

- **user_context** — CLAUDE.md and project context
- **tool_result** — Appended to tool output
- **attachment** — Included with file attachments
- **todo_write** — TodoWrite tool reminders
- **deferred_tools** — Deferred tool execution reminders
- **mcp_status** — MCP server status updates

The `shouldInjectReminder` function controls injection frequency based on source type and turn count, preventing over-saturation.

## Exports

- `SystemReminderSource` — Union of 6 reminder source types
- `SystemReminder` — Reminder with source, content, target index
- `ReminderInjectionConfig` — Injection config (wrapInTags, tagName)
- `injectReminder(message, reminder)` — Inject reminder into message
- `wrapInReminderTags(content, tagName?)` — Wrap in XML tags
- `extractReminders(message)` — Parse reminders from tagged content
- `shouldInjectReminder(source, turnCount)` — Injection decision logic

## Dependencies

None

## Status

Type stubs only. All functions throw `Error`.
