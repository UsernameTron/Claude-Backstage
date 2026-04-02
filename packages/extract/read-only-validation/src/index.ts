/**
 * @claude-patterns/read-only-validation
 *
 * Per-flag safety classification for read-only command validation in plan mode.
 * Source: utils/shell/readOnlyCommandValidation.ts (~500 LOC)
 * KB: Section 8.7 — Read-Only Command Validation
 * Tier: Extract P2
 */

// Per-flag safety classification
export type FlagType = "none" | "number" | "string";

export interface CommandSafeFlags {
  [flag: string]: FlagType;
}

export interface ReadOnlyCommand {
  safeFlags: CommandSafeFlags;
}

// Git read-only commands with per-flag safety classification
export const GIT_READ_ONLY_COMMANDS: Readonly<Record<string, ReadOnlyCommand>> =
  {
    branch: {
      safeFlags: { "--all": "none", "--list": "none", "-v": "none" },
    },
    log: {
      safeFlags: {
        "--oneline": "none",
        "--graph": "none",
        "-n": "number",
      },
    },
    status: {
      safeFlags: { "--short": "none", "--branch": "none" },
    },
    diff: {
      safeFlags: { "--stat": "none", "--name-only": "none" },
    },
    show: {
      safeFlags: { "--stat": "none", "--name-only": "none" },
    },
    tag: { safeFlags: { "--list": "none", "-l": "none" } },
    remote: { safeFlags: { "-v": "none" } },
    stash: {
      safeFlags: { list: "none" as unknown as FlagType },
    },
  } as const;

// gh CLI read-only commands
export const GH_READ_ONLY_COMMANDS: readonly string[] = [
  "pr list",
  "pr view",
  "pr status",
  "pr checks",
  "issue list",
  "issue view",
  "issue status",
  "repo view",
  "run list",
  "run view",
];

// Check if a command matches read-only constraints for plan mode
export function checkReadOnlyConstraints(command: string): boolean {
  // TODO: extract from utils/shell/readOnlyCommandValidation.ts
  throw new Error(
    "TODO: extract from utils/shell/readOnlyCommandValidation.ts",
  );
}

// Parse command string into executable and arguments
export function parseCommand(command: string): {
  executable: string;
  args: string[];
} {
  // TODO: extract from utils/shell/readOnlyCommandValidation.ts
  throw new Error(
    "TODO: extract from utils/shell/readOnlyCommandValidation.ts",
  );
}
