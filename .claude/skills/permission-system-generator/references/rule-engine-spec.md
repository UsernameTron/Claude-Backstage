# Three-Factor Rule Engine Specification

Complete specification derived from Claude Code's permission system (9,409 LOC across
24 files in utils/permissions/).

## Core Types

### PermissionMode

```typescript
type PermissionMode =
  | "default"       // Ask for all non-trivial actions
  | "plan"          // Read-only, no mutations
  | "acceptEdits"   // Allow data mutations, ask for destructive ops
  | "bypassPermissions" // Skip all checks (dev only)
  | "dontAsk"       // Execute without confirmation
  | "auto";         // AI classifier evaluates safety
```

### PermissionRuleSource

```typescript
// Ordered by priority — earlier sources take precedence
const PERMISSION_RULE_SOURCES = [
  "policySettings",  // Enterprise/managed settings (highest priority)
  "user",            // User-level configuration
  "project",         // Project-level settings
  "local",           // Local environment settings
  "cliArg",          // Command-line arguments
  "command",         // Per-command overrides
  "session",         // Session-scope temporary rules (lowest priority)
] as const;
```

### PermissionRule

```typescript
interface PermissionRule {
  tool: string;          // Tool/action name to match
  pattern?: string;      // Optional content pattern (supports prefix:* and trailing *)
  source: PermissionRuleSource;
}
```

### Pattern Matching

Rules support three matching modes:
1. **Exact match:** `tool: "FileWrite"` matches only FileWrite
2. **Prefix syntax:** `tool: "Bash", pattern: "git:*"` matches Bash calls starting with git
3. **Trailing wildcard:** `tool: "mcp__*"` matches all MCP tools

## Evaluation Algorithm

```
function hasPermission(tool, input, mode, rules):
    // Phase 1: Check deny rules (deny always wins)
    for rule in rules.deny sorted by source priority:
        if rule matches (tool, input):
            return { allowed: false, reason: "denied", rule }

    // Phase 2: Check ask rules (trigger human review)
    for rule in rules.ask sorted by source priority:
        if rule matches (tool, input):
            return { allowed: "ask", reason: "requires review", rule }

    // Phase 3: Check allow rules
    for rule in rules.allow sorted by source priority:
        if rule matches (tool, input):
            return { allowed: true, reason: "allowed", rule }

    // Phase 4: Fall back to mode default behavior
    switch mode:
        case "bypassPermissions": return { allowed: true }
        case "dontAsk":           return { allowed: true }
        case "plan":              return { allowed: false } // read-only
        case "auto":              return classifyWithAI(tool, input)
        case "acceptEdits":       return { allowed: isEditAction(tool) }
        default:                  return { allowed: "ask" }
```

## Denial Tracking

```typescript
interface DenialTracker {
    consecutive: number;  // Resets on successful grant
    total: number;        // Never resets within session

    recordDenial(): DenialAction;
    recordGrant(): void;
    getAction(): DenialAction;
    reset(): void;  // For shift/session boundary
}

type DenialAction = "none" | "fallback_mode" | "force_change";

// Thresholds
const MAX_CONSECUTIVE = 3;   // Trigger mode fallback
const MAX_TOTAL = 20;        // Force strategy change
```

## Dangerous Pattern Detection

In auto/AI-driven modes, certain permission patterns are automatically stripped even
if explicitly configured by users:

```typescript
const DANGEROUS_PATTERNS = [
    // Code execution commands
    "python", "python3", "node", "deno", "tsx", "ruby", "perl", "php",
    "npx", "bunx", "npm run", "yarn run", "pnpm run", "bun run",
    // Shell access
    "bash", "sh", "zsh", "fish", "ssh",
    // Execution primitives
    "eval", "exec", "env", "xargs", "sudo",
];
```

These patterns in allow rules are stripped because they would allow the AI classifier
to be bypassed for dangerous operations. The user may have configured them for
convenience in manual mode, but they must not carry over to auto mode.

## Source Priority Resolution

When rules from different sources conflict:

```
policySettings deny + user allow → DENIED (policy wins)
user deny + project allow        → DENIED (user wins)
project allow + local deny       → DENIED (local wins... wait, no)
```

**Correction:** Priority is checked within each rule type (deny, ask, allow) independently.
The cascade is: ALL deny rules checked first (any match = denied), THEN all ask rules
(any match = ask), THEN all allow rules (any match = allowed). Within each tier,
higher-priority sources take precedence if there are conflicts within the same tier.

## Integration Points

### With Sandbox

The permission system runs BEFORE the sandbox. A permitted action still runs inside
the sandbox. The permission system decides IF the action can run; the sandbox constrains
HOW it runs.

### With Denial Tracker

The denial tracker is updated AFTER the permission check. If permission is denied,
the tracker records it and may trigger a mode change for the NEXT check.

### With AI Classifier (Auto Mode)

In auto mode, if no explicit rule matches, the AI classifier is consulted. The classifier
receives the tool name, input, and CLAUDE.md content (via a side-channel cache to avoid
circular dependencies). The classifier returns allow/deny with a confidence score.
