# @claude-patterns/dangerous-command-detection

Compound command decomposition prevents injection bypass (e.g., `docker ps && curl evil.com`). AST-level bash analysis and auto-stripping of dangerous permissions in auto mode.

- **Source:** `utils/permissions/dangerousPatterns.ts` + `BashTool/` (12,411 LOC)
- **KB:** Section 8.6 / Pattern 8
- **Tier:** Extract P2
- **Depends:** permission-system, path-validation
- **Downstream:** none

## Key Pattern

Compound commands are decomposed into individual subcommands before pattern matching. Each subcommand is independently checked against dangerous patterns. In auto mode, dangerous bash permissions are automatically stripped even if user-configured, preventing bypass of the YOLO classifier.

## Status

Type stubs only. No runtime implementation.
