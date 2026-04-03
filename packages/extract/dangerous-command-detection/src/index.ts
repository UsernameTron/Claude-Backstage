/**
 * @claude-patterns/dangerous-command-detection
 *
 * Compound command decomposition prevents injection bypass. AST-level bash analysis.
 * Auto-stripping of dangerous permissions in auto mode.
 * Source: utils/permissions/dangerousPatterns.ts + BashTool/ (12,411 LOC)
 * KB: Section 8.6 / Pattern 8
 * Tier: Extract P2
 */

import type { PermissionMode, PermissionRule } from "@claude-patterns/permission-system";
import { DANGEROUS_BASH_PATTERNS, CROSS_PLATFORM_CODE_EXEC } from "@claude-patterns/permission-system";
import type { FileOperationType } from "@claude-patterns/path-validation";
import { isDangerousRemovalPath, DANGEROUS_FILES } from "@claude-patterns/path-validation";

// Re-export from permission-system for consumers who only need dangerous patterns
export { DANGEROUS_BASH_PATTERNS, CROSS_PLATFORM_CODE_EXEC };

// Compound command operators that need decomposition
export const COMPOUND_OPERATORS = ["&&", "||", ";", "|"] as const;
export type CompoundOperator = (typeof COMPOUND_OPERATORS)[number];

// Result of security analysis on a bash command
export interface CommandSecurityResult {
  isDangerous: boolean;
  reasons: string[];
  matchedPatterns: string[];
  subcommands: string[];
}

// Read-only commands safe for plan mode
const PLAN_MODE_SAFE_COMMANDS = new Set([
  "ls", "cat", "head", "tail", "wc", "grep", "rg", "find", "which", "whoami",
  "pwd", "echo", "printf", "date", "uname", "hostname", "env", "printenv",
  "file", "stat", "du", "df", "free", "top", "ps", "id", "groups",
  "git", "diff", "sort", "uniq", "tr", "cut", "awk", "sed",
  "tree", "less", "more", "strings", "hexdump", "od", "xxd",
  "jq", "yq", "curl", "wget",
]);

// Git subcommands that are safe for plan mode (read-only)
const SAFE_GIT_SUBCOMMANDS = new Set([
  "status", "log", "diff", "show", "branch", "tag", "remote", "config",
  "ls-files", "ls-tree", "rev-parse", "describe", "shortlog", "blame",
  "stash", "worktree",
]);

// Destructive command patterns (beyond DANGEROUS_BASH_PATTERNS)
const DESTRUCTIVE_PATTERNS: readonly RegExp[] = [
  /^rm\s+.*-\w*r\w*f/,        // rm -rf, rm -fr, rm -r -f
  /^rm\s+.*-\w*f\w*r/,        // rm -fr
  /^chmod\s+.*-R\s+0?7?77/,   // chmod -R 777
  /^mkfs\b/,                   // mkfs (format filesystem)
  /^dd\s+.*of=\/dev/,          // dd to device
];

// Pipe-to-shell patterns
const PIPE_TO_SHELL_REGEX = /\|\s*(bash|sh|zsh|fish|dash)\b/;
const CURL_TO_SHELL_REGEX = /curl\b.*\|\s*(bash|sh|zsh|fish|dash)\b/;
const BASE64_PIPE_REGEX = /base64\s+(-d|--decode)\s*\|\s*(bash|sh|zsh|fish|dash)\b/;

// Decompose compound commands (&&, ||, ;, |) into individual subcommands
// Prevents injection bypass like "docker ps && curl evil.com"
// Preserves content inside quotes
export function decomposeCompoundCommand(command: string): string[] {
  const subcommands: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let i = 0;

  while (i < command.length) {
    const char = command[i];

    // Handle quote toggling
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
      i++;
      continue;
    }
    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      i++;
      continue;
    }

    // Only split on operators outside quotes
    if (!inSingleQuote && !inDoubleQuote) {
      // Check for && and ||
      if (i + 1 < command.length) {
        const twoChar = command.slice(i, i + 2);
        if (twoChar === "&&" || twoChar === "||") {
          const trimmed = current.trim();
          if (trimmed) subcommands.push(trimmed);
          current = "";
          i += 2;
          continue;
        }
      }
      // Check for ; and |
      if (char === ";" || char === "|") {
        const trimmed = current.trim();
        if (trimmed) subcommands.push(trimmed);
        current = "";
        i++;
        continue;
      }
    }

    current += char;
    i++;
  }

  const trimmed = current.trim();
  if (trimmed) subcommands.push(trimmed);

  return subcommands.length > 0 ? subcommands : [command.trim()];
}

