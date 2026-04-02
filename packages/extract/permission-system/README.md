# @claude-patterns/permission-system

Foundation package for Claude Code's permission system. Controls tool-use authorization through a three-factor verification model (Allow / Deny / Ask) with mode-based overrides.

## Source Reference

- **Path:** `utils/permissions/` (24 files, 9,409 LOC)
- **KB Section:** 8 — Permission System
- **Tier:** Extract (P0)

## Key Exports

### Types
- `PermissionMode` — Union of 6 modes controlling confirmation behavior
- `PermissionRule` — Rule with tool, pattern, and source
- `PermissionRuleSource` — One of 7 priority-ordered sources
- `PermissionResult` — Check result with allowed flag, reason, and optional rule

### Functions
- `hasPermissionsToUseTool()` — Primary permission check against mode and rules
- `checkRuleBasedPermissions()` — Rule-only check without mode evaluation
- `getAllowRules()` / `getDenyRules()` / `getAskRules()` — Rule accessors
- `isDangerousBashPermission()` — Detects dangerous command patterns

### Constants
- `PERMISSION_RULE_SOURCES` — Priority-ordered tuple of rule sources
- `CROSS_PLATFORM_CODE_EXEC` — Commands that execute arbitrary code
- `DANGEROUS_BASH_PATTERNS` — Patterns stripped in auto mode

## Architecture

Check priority chain: **Deny -> Ask -> Allow -> Mode -> Classifier** (section 8.3). Deny rules can never be overridden by allow rules. In auto mode, dangerous Bash permissions are automatically stripped even if user-configured.

## Dependencies

None — this is the foundation package.

## Downstream Dependents

- `@claude-patterns/yolo-classifier` — Uses permission types for classifier integration
- `@claude-patterns/dangerous-command-detection` — Extends dangerous pattern detection
