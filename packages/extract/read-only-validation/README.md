# @claude-patterns/read-only-validation

Per-flag safety classification for read-only command validation in plan mode.

## Source Reference

- **Files:** `utils/shell/readOnlyCommandValidation.ts`
- **LOC:** ~500
- **KB Section:** 8.7 — Read-Only Command Validation
- **Tier:** Extract P2

## Key Concepts

- **Per-flag safety** — Each flag classified as none/number/string to prevent injection
- **Git read-only** — Whitelisted git subcommands (branch, log, status, diff, show, tag, remote, stash)
- **gh CLI read-only** — Whitelisted gh subcommands (pr list/view/status, issue list/view, etc.)
- **Plan mode** — Allows read-only operations while blocking mutations

## Exports

- `FlagType` — Type: none, number, string
- `CommandSafeFlags` / `ReadOnlyCommand` — Flag classification interfaces
- `GIT_READ_ONLY_COMMANDS` — Git read-only command registry
- `GH_READ_ONLY_COMMANDS` — gh CLI read-only command list
- `checkReadOnlyConstraints()` — Validate command against read-only rules
- `parseCommand()` — Parse command string into executable and args

## Dependencies

- **Upstream:** None (standalone)
- **Downstream:** None
