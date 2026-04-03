/**
 * @claude-patterns/path-validation
 *
 * Multi-layer path validation: UNC, tilde TOCTOU, shell expansion, glob.
 * Source: utils/permissions/pathValidation.ts (485 LOC)
 * KB: Section 10 — Path Validation
 * Tier: Extract P2
 */

import os from "os";
import path from "path";

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

// Write-like operations where glob patterns are dangerous
const WRITE_OPERATIONS: ReadonlySet<FileOperationType> = new Set([
  "write",
  "create",
  "delete",
]);

// Dangerous root paths that should never be targets for removal
const DANGEROUS_ROOTS = new Set([
  "/",
  "/home",
  "/Users",
  "/root",
  "/var",
  "/etc",
  "/usr",
  "/bin",
  "/sbin",
  "/opt",
]);

/**
 * Multi-layer path validation (UNC, tilde, shell expansion, glob).
 * Runs 4 sequential checks and returns a PathCheckResult.
 */
export function validatePath(
  filePath: string,
  operation: FileOperationType,
): PathCheckResult {
  const checks = {
    uncPath: true,
    tildeExpansion: true,
    shellExpansion: true,
    globPattern: true,
  };
  const reasons: string[] = [];

  // Check 1: UNC path detection (\\server\share)
  if (filePath.startsWith("\\\\")) {
    checks.uncPath = false;
    reasons.push("UNC paths are blocked to prevent credential leakage");
  }

  // Check 2: Tilde expansion safety
  // Allow ~ and ~/ but reject ~user patterns
  if (filePath.startsWith("~") && !filePath.startsWith("~/") && filePath !== "~") {
    checks.tildeExpansion = false;
    reasons.push("Unsafe tilde expansion: ~user patterns are not allowed");
  }

  // Check 3: Shell expansion detection ($VAR, ${VAR}, $(cmd))
  if (/\$\w|\$\{|\$\(/.test(filePath)) {
    checks.shellExpansion = false;
    reasons.push("Shell variable/command expansion detected in path");
  }

  // Check 4: Glob pattern detection for write operations
  if (WRITE_OPERATIONS.has(operation) && /[*?[]/.test(filePath)) {
    checks.globPattern = false;
    reasons.push("Glob patterns are not allowed in write/create/delete operations");
  }

  const allowed = checks.uncPath && checks.tildeExpansion && checks.shellExpansion && checks.globPattern;

  return {
    allowed,
    reason: allowed ? "Path validation passed" : reasons.join("; "),
    checks,
  };
}

/**
 * Check if path is allowed given permission rules and operation type.
 * Validates path is within working directory and passes validatePath checks.
 */
export function isPathAllowed(
  filePath: string,
  operation: FileOperationType,
  workingDirectory: string,
): boolean {
  // First run validation checks
  const validation = validatePath(filePath, operation);
  if (!validation.allowed) {
    return false;
  }

  // Expand tilde and resolve path
  const expanded = expandTilde(filePath);
  const resolved = path.resolve(workingDirectory, expanded);
  const normalizedWorkDir = path.resolve(workingDirectory);

  // Check containment: resolved path must start with working directory
  return resolved.startsWith(normalizedWorkDir + path.sep) || resolved === normalizedWorkDir;
}

/**
 * Safe tilde expansion -- only ~ and ~/ are safe.
 * Rejects ~user, ~+, ~- by returning them unchanged.
 */
export function expandTilde(filePath: string): string {
  if (filePath === "~") {
    return os.homedir();
  }
  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Blocks deletion of root, Windows drive roots, user home, root children, wildcards.
 */
export function isDangerousRemovalPath(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const homeDir = os.homedir();

  // Exact match against dangerous roots
  if (DANGEROUS_ROOTS.has(resolved)) {
    return true;
  }

  // Windows drive root check (C:\, D:\, etc.)
  if (/^[A-Z]:\\$/i.test(resolved)) {
    return true;
  }

  // User home directory
  if (resolved === homeDir) {
    return true;
  }

  // Paths with glob wildcards are dangerous for deletion
  if (/[*?[]/.test(filePath)) {
    return true;
  }

  return false;
}

/**
 * Case normalization for case-insensitive filesystem defense.
 * Lowercases on darwin (macOS) and win32. Identity on Linux.
 */
export function normalizeCaseForComparison(filePath: string): string {
  if (process.platform === "darwin" || process.platform === "win32") {
    return filePath.toLowerCase();
  }
  return filePath;
}

/**
 * Check if path is a Claude configuration file requiring confirmation.
 * Matches .claude/ directory paths and dangerous file basenames.
 */
export function isClaudeConfigFilePath(filePath: string): boolean {
  // Check for .claude/ directory
  if (filePath.includes(".claude/") || filePath.includes(".claude\\")) {
    return true;
  }

  // Check basename against dangerous files
  const basename = path.basename(filePath);
  if (DANGEROUS_FILES.includes(basename)) {
    return true;
  }

  return false;
}
