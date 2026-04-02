/**
 * @claude-patterns/permission-system
 *
 * Type stubs for Claude Code's permission system.
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
  // TODO: extract from utils/permissions/
  throw new Error("TODO: extract from utils/permissions/");
}

/**
 * Rule-based permission check without mode evaluation.
 * Evaluates deny, ask, and allow rules in priority order.
 */
export function checkRuleBasedPermissions(
  toolName: string,
  toolInput: Record<string, unknown>,
): PermissionResult {
  // TODO: extract from utils/permissions/
  throw new Error("TODO: extract from utils/permissions/");
}

/**
 * Returns all configured allow rules across all sources.
 */
export function getAllowRules(): PermissionRule[] {
  // TODO: extract from utils/permissions/
  throw new Error("TODO: extract from utils/permissions/");
}

/**
 * Returns all configured deny rules across all sources.
 */
export function getDenyRules(): PermissionRule[] {
  // TODO: extract from utils/permissions/
  throw new Error("TODO: extract from utils/permissions/");
}

/**
 * Returns all configured ask rules across all sources.
 */
export function getAskRules(): PermissionRule[] {
  // TODO: extract from utils/permissions/
  throw new Error("TODO: extract from utils/permissions/");
}

/**
 * Checks whether a Bash permission pattern matches a dangerous command.
 * In auto mode, dangerous patterns are automatically stripped to prevent
 * bypassing the YOLO classifier (KB section 8.6).
 */
export function isDangerousBashPermission(pattern: string): boolean {
  // TODO: extract from utils/permissions/
  throw new Error("TODO: extract from utils/permissions/");
}
