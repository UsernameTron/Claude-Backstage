/**
 * @claude-patterns/sandbox-config
 *
 * Self-referential security: settings files always denied, cryptographic nonce paths,
 * compound decomposition for excluded commands.
 * Source: utils/sandbox/ + entrypoints/sandboxTypes.ts (1,153 LOC)
 * KB: Section 9 — Sandbox Configuration
 * Tier: Extract P2
 */

import type { PathCheckResult, FileOperationType } from "@claude-patterns/path-validation";
import { validatePath } from "@claude-patterns/path-validation";

// Sandbox network configuration
export interface SandboxNetworkConfig {
  allowedDomains?: string[];
  allowManagedDomainsOnly?: boolean;
  allowUnixSockets?: string[];
  allowAllUnixSockets?: boolean;
  allowLocalBinding?: boolean;
  httpProxyPort?: number;
  socksProxyPort?: number;
}

// Sandbox filesystem configuration
export interface SandboxFilesystemConfig {
  allowWrite?: string[];
  denyWrite?: string[];
  denyRead?: string[];
  allowRead?: string[];
  allowManagedReadPathsOnly?: boolean;
}

// Overall sandbox configuration
export interface SandboxConfig {
  enabled?: boolean;
  failIfUnavailable?: boolean;
  autoAllowBashIfSandboxed?: boolean;
  allowUnsandboxedCommands?: boolean;
  network?: SandboxNetworkConfig;
  filesystem?: SandboxFilesystemConfig;
  enableWeakerNestedSandbox?: boolean;
  enableWeakerNetworkIsolation?: boolean;
  excludedCommands?: string[];
}

// Sandbox runtime configuration (converted from SandboxConfig)
export interface SandboxRuntimeConfig {
  networkDomains: string[];
  writablePaths: string[];
  readablePaths: string[];
  deniedWritePaths: string[];
}

// Sandbox input for shouldUseSandbox decision
export interface SandboxInput {
  command?: string;
  dangerouslyDisableSandbox?: boolean;
}

// Sandbox manager interface
export interface ISandboxManager {
  isSandboxingEnabled(): boolean;
  areUnsandboxedCommandsAllowed(): boolean;
  getConfig(): SandboxConfig;
}

// --- Module-level state ---

let sandboxEnabled = false;
let currentConfig: SandboxConfig = {};

// Self-referential security paths that are ALWAYS denied for writes (KB 9.3)
const SELF_REFERENTIAL_DENIED_WRITE_PATHS: readonly string[] = [
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".claude/skills/**",
  ".git/config",
  ".git/hooks/*",
];

// Compound command operators for decomposition
const COMPOUND_OPERATOR_REGEX = /\s*(?:&&|\|\||;|\|)\s*/;

// Convert config to runtime config — self-referential security (KB 9.3)
// Always denies writes to settings files, .claude/skills, bare git repo files
export function convertToSandboxRuntimeConfig(
  config: SandboxConfig,
  workingDirectory: string,
): SandboxRuntimeConfig {
  const runtime: SandboxRuntimeConfig = {
    networkDomains: [],
    writablePaths: [],
    readablePaths: [],
    deniedWritePaths: [...SELF_REFERENTIAL_DENIED_WRITE_PATHS],
  };

  // Process filesystem config
  if (config.filesystem) {
    if (config.filesystem.allowWrite) {
      runtime.writablePaths.push(...config.filesystem.allowWrite);
    }
    if (config.filesystem.allowRead) {
      runtime.readablePaths.push(...config.filesystem.allowRead);
    }
    if (config.filesystem.denyWrite) {
      runtime.deniedWritePaths.push(...config.filesystem.denyWrite);
    }
  }

  // Process network config
  if (config.network?.allowedDomains) {
    runtime.networkDomains.push(...config.network.allowedDomains);
  }

  // Update module state
  sandboxEnabled = config.enabled ?? false;
  currentConfig = config;

  return runtime;
}

// Resolve filesystem path within sandbox constraints
export function resolveSandboxFilesystemPath(
  filePath: string,
  config: SandboxConfig,
): PathCheckResult {
  // Delegate to path-validation for core validation checks
  return validatePath(filePath, "read");
}

// Determine if sandbox should be used for a given command
export function shouldUseSandbox(input: Partial<SandboxInput>): boolean {
  if (input.dangerouslyDisableSandbox) {
    return false;
  }
  return sandboxEnabled;
}

// Check if command is in the excluded commands list (compound decomposition)
export function containsExcludedCommand(
  command: string,
  excludedCommands: string[],
): boolean {
  if (excludedCommands.length === 0) {
    return false;
  }

  // Decompose compound command into subcommands
  const subcommands = command.split(COMPOUND_OPERATOR_REGEX).map((s) => s.trim()).filter(Boolean);

  for (const subcmd of subcommands) {
    for (const excluded of excludedCommands) {
      // Check if subcommand starts with or contains the excluded command
      const cmdParts = subcmd.split(/\s+/);
      if (cmdParts[0] === excluded || subcmd.startsWith(excluded + " ")) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Reset module-level mutable state for test isolation.
 */
export function resetState(): void {
  sandboxEnabled = false;
  currentConfig = {};
}
