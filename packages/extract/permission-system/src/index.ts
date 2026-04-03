/**
 * @claude-patterns/permission-system
 *
 * Permission system implementing deny > ask > allow priority chain.
 * Source: utils/permissions/ (24 files, 9,409 LOC)
 * KB Reference: Section 8 — Permission System
 */

// --- Constants ---

/**
 * Permission rule source priority order.
 * Sources are checked in order; earlier sources take precedence.
 */
export const PERMISSION_RULE_SOURCES = [
  "policySettings",
  "user",
  "project",
  "local",
  "cliArg",
  "command",
  "session",
] as const;

/**
 * Cross-platform code execution commands that are always considered dangerous.
 */
export const CROSS_PLATFORM_CODE_EXEC = [
  "python",
  "python3",
  "python2",
  "node",
  "deno",
  "tsx",
  "ruby",
  "perl",
  "php",
  "lua",
  "npx",
  "bunx",
  "npm run",
  "yarn run",
  "pnpm run",
  "bun run",
  "bash",
  "sh",
  "ssh",
] as const;

/**
 * Patterns that trigger dangerous-command detection in auto mode.
 * Dangerous Bash permissions are automatically stripped even if user-configured.
 * See KB section 8.6.
 */
export const DANGEROUS_BASH_PATTERNS: readonly string[] = [
  ...CROSS_PLATFORM_CODE_EXEC,
  "zsh",
  "fish",
  "eval",
  "exec",
  "env",
  "xargs",
  "sudo",
];

// --- Types ---

/**
 * Permission modes controlling tool-use confirmation behavior.
 * See KB section 8.1.
 */
export type PermissionMode =
  | "default"
  | "plan"
  | "acceptEdits"
  | "bypassPermissions"
  | "dontAsk"
  | "auto";

/**
 * Source of a permission rule, ordered by priority.
 */
export type PermissionRuleSource =
  (typeof PERMISSION_RULE_SOURCES)[number];

/**
 * A single allow/deny/ask rule matching a tool and optional content pattern.
 * Patterns support: exact match, prefix syntax (:*), trailing wildcard (*).
 */
export interface PermissionRule {
  tool: string;
  pattern?: string;
  source: PermissionRuleSource;
}

/**
 * Result of a permission check.
 */
export interface PermissionResult {
  allowed: boolean;
  reason: string;
  rule?: PermissionRule;
}

// --- Module State ---

const allowRules: PermissionRule[] = [];
const denyRules: PermissionRule[] = [];
const askRules: PermissionRule[] = [];

// --- Rule Population ---

/** Add an allow rule to the permission system. */
export function addAllowRule(rule: PermissionRule): void {
  allowRules.push(rule);
}

/** Add a deny rule to the permission system. */
export function addDenyRule(rule: PermissionRule): void {
  denyRules.push(rule);
}

/** Add an ask rule to the permission system. */
export function addAskRule(rule: PermissionRule): void {
  askRules.push(rule);
}

/** Clear all rules. Primarily for testing. */
export function clearAllRules(): void {
  allowRules.length = 0;
  denyRules.length = 0;
  askRules.length = 0;
}

// --- Private Helpers ---

/**
 * Check if a rule matches the given tool name and input.
 * Supports exact match, prefix syntax (:*), and trailing wildcard (*).
 */
function ruleMatchesTool(
  rule: PermissionRule,
  toolName: string,
  toolInput: Record<string, unknown>,
): boolean {
  if (rule.tool !== toolName) return false;
  if (!rule.pattern) return true;

  const inputContent =
    toolName === "Bash"
      ? String(toolInput.command || "")
      : toolName === "Read" || toolName === "Write" || toolName === "Edit"
        ? String(toolInput.file_path || toolInput.path || "")
        : JSON.stringify(toolInput);

  const pattern = rule.pattern;

  // Exact match
  if (pattern === inputContent) return true;
  // Prefix match (:* syntax)
  if (pattern.endsWith(":*") && inputContent.startsWith(pattern.slice(0, -2)))
    return true;
  // Trailing wildcard
  if (
    pattern.endsWith("*") &&
    !pattern.endsWith(":*") &&
    inputContent.startsWith(pattern.slice(0, -1))
  )
    return true;

  return false;
}