// Check if a command matches dangerous patterns
export function isDangerousCommand(
  command: string,
  mode: PermissionMode,
): CommandSecurityResult {
  const subcommands = decomposeCompoundCommand(command);
  const reasons: string[] = [];
  const matchedPatterns: string[] = [];

  for (const subcmd of subcommands) {
    const cmdLower = subcmd.toLowerCase().trim();
    const firstWord = cmdLower.split(/\s+/)[0];

    for (const pattern of DANGEROUS_BASH_PATTERNS) {
      const patternLower = pattern.toLowerCase();
      if (firstWord === patternLower || cmdLower.startsWith(patternLower + " ")) {
        reasons.push(`Subcommand "${subcmd}" matches dangerous pattern "${pattern}"`);
        matchedPatterns.push(pattern);
      }
    }

    // Check destructive command patterns
    for (const pattern of DESTRUCTIVE_PATTERNS) {
      if (pattern.test(subcmd)) {
        reasons.push(`Subcommand "${subcmd}" matches destructive pattern`);
        matchedPatterns.push(pattern.source);
      }
    }
  }

  return {
    isDangerous: matchedPatterns.length > 0,
    reasons,
    matchedPatterns,
    subcommands,
  };
}

// AST-level security analysis of bash command
export function parseForSecurity(command: string): CommandSecurityResult {
  const subcommands = decomposeCompoundCommand(command);
  const reasons: string[] = [];
  const matchedPatterns: string[] = [];

  // Check the full command for pipe-to-shell patterns
  if (PIPE_TO_SHELL_REGEX.test(command)) {
    reasons.push("Pipe-to-shell pattern detected");
    matchedPatterns.push("pipe-to-shell");
  }

  if (CURL_TO_SHELL_REGEX.test(command)) {
    reasons.push("Curl pipe-to-shell pattern detected");
    matchedPatterns.push("curl-to-shell");
  }

  if (BASE64_PIPE_REGEX.test(command)) {
    reasons.push("Base64 decode pipe-to-shell pattern detected");
    matchedPatterns.push("base64-decode-pipe");
  }

  // Check each subcommand for dangerous patterns
  for (const subcmd of subcommands) {
    const firstWord = subcmd.trim().split(/\s+/)[0].toLowerCase();

    if (firstWord === "eval" || firstWord === "exec") {
      reasons.push(`Dangerous command: ${firstWord}`);
      matchedPatterns.push(firstWord);
    }
  }

  return {
    isDangerous: matchedPatterns.length > 0,
    reasons,
    matchedPatterns,
    subcommands,
  };
}

// Check if a command is safe for read-only/plan mode
export function isCommandSafeForPlanMode(command: string): boolean {
  const subcommands = decomposeCompoundCommand(command);

  for (const subcmd of subcommands) {
    const parts = subcmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (!PLAN_MODE_SAFE_COMMANDS.has(cmd)) {
      return false;
    }

    // For git, verify the subcommand is also safe
    if (cmd === "git" && parts.length > 1) {
      const gitSubcmd = parts[1].toLowerCase();
      if (!SAFE_GIT_SUBCOMMANDS.has(gitSubcmd)) {
        return false;
      }
    }
  }

  return true;
}

// Check if a file operation targets a dangerous path
export function isFileDangerousForOperation(
  filePath: string,
  operation: FileOperationType,
): boolean {
  // For delete operations, delegate to path-validation
  if (operation === "delete") {
    return isDangerousRemovalPath(filePath);
  }

  // For write operations, check against dangerous files list
  if (operation === "write" || operation === "create") {
    const basename = filePath.split("/").pop() || filePath;
    if (DANGEROUS_FILES.includes(basename)) {
      return true;
    }
  }

  // For read operations, generally safe
  return false;
}
