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
      safeFlags: { list: "none" satisfies FlagType },
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

// System commands that are inherently read-only
const SYSTEM_READ_ONLY_COMMANDS: ReadonlySet<string> = new Set([
  "cat",
  "ls",
  "head",
  "tail",
  "wc",
  "echo",
  "find",
]);

/**
 * Parse command string into executable and arguments.
 * Splits on whitespace, handles extra spaces.
 */
export function parseCommand(command: string): {
  executable: string;
  args: string[];
} {
  const parts = command.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { executable: "", args: [] };
  }
  return {
    executable: parts[0],
    args: parts.slice(1),
  };
}

/**
 * Check if a command matches read-only constraints for plan mode.
 * Validates git commands against GIT_READ_ONLY_COMMANDS with safe flags,
 * gh commands against GH_READ_ONLY_COMMANDS, and allows certain system commands.
 */
export function checkReadOnlyConstraints(command: string): boolean {
  const parsed = parseCommand(command);
  const { executable, args } = parsed;

  // Check git commands
  if (executable === "git") {
    if (args.length === 0) return false;
    const subcommand = args[0];
    const cmdDef = GIT_READ_ONLY_COMMANDS[subcommand];
    if (!cmdDef) return false;

    // Validate remaining args are safe flags or their values
    const flags = args.slice(1);
    let i = 0;
    while (i < flags.length) {
      const flag = flags[i];
      // Allow non-flag arguments (e.g., file paths, refs)
      if (!flag.startsWith("-")) {
        i++;
        continue;
      }
      const flagType = cmdDef.safeFlags[flag];
      if (flagType === undefined) return false;
      // If flag takes a value, skip the next arg
      if (flagType === "number" || flagType === "string") {
        i += 2;
      } else {
        i++;
      }
    }
    return true;
  }

  // Check gh commands
  if (executable === "gh") {
    if (args.length < 2) return false;
    const ghSubcommand = `${args[0]} ${args[1]}`;
    return GH_READ_ONLY_COMMANDS.includes(ghSubcommand);
  }

  // Check system read-only commands
  if (SYSTEM_READ_ONLY_COMMANDS.has(executable)) {
    return true;
  }

  return false;
}