// --- Functions ---

/**
 * Primary permission check: evaluates tool use against current mode and rules.
 * Check priority chain: Deny -> Ask -> Allow -> Mode -> Classifier (KB section 8.3).
 */
export function hasPermissionsToUseTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  mode: PermissionMode,
): PermissionResult {
  const ruleResult = checkRuleBasedPermissions(toolName, toolInput);
  if (ruleResult.rule) return ruleResult;

  // No rule matched -- apply mode-based defaults
  switch (mode) {
    case "bypassPermissions":
      return { allowed: true, reason: "Bypass mode: all tools allowed" };
    case "plan":
      return { allowed: false, reason: "Plan mode: read-only" };
    case "dontAsk":
      return { allowed: false, reason: "DontAsk mode: no implicit permission" };
    case "acceptEdits": {
      const editTools = ["Write", "Edit", "MultiEdit"];
      const allowed = editTools.includes(toolName);
      return {
        allowed,
        reason: allowed
          ? "AcceptEdits mode: edit tool allowed"
          : "AcceptEdits mode: non-edit tool denied",
      };
    }
    case "auto":
      return {
        allowed: false,
        reason: "Auto mode: needs yolo-classifier integration (see @claude-patterns/yolo-classifier)",
      };
    case "default":
    default:
      return {
        allowed: false,
        reason: "Default mode: needs user confirmation",
      };
  }
}

/**
 * Rule-based permission check without mode evaluation.
 * Evaluates deny, ask, and allow rules in priority order.
 */
export function checkRuleBasedPermissions(
  toolName: string,
  toolInput: Record<string, unknown>,
): PermissionResult {
  // Deny rules first (highest priority)
  for (const rule of denyRules) {
    if (ruleMatchesTool(rule, toolName, toolInput)) {
      return {
        allowed: false,
        reason: `Denied by ${rule.source} rule: ${rule.tool}${rule.pattern ? `(${rule.pattern})` : ""}`,
        rule,
      };
    }
  }
  // Ask rules second
  for (const rule of askRules) {
    if (ruleMatchesTool(rule, toolName, toolInput)) {
      return {
        allowed: false,
        reason: `Needs confirmation per ${rule.source} rule: ${rule.tool}${rule.pattern ? `(${rule.pattern})` : ""}`,
        rule,
      };
    }
  }
  // Allow rules third
  for (const rule of allowRules) {
    if (ruleMatchesTool(rule, toolName, toolInput)) {
      return {
        allowed: true,
        reason: `Allowed by ${rule.source} rule: ${rule.tool}${rule.pattern ? `(${rule.pattern})` : ""}`,
        rule,
      };
    }
  }

  return { allowed: false, reason: "No matching permission rule" };
}

/**
 * Returns all configured allow rules across all sources.
 */
export function getAllowRules(): PermissionRule[] {
  return [...allowRules];
}

/**
 * Returns all configured deny rules across all sources.
 */
export function getDenyRules(): PermissionRule[] {
  return [...denyRules];
}

/**
 * Returns all configured ask rules across all sources.
 */
export function getAskRules(): PermissionRule[] {
  return [...askRules];
}

/**
 * Checks whether a Bash permission pattern matches a dangerous command.
 * In auto mode, dangerous patterns are automatically stripped to prevent
 * bypassing the YOLO classifier (KB section 8.6).
 */
export function isDangerousBashPermission(pattern: string): boolean {
  const content = pattern.trim().toLowerCase();
  if (content === "" || content === "*") return true;

  for (const dangerousPattern of DANGEROUS_BASH_PATTERNS) {
    const lower = dangerousPattern.toLowerCase();
    if (content === lower) return true;
    if (content === `${lower}:*`) return true;
    if (content === `${lower}*`) return true;
    if (content === `${lower} *`) return true;
    if (content.startsWith(`${lower} -`) && content.endsWith("*")) return true;
  }

  return false;
}

/** Reset module-level state for test isolation. Alias for clearAllRules. */
export const resetState = clearAllRules;
