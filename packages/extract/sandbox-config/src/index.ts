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

// Convert config to runtime config — self-referential security (KB 9.3)
// Always denies writes to settings files, .claude/skills, bare git repo files
export function convertToSandboxRuntimeConfig(
  config: SandboxConfig,
  workingDirectory: string,
): SandboxRuntimeConfig {
  // TODO: extract from utils/sandbox/
  throw new Error("TODO: extract from utils/sandbox/");
}

// Resolve filesystem path within sandbox constraints
export function resolveSandboxFilesystemPath(
  path: string,
  config: SandboxConfig,
): PathCheckResult {
  // TODO: extract from utils/sandbox/
  throw new Error("TODO: extract from utils/sandbox/");
}

// Determine if sandbox should be used for a given command
export function shouldUseSandbox(input: Partial<SandboxInput>): boolean {
  // TODO: extract from utils/sandbox/
  throw new Error("TODO: extract from utils/sandbox/");
}

// Check if command is in the excluded commands list (compound decomposition)
export function containsExcludedCommand(
  command: string,
  excludedCommands: string[],
): boolean {
  // TODO: extract from utils/sandbox/
  throw new Error("TODO: extract from utils/sandbox/");
}
