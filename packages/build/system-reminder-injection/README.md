# @claude-patterns/system-reminder-injection

Injects `<system-reminder>` tags into user messages, tool results, and attachments from multiple sources.

## Tier

**Build** — Design reference. Architectural patterns for new builds.

## Priority

**P2** — Key mechanism for runtime context injection into the dialogue stream.

## Source Reference

- **Source pattern**: System reminder mechanism (Section 20)
- **KB sections**: Section 20 (System Reminder Mechanism)

## Architecture

`<system-reminder>` tags are injected into user messages, tool results, and attachment messages. Sources include: user context injection, tool results, TodoWrite reminders, deferred tool notifications, and MCP connection status changes.

The system prompt instructs the model that these tags are automatically added and bear no direct relation to the messages in which they appear. This allows runtime context to be surfaced without polluting the dialogue history or requiring separate system message slots.

## Exports

- `SystemReminderSource` — Union type of all reminder sources
- `SystemReminder` — Interface for a single reminder with source, content, target index
- `ReminderInjectionConfig` — Configuration for tag wrapping behavior
- `injectReminder` — Inject a reminder into a message string
- `wrapInReminderTags` — Wrap content in system-reminder XML tags
- `extractReminders` — Parse existing reminders from message text
- `shouldInjectReminder` — Determine whether a reminder should be injected given source and turn count

## Dependencies

None

## Status

Type stubs only. All functions throw `Error("TODO: ...")`.
