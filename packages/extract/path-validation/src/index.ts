/**
 * @claude-patterns/path-validation
 *
 * Multi-layer path validation: UNC, tilde TOCTOU, shell expansion, glob.
 * Source: utils/permissions/pathValidation.ts (485 LOC)
 * KB: Section 10 — Path Validation
 * Tier: Extract P2
 */

// File operation types that determine validation strictness
export type FileOperationType = "read" | "write" | "create" | "delete";

// Result of a path validation check
export interface PathCheckResult {
  allowed: boolean;
  reason: string;
  checks: {
    uncPath: boolean; // UNC credential leak check
    tildeExpansion: boolean; // TOCTOU tilde expansion check
    shellExpansion: boolean; // $VAR, ${VAR}, $(cmd) check
    globPattern: boolean; // *, ?, [ in write ops check
  };
}

// Dangerous files that are code execution or data leakage vectors
export const DANGEROUS_FILES: readonly string[] = [
  ".gitconfig",
  ".gitmodules",
  ".bashrc",
  ".bash_profile",
  ".zshrc",
  ".zprofile",
  ".profile",
  ".ripgreprc",
  ".mcp.json",
  ".claude.json",
];

// Dangerous directories
export const DANGEROUS_DIRECTORIES: readonly string[] = [
  ".git",
  ".vscode",
  ".idea",
  ".claude",
];

// Multi-layer path validation (UNC, tilde, shell expansion, glob)
export function validatePath(
  path: string,
  operation: FileOperationType,
): PathCheckResult {
  // TODO: extract from utils/permissions/pathValidation.ts
  throw new Error("TODO: extract from utils/permissions/pathValidation.ts");
}

// Check if path is allowed given permission rules and operation type
export function isPathAllowed(
  path: string,
  operation: FileOperationType,
  workingDirectory: string,
): boolean {
  // TODO: extract from utils/permissions/pathValidation.ts
  throw new Error("TODO: extract from utils/permissions/pathValidation.ts");
}

// Safe tilde expansion — only ~ and ~/ are safe, rejects ~user, ~+, ~-
export function expandTilde(path: string): string {
  // TODO: extract from utils/permissions/pathValidation.ts
  throw new Error("TODO: extract from utils/permissions/pathValidation.ts");
}

// Blocks deletion of root, Windows drive roots, user home, root children, wildcards
export function isDangerousRemovalPath(path: string): boolean {
  // TODO: extract from utils/permissions/pathValidation.ts
  throw new Error("TODO: extract from utils/permissions/pathValidation.ts");
}

// Case normalization for case-insensitive filesystem defense
export function normalizeCaseForComparison(path: string): string {
  // TODO: extract from utils/permissions/pathValidation.ts
  throw new Error("TODO: extract from utils/permissions/pathValidation.ts");
}

// Check if path is a Claude configuration file requiring confirmation
export function isClaudeConfigFilePath(path: string): boolean {
  // TODO: extract from utils/permissions/pathValidation.ts
  throw new Error("TODO: extract from utils/permissions/pathValidation.ts");
}
